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

    // Verify list queries accept includeHidden and filter parameters correctly
    await expect(
      caller.articles.list({ category: "a-whim", includeHidden: true }),
    ).resolves.toBeTypeOf("object");

    await expect(
      caller.images.list({ pageKey: "home", includeHidden: true }),
    ).resolves.toBeTypeOf("object");
  });
});
