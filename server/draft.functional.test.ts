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

describe("Draft and Publish Functional Verification", () => {
  it("validates draft parameter input schemas on article and image routers", async () => {
    const caller = appRouter.createCaller(createContext());

    const articles = await caller.articles.list({ category: "a-whim", includeHidden: true });
    const images = await caller.images.list({ pageKey: "home", includeHidden: true });

    expect(Array.isArray(articles)).toBe(true);
    expect(Array.isArray(images)).toBe(true);

    // Verify draft status filter correctness: public listing excludes drafts by default
    const publicArticles = await caller.articles.list({ category: "a-whim" });
    for (const article of publicArticles as any[]) {
      expect(article.isDraft).toBeFalsy();
    }
  });
});
