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

describe("Rich Text Content and Style Verification", () => {
  it("persists exact inline styles, colors, and image markup through round-trip storage", async () => {
    const caller = appRouter.createCaller(createContext());
    const slug = `richtext-exact-${Date.now()}`;
    const htmlContent = '<p><span style="color: rgb(0, 128, 255);">Colored</span> <img src="https://example.com/pic.png" /></p>';

    await caller.articles.create({
      slug,
      title: "Exact HTML Test",
      content: htmlContent,
      category: "a-whim",
      isDraft: true,
    });

    const articles = await caller.articles.list({ category: "a-whim", includeHidden: true });
    const saved = articles.find((a: any) => a.slug === slug);

    expect(saved).toBeDefined();
    expect(saved?.content).toBe(htmlContent);
  });
});
