import { ChatGPTAPI } from "chatgpt";
import Keyv from "keyv";

import KeyvRedis from "@keyv/redis";

if (!process.env.REDIS_URL || !process.env.OPENAI_API_KEY) {
  throw new Error("REDIS_URL or OPENAI_API_KEY not set");
}

const store = new KeyvRedis(process.env.REDIS_URL);
export const messageStore = new Keyv({
  store,
});
messageStore.on("error", (err) => console.error("[Keyv Error]", err));

export const chatAPI = new ChatGPTAPI({
  apiKey: process.env.OPENAI_API_KEY,
  completionParams: {
    temperature: Number(process.env.TEMPERATURE ?? 0.5),
  },
  debug: true,
  maxResponseTokens: 1000,
  systemMessage: process.env.SYSTEM_MESSAGE,
  messageStore,
});
