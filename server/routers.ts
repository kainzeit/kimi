import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  listArticles, getArticleBySlug, createArticle, updateArticle, deleteArticle,
  getPageContent, updatePageContent,
  listImages, deleteImage,
  createAccessLog, listAccessLogs,
  incrementArticleView, listArticleViews,
  getSiteConfig, setSiteConfig,
} from "./db";
import { z } from "zod";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
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
        publishedAt: z.string().optional(),
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
      .mutation(async ({ input }) => deleteArticle(input.id)),
  }),

  pages: router({
    getContent: publicProcedure
      .input(z.object({ pageKey: z.string() }))
      .query(async ({ input }) => getPageContent(input.pageKey)),

    updateContent: publicProcedure
      .input(z.object({ pageKey: z.string(), content: z.string() }))
      .mutation(async ({ input }) => updatePageContent(input.pageKey, input.content)),
  }),

  images: router({
    list: publicProcedure
      .input(z.object({ pageKey: z.string().optional() }))
      .query(async ({ input }) => listImages(input.pageKey)),

    delete: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => deleteImage(input.id)),
  }),

  // Greeting gate: verify the visitor's input against the stored keyword
  greeting: router({
    verify: publicProcedure
      .input(z.object({ input: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const keyword = (await getSiteConfig("greeting_keyword")) ?? "hi";
        const prompt = (await getSiteConfig("greeting_prompt")) ?? "please say hi to enter";
        const accepted = keyword.toLowerCase().split(",").map(k => k.trim());
        const success = accepted.includes(input.input.trim().toLowerCase());

        // Log the attempt
        const ip =
          (ctx.req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
          (ctx.req as any).socket?.remoteAddress ||
          "unknown";
        await createAccessLog({
          ip,
          userAgent: ctx.req.headers["user-agent"] ?? null,
          input: input.input,
          success: success ? "yes" : "no",
        });

        return { success, prompt };
      }),

    // Return the current prompt text (no keyword exposed to public)
    getPrompt: publicProcedure.query(async () => {
      const prompt = (await getSiteConfig("greeting_prompt")) ?? "please say hi to enter";
      return { prompt };
    }),
  }),

  // Admin: access logs and article view stats
  admin: router({
    accessLogs: publicProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ input }) => listAccessLogs(input.limit ?? 100)),

    articleViews: publicProcedure
      .query(async () => listArticleViews()),

    // Site config CRUD (greeting prompt + keyword)
    getConfig: publicProcedure
      .input(z.object({ key: z.string() }))
      .query(async ({ input }) => getSiteConfig(input.key)),

    setConfig: publicProcedure
      .input(z.object({ key: z.string(), value: z.string() }))
      .mutation(async ({ input }) => setSiteConfig(input.key, input.value)),
  }),

  // Article view tracking
  views: router({
    increment: publicProcedure
      .input(z.object({ slug: z.string() }))
      .mutation(async ({ input }) => {
        await incrementArticleView(input.slug);
        return { ok: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
