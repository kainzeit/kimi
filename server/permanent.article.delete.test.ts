import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@example.com",
      name: "Admin User",
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

describe("Article recycle permanent deletion", () => {
  it("permanently deletes only an article that was moved into recycle", async () => {
    const caller = appRouter.createCaller(createContext());
    const slug = `permanent-delete-${Date.now()}`;

    await caller.articles.create({
      slug,
      title: "Temporary recycle fixture",
      content: "This record is created and removed by the recycle test.",
      category: "a-whim",
      isDraft: true,
    });

    const created = (await caller.articles.list({ category: "a-whim", includeHidden: true }))
      .find((article: any) => article.slug === slug);
    expect(created).toBeDefined();

    await caller.articles.softDelete({ id: created!.id });
    const deleted = await caller.articles.listDeleted({});
    expect(deleted.some((article: any) => article.id === created!.id)).toBe(true);

    await caller.articles.permanentlyDelete({ id: created!.id });
    const deletedAfterPermanentDelete = await caller.articles.listDeleted({});
    const allAfterPermanentDelete = await caller.articles.list({
      category: "a-whim",
      includeHidden: true,
      includeDeleted: true,
    });

    expect(deletedAfterPermanentDelete.some((article: any) => article.id === created!.id)).toBe(false);
    expect(allAfterPermanentDelete.some((article: any) => article.id === created!.id)).toBe(false);
  });
});
