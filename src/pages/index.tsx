import type { NextPage } from "next";
import { signIn, signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import Chatbox from "~/components/Chatbox";

const Home: NextPage = () => {
  return (
    <>
      <Head>
        <title>Gyft.AI — Your Personal Gift Assistant</title>
        <meta
          name="description"
          content="Gyft.AI is an intelligent assistant who will recommend you the perfect gift for you and your loved ones and delivering that in a seamless end-to-end gifting service."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#15162c] to-[#127c42] py-16 pb-4">
        <div className="container flex flex-col items-center justify-center gap-6 px-4">
          <div className="flex flex-col items-center justify-center">
            <svg
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 fill-white"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4.5 0C3.11929 0 2 1.11929 2 2.5V2.78571C2 3.23408 2.13327 3.65133 2.36235 4H1.5C0.671573 4 0 4.67157 0 5.5V6.5C0 7.32843 0.671573 8 1.5 8H7V4H8V8H13.5C14.3284 8 15 7.32843 15 6.5V5.5C15 4.67157 14.3284 4 13.5 4H12.6377C12.8667 3.65133 13 3.23408 13 2.78571V2.5C13 1.11929 11.8807 0 10.5 0C9.22684 0 8.11245 0.679792 7.5 1.69621C6.88755 0.679792 5.77316 0 4.5 0ZM8 4H10.7857C11.4563 4 12 3.45635 12 2.78571V2.5C12 1.67157 11.3284 1 10.5 1C9.11929 1 8 2.11929 8 3.5V4ZM7 4H4.21429C3.54365 4 3 3.45635 3 2.78571V2.5C3 1.67157 3.67157 1 4.5 1C5.88071 1 7 2.11929 7 3.5V4Z"
              />
              <path d="M7 9H1V12.5C1 13.8807 2.11929 15 3.5 15H7V9Z" />
              <path d="M8 15H11.5C12.8807 15 14 13.8807 14 12.5V9H8V15Z" />
            </svg>
            <h1 className="bg-gradient-to-r from-green-200 to-green-500 bg-clip-text p-5 text-5xl font-extrabold tracking-tight text-transparent sm:text-[5rem]">
              Gyft.AI
            </h1>
            <h3 className="font-bold text-green-200 sm:text-lg">
              Connects | Understands | Delivers
            </h3>

            <Auth />

            <div
              className="mt-6 flex rounded-lg bg-white/30 p-4 text-sm text-white"
              role="alert"
            >
              <svg
                aria-hidden="true"
                className="mr-3 inline h-5 w-5 flex-shrink-0 fill-yellow-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                ></path>
              </svg>
              <span className="sr-only">Info</span>
              <div>
                <span className="mr-2 font-medium text-yellow-400">
                  Disclaimer!
                </span>
                This is an MVP showcase, recommended products might not exist.
              </div>
            </div>
          </div>

          <Chatbox />
        </div>
      </main>
    </>
  );
};

export default Home;

const Auth: React.FC = () => {
  const { data: sessionData } = useSession();

  return (
    <button
      className="mt-8 flex items-center justify-center gap-4 rounded-full bg-white/10 py-3 pl-4 pr-6 text-white no-underline transition hover:bg-white/20"
      onClick={sessionData ? () => void signOut() : () => void signIn("google")}
    >
      {sessionData && (
        <>
          <Image
            width="100"
            height="100"
            src={sessionData?.user?.image as string}
            alt="User"
            className="h-8 w-8 rounded-full"
          />
        </>
      )}

      {sessionData ? (
        <span>
          Sign Out of{" "}
          <pre className="ml-0.5 inline">
            {sessionData.user?.email as string}
          </pre>
        </span>
      ) : (
        <span className="pl-2">Sign in to save your chat history</span>
      )}
    </button>
  );
};
