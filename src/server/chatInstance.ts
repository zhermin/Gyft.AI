import { ChatGPTAPI } from "chatgpt";
import Keyv from "keyv";

import KeyvMysql from "@keyv/mysql";

console.log(process.env.CA);
console.log(process.env.CLIENT_CERT);
console.log(process.env.CLIENT_KEY);

const store = new KeyvMysql(process.env.DATABASE_URL);
export const messageStore = new Keyv({
  store,
  table: "Message",
  ssl: {
    ca: process.env.CA,
    cert: process.env.CLIENT_CERT,
    key: process.env.CLIENT_KEY,
  },
});

messageStore.on("error", (err) => console.error("[Keyv Error]", err));

export const chatAPI = new ChatGPTAPI({
  apiKey: process.env.OPENAI_API_KEY ?? "",
  completionParams: {
    temperature: Number(process.env.TEMPERATURE ?? 0.5),
  },
  debug: true,
  maxResponseTokens: 1000,
  systemMessage: process.env.SYSTEM_MESSAGE,
  messageStore,
});
