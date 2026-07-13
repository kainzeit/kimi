import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { listArticles, getArticleBySlug, createArticle, updateArticle, deleteArticle } from "./db";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  articles: router({
    list: publicProcedure
      .input(z.object({ category: z.string() }))
      .query(async ({ input }) => listArticles(input.category)),
    
    get: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => getArticleBySlug(input.slug)),
    
    create: protectedProcedure
      .input(z.object({
        slug: z.string(),
        title: z.string(),
        content: z.string(),
        category: z.enum(["a-whim", "imagination"]),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Only admins can create articles");
        }
        return createArticle({
          ...input,
          authorId: ctx.user.id,
        });
      }),
    
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        slug: z.string().optional(),
        title: z.string().optional(),
        content: z.string().optional(),
        category: z.enum(["a-whim", "imagination"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Only admins can update articles");
        }
        const { id, ...data } = input;
        return updateArticle(id, data);
      }),
    
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Only admins can delete articles");
        }
        return deleteArticle(input.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;
