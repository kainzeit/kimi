import { readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const projectRoot = process.cwd();

function createContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "manage-workflow-test-user",
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

describe("Manage article workflow contract", () => {
  it("exposes timed autosave, discard confirmation, selection, direct preview and Markdown export", async () => {
    const manage = await readFile(path.join(projectRoot, "client/src/pages/Manage.tsx"), "utf8");

    expect(manage).toContain("30_000");
    expect(manage).toContain('window.addEventListener("beforeunload", preventUnload)');
    expect(manage).toContain("Current content has not been saved yet");
    expect(manage).toContain("selectedArticleIds");
    expect(manage).toContain('handleBulkArticleAction("publish")');
    expect(manage).toContain('handleBulkArticleAction("hide")');
    expect(manage).toContain('handleBulkArticleAction("delete")');
    expect(manage).toContain("setPreviewArticle(article)");
    expect(manage).toContain("export markdown");
    expect(manage).toContain("URL.createObjectURL(blob)");
  });

  it("provides the router and database helpers required by batch actions and safe published-article autosaves", async () => {
    const router = await readFile(path.join(projectRoot, "server/routers.ts"), "utf8");
    const db = await readFile(path.join(projectRoot, "server/db.ts"), "utf8");

    expect(router).toContain("batchUpdate:");
    expect(router).toContain("exportMarkdown:");
    expect(router).toContain("autosave:");
    expect(router).toContain("getAutosave:");
    expect(db).toContain("batchUpdateArticles");
    expect(db).toContain("saveArticleAutosave");
    expect(db).toContain("articleAutosaves");
  });

  it("batch publishes, hides and recycles a test article while autosaving edits without changing its live content", async () => {
    const caller = appRouter.createCaller(createContext());
    const slug = `manage-workflow-${Date.now()}`;
    let articleId: number | undefined;

    try {
      await caller.articles.create({
        slug,
        title: "Manage workflow test",
        content: "<p>Published content</p>",
        category: "imagination",
        isDraft: true,
      });
      const created = await caller.articles.list({ category: "imagination", includeHidden: true });
      const article = created.find((item: any) => item.slug === slug);
      articleId = article?.id;
      expect(articleId).toBeTypeOf("number");

      await caller.articles.batchUpdate({ ids: [articleId!], action: "publish" });
      const published = (await caller.articles.list({ category: "imagination", includeHidden: true })).find((item: any) => item.id === articleId);
      expect(Boolean(published?.isDraft)).toBe(false);
      expect(Boolean(published?.isHidden)).toBe(false);

      await caller.articles.autosave({
        id: articleId!,
        slug,
        title: "Manage workflow test",
        content: "<p>Private autosave</p>",
        category: "imagination",
        publishedAt: new Date().toISOString().slice(0, 10),
      });
      const autosave = await caller.articles.getAutosave({ id: articleId! });
      const stillPublished = (await caller.articles.list({ category: "imagination", includeHidden: true })).find((item: any) => item.id === articleId);
      expect(autosave?.content).toBe("<p>Private autosave</p>");
      expect(stillPublished?.content).toBe("<p>Published content</p>");

      await caller.articles.batchUpdate({ ids: [articleId!], action: "hide" });
      const hidden = (await caller.articles.list({ category: "imagination", includeHidden: true })).find((item: any) => item.id === articleId);
      expect(Boolean(hidden?.isHidden)).toBe(true);

      await caller.articles.batchUpdate({ ids: [articleId!], action: "delete" });
      const recycled = await caller.articles.listDeleted({ category: "imagination" });
      expect(recycled.some((item: any) => item.id === articleId)).toBe(true);
    } finally {
      if (articleId) {
        await caller.articles.permanentlyDelete({ id: articleId });
      }
    }
  });
});
