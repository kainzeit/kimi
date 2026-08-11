import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-user",
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

describe("Draft and Published State Transitions and Public Query Filtering", () => {
  it("executes setDraft on articles and images and verifies state contracts", async () => {
    const caller = appRouter.createCaller(createContext());

    const articles = await caller.articles.list({ category: "a-whim", includeHidden: true });
    if (articles.length > 0) {
      const art = articles[0]!;
      const originalDraft = Boolean(art.isDraft);

      // Toggle draft status
      await caller.articles.setDraft({ id: art.id, isDraft: !originalDraft });
      const updatedArticles = await caller.articles.list({ category: "a-whim", includeHidden: true });
      const updatedArt = updatedArticles.find((a: any) => a.id === art.id);
      expect(Boolean(updatedArt?.isDraft)).toBe(!originalDraft);

      // Restore original draft status
      await caller.articles.setDraft({ id: art.id, isDraft: Boolean(originalDraft) });
    }

    const images = await caller.images.list({ pageKey: "home", includeHidden: true });
    if (images.length > 0) {
      const img = images[0]!;
      const originalDraft = Boolean(img.isDraft);

      await caller.images.setDraft({ id: img.id, isDraft: !originalDraft });
      const updatedImages = await caller.images.list({ pageKey: "home", includeHidden: true });
      const updatedImg = updatedImages.find((i: any) => i.id === img.id);
      expect(Boolean(updatedImg?.isDraft)).toBe(!originalDraft);

      await caller.images.setDraft({ id: img.id, isDraft: Boolean(originalDraft) });
    }
  });

  it("moves an article into recycle and restores it back to the Manage article list", async () => {
    const caller = appRouter.createCaller(createContext());
    const articles = await caller.articles.list({ category: "a-whim", includeHidden: true });
    const article = articles[0];

    if (!article) {
      expect(articles).toEqual([]);
      return;
    }

    try {
      await caller.articles.softDelete({ id: article.id });
      const deleted = await caller.articles.listDeleted({});
      expect(deleted.some((item: any) => item.id === article.id && item.category === "a-whim")).toBe(true);

      await caller.articles.restore({ id: article.id });
      const deletedAfterRestore = await caller.articles.listDeleted({});
      const restoredArticles = await caller.articles.list({ category: "a-whim", includeHidden: true });

      expect(deletedAfterRestore.some((item: any) => item.id === article.id)).toBe(false);
      expect(restoredArticles.some((item: any) => item.id === article.id)).toBe(true);
    } finally {
      const stillDeleted = await caller.articles.listDeleted({});
      if (stillDeleted.some((item: any) => item.id === article.id)) {
        await caller.articles.restore({ id: article.id });
      }
    }
  });
});
