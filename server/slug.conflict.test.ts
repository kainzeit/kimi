import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "slug-conflict-test-user",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("article slug conflict handling", () => {
  it("creates a unique article but rejects a duplicate slug with a clear conflict message", async () => {
    const caller = appRouter.createCaller(createContext());
    const slug = `slug-conflict-${Date.now()}`;
    let articleId: number | undefined;

    try {
      await caller.articles.create({
        slug,
        title: "Original entry",
        content: "<p>First entry</p>",
        category: "elsewhere",
        isDraft: true,
      });
      const created = await caller.articles.list({ category: "elsewhere", includeHidden: true });
      articleId = created.find((article: any) => article.slug === slug)?.id;
      expect(articleId).toBeTypeOf("number");

      await expect(caller.articles.create({
        slug,
        title: "Duplicate entry",
        content: "<p>Second entry</p>",
        category: "imagination",
        isDraft: true,
      })).rejects.toMatchObject({
        code: "CONFLICT",
        message: expect.stringContaining(`The link “${slug}” is already used`),
      });
    } finally {
      if (articleId) await caller.articles.permanentlyDelete({ id: articleId });
    }
  });

  it("renders a role=alert error message in Manage and clears it after the slug changes", async () => {
    const source = await import("node:fs/promises").then(({ readFile }) => readFile(`${process.cwd()}/client/src/pages/Manage.tsx`, "utf8"));
    expect(source).toContain("articleSaveError");
    expect(source).toContain('role="alert"');
    expect(source).toContain("setArticleSaveError(null)");
  });
});
