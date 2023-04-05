import { z } from "zod";
import {
  createTRPCRouter, protectedProcedure, publicProcedure,
} from "~/server/api/trpc";

export const chatRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),

  getChatHistory: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.message.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    });
  }),

  clearChatHistory: protectedProcedure.mutation(({ ctx }) => {
    return ctx.prisma.message.deleteMany({
      where: {
        userId: ctx.session.user.id,
      },
    });
  }),
});
