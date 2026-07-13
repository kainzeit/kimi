import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { listArticles, getArticleBySlug, createArticle, updateArticle, deleteArticle, getPageContent, updatePageContent, listImages, deleteImage } from "./db";
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
    
    create: publicProcedure
      .input(z.object({
        slug: z.string(),
        title: z.string(),
        content: z.string(),
        category: z.enum(["a-whim", "imagination"]),
        publishedAt: z.string().optional(), // ISO date string from manual date input
      }))
      .mutation(async ({ input }) => {
        const { publishedAt, ...rest } = input;
        return createArticle({
          ...rest,
          authorId: 0,
          publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
        });
      }),
    
    update: publicProcedure
      .input(z.object({
        id: z.number(),
        slug: z.string().optional(),
        title: z.string().optional(),
        content: z.string().optional(),
        category: z.enum(["a-whim", "imagination"]).optional(),
        publishedAt: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, publishedAt, ...rest } = input;
        return updateArticle(id, {
          ...rest,
          ...(publishedAt ? { publishedAt: new Date(publishedAt) } : {}),
        });
      }),
    
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return deleteArticle(input.id);
      }),
  }),

  pages: router({
    getContent: publicProcedure
      .input(z.object({ pageKey: z.string() }))
      .query(async ({ input }) => getPageContent(input.pageKey)),
    
    updateContent: publicProcedure
      .input(z.object({ pageKey: z.string(), content: z.string() }))
      .mutation(async ({ input }) => {
        return updatePageContent(input.pageKey, input.content);
      }),
  }),

  images: router({
    list: publicProcedure
      .input(z.object({ pageKey: z.string().optional() }))
      .query(async ({ input }) => listImages(input.pageKey)),
    
    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return deleteImage(input.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;
