import { ChatGPTAPI, ChatGPTError } from "chatgpt";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "~/server/auth";
import { prisma } from "~/server/db";

import type { NextApiRequest, NextApiResponse } from "next";

const api = new ChatGPTAPI({
  apiKey: process.env.OPENAI_API_KEY ?? "",
  completionParams: {
    temperature: 0.5,
  },
  debug: true,
  maxResponseTokens: 500,
  systemMessage: process.env.SYSTEM_MESSAGE,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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

    const completion = await api.sendMessage(message, {
      parentMessageId: id ? id : undefined,
    });
    console.log("[COMPLETION RESPONSE]", completion);

    const session = await getServerSession(req, res, authOptions);
    if (session) {
      await prisma.message.create({
        data: {
          userId: session.user.id,
          content: message,
          from: "user",
          parentMessageId: completion.id,
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
