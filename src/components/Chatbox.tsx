import { useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { api } from "~/utils/api";

import type { Message } from "@prisma/client";

type MessageType = {
  from: "gyft" | "user";
  message: string;
};

type ChatResponseType = {
  result: string;
  id: string;
};

export default function Chatbox() {
  const session = useSession();

  const { data: chatHistory } = api.chat.getChatHistory.useQuery(undefined, {
    enabled: session?.data?.user !== undefined,
  });
  const mutation = api.chat.clearChatHistory.useMutation({
    onSuccess: () => {
      setMessages([]);
      setMessage("");
      setId(undefined);
    },
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [id, setId] = useState<string>();

  const welcomeMessage: MessageType = {
    from: "gyft",
    message:
      "Hi, I'm Gyft! I'm here to help you find the perfect gift for you or your loved ones. What's the occasion?",
  };

  const [messages, setMessages] = useState<MessageType[]>(
    chatHistory?.map(
      (message: Message) =>
        ({
          from: message.from,
          message: message.content,
        } as MessageType)
    ) ?? []
  );

  useEffect(() => {
    if (chatHistory) {
      setMessages(
        chatHistory.map(
          (message: Message) =>
            ({
              from: message.from,
              message: message.content,
            } as MessageType)
        )
      );
      setId(chatHistory[chatHistory.length - 1]?.parentMessageId ?? undefined);
    }
  }, [chatHistory]);

  const messagesEndRef = useRef(null as null | HTMLDivElement);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      setLoading(true);

      if (message.trim() === "") {
        alert("Please enter a message");
        setMessage("");
        setLoading(false);
        return;
      }
      setMessages((messages) => [
        ...messages,
        { from: "user", message: message.trim() },
      ]);
      setMessage("");

      const resonse = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ message, id }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(resonse);
      if (!resonse.ok) throw new Error(resonse.statusText);
      const data = (await resonse.json()) as ChatResponseType;

      setMessages((messages) => [
        ...messages,
        { from: "gyft", message: data.result },
      ]);
      setId(data.id);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setMessages([
        ...messages,
        { from: "user", message },
        {
          from: "gyft",
          message: "Sorry, there has been an error, please try again later",
        },
      ]);
      setMessage("");
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-1 flex-col justify-between p-2 sm:p-6">
      <div
        id="messages"
        className="scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch flex flex-col space-y-4 overflow-y-auto sm:p-3"
      >
        {[welcomeMessage, ...messages].map((message, index) =>
          message.from === "user" ? (
            <div
              className="flex items-end justify-end selection:bg-green-100 selection:text-black"
              key={index}
            >
              <div className="order-1 mx-2 flex max-w-sm flex-col items-end space-y-3">
                <ReactMarkdown className="prose prose-sm inline-block rounded-lg rounded-br-none bg-teal-500 px-4 py-2 text-white">
                  {message.message}
                </ReactMarkdown>
              </div>
              <Image
                width="100"
                height="100"
                src={session?.data?.user?.image || "/blank.jpg"}
                alt="User"
                className="order-2 h-8 w-8 rounded-full border-2 border-green-100"
              />
            </div>
          ) : message.from === "gyft" ? (
            <div className="flex items-end" key={index}>
              <div className="order-2 mx-2 flex max-w-sm flex-col items-start space-y-3 selection:bg-green-800 selection:text-white sm:max-w-full">
                <ReactMarkdown className="prose prose-sm inline-block rounded-lg rounded-bl-none bg-gray-50 px-4 py-2 text-gray-600">
                  {message.message}
                </ReactMarkdown>
              </div>
              <Image
                width="100"
                height="100"
                src="/logo-circle.png"
                alt="Gyft.AI"
                className="order-1 h-8 w-8 rounded-full border-2 border-green-100"
              />
            </div>
          ) : null
        )}

        {loading && (
          <div className="flex items-end">
            <div className="order-2 mx-2 inline-block flex-col items-start space-y-3 rounded-lg rounded-bl-none bg-gray-50 px-4 py-2">
              <div className="flex animate-pulse space-x-4">
                <div className="flex-1 space-y-6 py-1">
                  <div className="h-2 w-60 rounded bg-slate-300 sm:w-96"></div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2 h-2 rounded bg-slate-300"></div>
                      <div className="col-span-1 h-2 rounded bg-slate-300"></div>
                    </div>
                    <div className="h-2 rounded bg-slate-300"></div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-1 h-2 rounded bg-slate-300"></div>
                      <div className="col-span-2 h-2 rounded bg-slate-300"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <Image
              width="100"
              height="100"
              src="/logo-circle.png"
              alt="Gyft.AI"
              className="order-1 h-8 w-8 rounded-full border-2 border-green-100"
            />
          </div>
        )}
      </div>

      <div className="mt-4 border-t-2 border-gray-300 pt-6 sm:mb-0">
        <div className="relative flex items-center justify-center gap-2 align-middle">
          <button
            className="mr-2 rounded-full bg-slate-50 p-2"
            onClick={() => {
              if (
                confirm(
                  "Are you sure you want to clear your entire chat history?"
                )
              ) {
                if (session.status === "authenticated") {
                  mutation.mutate();
                }
                setMessages([]);
                setMessage("");
                setId(undefined);
              }
            }}
          >
            <svg
              viewBox="0 0 50 50"
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 fill-gray-600"
            >
              <path d="M46.4375 0.03125C45.539063 0.0390625 44.695313 0.398438 44.21875 1.125L36.625 15.40625C37.1875 15.601563 38.453125 16.164063 42.65625 18.0625L42.71875 18.09375C43.445313 18.421875 44 18.65625 44.21875 18.75C44.292969 18.785156 44.363281 18.839844 44.4375 18.875L49.96875 3.5625C50.316406 2.351563 49.449219 0.957031 48.0625 0.40625C47.546875 0.148438 46.976563 0.0273438 46.4375 0.03125 Z M 4 8C1.792969 8 0 9.792969 0 12C0 14.207031 1.792969 16 4 16C6.207031 16 8 14.207031 8 12C8 9.792969 6.207031 8 4 8 Z M 13 11C11.894531 11 11 11.894531 11 13C11 14.105469 11.894531 15 13 15C14.105469 15 15 14.105469 15 13C15 11.894531 14.105469 11 13 11 Z M 32.15625 16.625C30.222656 16.769531 28.539063 17.730469 27.34375 19.40625C28.097656 20.675781 29.417969 22.226563 31.28125 22.1875C31.773438 22.167969 32.1875 22.523438 32.28125 23C32.660156 23.589844 34.988281 24.636719 35.65625 24.375C35.9375 24.265625 36.238281 24.289063 36.5 24.4375C36.761719 24.585938 36.949219 24.828125 37 25.125C37.039063 25.289063 37.476563 25.863281 38.375 26.28125C39.082031 26.609375 39.769531 26.691406 40.15625 26.5C40.40625 26.375 40.679688 26.371094 40.9375 26.46875C41.199219 26.566406 41.425781 26.773438 41.53125 27.03125C42.207031 28.679688 45.292969 28.800781 47.40625 28.625C47.714844 27.285156 47.632813 25.890625 47.15625 24.59375C46.496094 22.808594 45.1875 21.398438 43.40625 20.59375C43.21875 20.511719 42.613281 20.222656 41.84375 19.875C38.28125 18.265625 36.269531 17.390625 35.875 17.28125C34.570313 16.765625 33.316406 16.539063 32.15625 16.625 Z M 11.5 18C8.46875 18 6 20.46875 6 23.5C6 26.53125 8.46875 29 11.5 29C14.53125 29 17 26.53125 17 23.5C17 20.46875 14.53125 18 11.5 18 Z M 26.28125 21.40625C25.96875 22.148438 25.613281 22.84375 25.25 23.5C25.679688 24.546875 26.949219 26.972656 29.28125 26.4375C29.550781 26.375 29.835938 26.410156 30.0625 26.5625C30.292969 26.714844 30.421875 26.949219 30.46875 27.21875C30.535156 27.59375 30.976563 28.039063 31.59375 28.375C32.46875 28.847656 33.414063 28.953125 33.8125 28.78125C34.074219 28.667969 34.367188 28.660156 34.625 28.78125C34.882813 28.902344 35.078125 29.132813 35.15625 29.40625C35.296875 29.882813 35.789063 30.371094 36.46875 30.71875C37.269531 31.125 38.183594 31.273438 38.78125 31.0625C39.242188 30.902344 39.734375 31.097656 39.96875 31.53125C40.851563 33.167969 43.75 33.34375 46 33.1875C46.285156 32.375 46.550781 31.539063 46.8125 30.65625C46.542969 30.671875 46.261719 30.6875 45.96875 30.6875C43.875 30.6875 41.371094 30.273438 40.125 28.5625C39.28125 28.675781 38.3125 28.492188 37.34375 28C36.640625 27.640625 35.867188 27.089844 35.40625 26.40625C34.132813 26.40625 32.667969 25.699219 31.9375 25.25C31.371094 24.902344 30.929688 24.558594 30.65625 24.1875C28.671875 24.003906 27.253906 22.710938 26.28125 21.40625 Z M 24 25.46875C17.800781 34.082031 7.214844 33.828125 7.09375 33.8125C6.699219 33.777344 6.3125 33.988281 6.125 34.34375C5.9375 34.699219 5.964844 35.125 6.21875 35.4375C8.003906 37.640625 9.921875 39.503906 11.875 41.09375C12.796875 41.277344 18.597656 42.097656 24.34375 35.4375C24.703125 35.019531 25.332031 34.984375 25.75 35.34375C26.167969 35.703125 26.203125 36.332031 25.84375 36.75C21.835938 41.394531 17.609375 42.847656 14.65625 43.15625C17.125 44.820313 19.613281 46.078125 21.9375 47.03125C23.414063 46.722656 28.367188 45.242188 32.75 38.5625C33.054688 38.101563 33.695313 37.945313 34.15625 38.25C34.617188 38.554688 34.742188 39.195313 34.4375 39.65625C31.132813 44.691406 27.515625 47.054688 24.96875 48.15625C30.167969 49.839844 34.046875 49.988281 34.375 50L34.40625 50C34.59375 50 34.777344 49.945313 34.9375 49.84375C35.21875 49.667969 41.007813 45.886719 45.25 35.25C45.085938 35.253906 44.917969 35.28125 44.75 35.28125C42.5625 35.28125 40.035156 34.839844 38.65625 33.125C37.6875 33.242188 36.578125 33.019531 35.5625 32.5C34.734375 32.074219 34.078125 31.503906 33.65625 30.84375C32.59375 30.933594 31.445313 30.550781 30.65625 30.125C29.84375 29.683594 29.207031 29.128906 28.84375 28.5C26.542969 28.621094 24.945313 27.054688 24 25.46875Z" />
            </svg>
          </button>
          <form onSubmit={handleSubmit} className="w-full">
            <textarea
              placeholder={
                !loading ? "Hey Gyft, what should I get for..." : "Loading..."
              }
              className="w-full rounded-md bg-gray-50 py-3 pl-4 pr-10 text-sm text-gray-600 placeholder-gray-400 selection:bg-green-800 selection:text-white focus:placeholder-gray-500 focus:outline-none disabled:opacity-80"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
              maxLength={300}
            />
            <div className="absolute inset-y-1/3 right-0 items-center">
              <button type="submit" className="mx-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  className="h-5 w-5 rotate-90 transform fill-teal-600 hover:fill-teal-800"
                >
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>
      <div ref={messagesEndRef} />
    </div>
  );
}
