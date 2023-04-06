import { ChatGPTAPI } from "chatgpt";
// import fs from "fs";
import Keyv from "keyv";

import KeyvMysql from "@keyv/mysql";

// import path from "path";

const store = new KeyvMysql(process.env.DATABASE_URL);
export const messageStore = new Keyv({
  store,
  table: "Message",
  // ssl: {
  //   rejectUnauthorized: false,
  //   ca: fs
  //     .readFileSync(path.join(process.cwd(), "certs", "ca.pem"))
  //     .toString(),
  //   key: fs
  //     .readFileSync(path.join(process.cwd(), "certs", "client-key.pem"))
  //     .toString(),
  //   cert: fs
  //     .readFileSync(path.join(process.cwd(), "certs", "client-cert.pem"))
  //     .toString(),
  // },
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
