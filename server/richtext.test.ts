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
  it("preserves inline color styles and image tags in rich text HTML output", () => {
    const htmlWithColorAndImage = '<p><span style="color: rgb(255, 0, 0);">Red text</span><img src="https://example.com/img.png" /></p>';
    expect(htmlWithColorAndImage).toContain('style="color: rgb(255, 0, 0);"');
    expect(htmlWithColorAndImage).toContain('<img src="https://example.com/img.png" />');
  });

  it("creates, persists, and retrieves rich text HTML containing color styles and images", async () => {
    const caller = appRouter.createCaller(createContext());
    const slug = `richtext-test-${Date.now()}`;
    const richContent = '<p><span style="color: #ff0000;">Colored rich text</span><img src="https://example.com/test.jpg" /></p>';

    await caller.articles.create({
      slug,
      title: "Rich Text Test Article",
      content: richContent,
      category: "a-whim",
      isDraft: true, // create as draft so public get won't exclude if unhidden checks apply
    });

    // Retrieve via admin list or direct query
    const adminArticles = await caller.articles.list({ category: "a-whim", includeHidden: true });
    const saved = adminArticles.find((a: any) => a.slug === slug);
    expect(saved).toBeDefined();
    expect(saved?.content).toContain('style="color: #ff0000;"');
    expect(saved?.content).toContain('<img src="https://example.com/test.jpg" />');
  });
});
