import { ChatGPTError } from "chatgpt";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "~/server/auth";
import { chatAPI } from "~/server/chatInstance";
import { prisma } from "~/server/db";

import type { NextApiRequest, NextApiResponse } from "next";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await getServerSession(req, res, authOptions);
  try {
    const { message, id } = z
      .object({
        message: z.string(),
        id: z.string().optional(),
      })
      .parse(req.body);

    if (!message || message.trim().length === 0) {
      throw new Error("Message cannot be empty");
    }

    const completion = await chatAPI.sendMessage(message, {
      parentMessageId: id ? id : undefined,
    });
    console.log("[COMPLETION RESPONSE]", completion);

    if (session && completion) {
      await prisma.message.update({
        where: {
          id: completion.parentMessageId
            ? `keyv:${completion.parentMessageId}`
            : undefined,
        },
        data: {
          userId: session.user.id,
          createdAt: new Date(),
        },
      });

      await prisma.message.update({
        where: {
          id: `keyv:${completion.id}`,
        },
        data: {
          userId: session.user.id,
          createdAt: new Date(Date.now() + 1000),
        },
      });
    }

    res.status(200).json(completion);
  } catch (error) {
    if (session) {
      await prisma.message.create({
        data: {
          userId: session?.user.id,
          value: {
            role: "assistant",
            id: "error",
            text: "Sorry, there has been an error, please try again later",
          },
        },
      });
    }

    console.error("[FULL ERROR]", error);
    if (error instanceof Error || error instanceof ChatGPTError) {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: "An error occurred during your request.",
        },
      });
    } else {
      res.status(500).json({
        error: {
          message: "An unexpected error occurred.",
        },
      });
    }
  }
}
