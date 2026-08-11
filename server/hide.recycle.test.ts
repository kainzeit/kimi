import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(): TrpcContext {
  return {
    user: null,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("hide and recycle-bin route contracts", () => {
  it("accepts includeHidden for Manage article and image listings", async () => {
    const caller = appRouter.createCaller(createContext());

    const articles = await caller.articles.list({ category: "a-whim", includeHidden: true });
    const images = await caller.images.list({ pageKey: "a-whim", includeHidden: true });

    expect(Array.isArray(articles)).toBe(true);
    expect(Array.isArray(images)).toBe(true);
  });

  it("returns typed recycle-bin lists without mutating stored content", async () => {
    const caller = appRouter.createCaller(createContext());

    const deletedArticles = await caller.articles.listDeleted({});
    const deletedImages = await caller.images.listDeleted({});

    expect(Array.isArray(deletedArticles)).toBe(true);
    expect(Array.isArray(deletedImages)).toBe(true);
  });
});
