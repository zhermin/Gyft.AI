import { ChatGPTAPI } from "chatgpt";

export const chatAPI = new ChatGPTAPI({
  apiKey: process.env.OPENAI_API_KEY ?? "",
  completionParams: {
    temperature: Number(process.env.TEMPERATURE ?? 0.5),
  },
  debug: true,
  maxResponseTokens: 500,
  systemMessage: process.env.SYSTEM_MESSAGE,
});
