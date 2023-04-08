import { ChatGPTError } from "chatgpt";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "~/server/auth";
import { chatAPI, messageStore } from "~/server/chatInstance";
import { prisma } from "~/server/db";

import type { NextApiRequest, NextApiResponse } from "next";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  const currentTime = new Date();

  let savedUserMessage;
  const { message, id } = z
    .object({
      message: z.string().trim(),
      id: z.string().optional(),
    })
    .parse(req.body);

  console.log("[PARENT MESSAGE ID]", id);

  try {
    if (!message || message.trim().length === 0) {
      throw new Error("Message cannot be empty");
    }

    const completion = await chatAPI.sendMessage(message.trim(), {
      parentMessageId: id ? id : undefined,
    });
    console.log("[COMPLETION RESPONSE]", completion);

    if (session) {
      savedUserMessage = await prisma.message.create({
        data: {
          userId: session.user.id,
          content: message,
          from: "user",
          parentMessageId: completion.id,
          createdAt: currentTime,
        },
      });

      await prisma.message.create({
        data: {
          userId: session.user.id,
          content: completion.text,
          from: "gyft",
          parentMessageId: completion.id,
        },
      });
    }

    res.status(200).json({ result: completion.text, id: completion.id });
  } catch (error) {
    if (session) {
      if (!savedUserMessage) {
        await prisma.message.create({
          data: {
            userId: session.user.id,
            content: message,
            from: "user",
            createdAt: currentTime,
          },
        });
      }

      await prisma.message.create({
        data: {
          userId: session?.user.id,
          content: "Sorry, there has been an error, please try again later",
          from: "gyft",
        },
      });
    }

    console.error("[CHAT COMPLETION ERROR]", error);
    res.status(500).json({
      error: {
        message:
          error instanceof Error || error instanceof ChatGPTError
            ? error.message
            : "An unexpected error occurred.",
      },
    });
  }

  await new Promise<void>((resolve) =>
    setTimeout(() => {
      messageStore.disconnect();
      resolve();
    }, 1000)
  );
}
