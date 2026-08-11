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

describe("Draft / Publish mutation contracts", () => {
  it("exposes setDraft procedures for articles and images", () => {
    const caller = appRouter.createCaller(createContext());
    expect(typeof caller.articles.setDraft).toBe("function");
    expect(typeof caller.images.setDraft).toBe("function");
  });
});
