import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createAdminContext(): TrpcContext {
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

describe("Hide and Recycle Bin Mutation Procedures", () => {
  it("exposes article and image visibility and recycle bin procedures on the tRPC router", () => {
    const caller = appRouter.createCaller(createAdminContext());

    expect(typeof caller.articles.hide).toBe("function");
    expect(typeof caller.articles.unhide).toBe("function");
    expect(typeof caller.articles.softDelete).toBe("function");
    expect(typeof caller.articles.restore).toBe("function");
    expect(typeof caller.articles.listDeleted).toBe("function");

    expect(typeof caller.images.hide).toBe("function");
    expect(typeof caller.images.unhide).toBe("function");
    expect(typeof caller.images.softDelete).toBe("function");
    expect(typeof caller.images.restore).toBe("function");
    expect(typeof caller.images.listDeleted).toBe("function");
  });
});
