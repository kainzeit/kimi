import { describe, expect, it } from "vitest";
import type { TrpcContext } from "./_core/context";
import { appRouter } from "./routers";
import { createImage, deleteImage } from "./db";

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

describe("Managed page image dimensions", () => {
  it("persists image dimensions for public rendering and supports resetting to defaults", async () => {
    const caller = appRouter.createCaller(createContext());
    const fileKey = `image-dimensions-${Date.now()}-${Math.random().toString(36).slice(2)}.png`;

    await createImage({
      url: "https://example.com/image-dimensions.png",
      fileKey,
      pageKey: "foyer",
      uploadedBy: null,
    });

    const created = (await caller.images.list({ pageKey: "foyer", includeHidden: true })).find(
      (image: any) => image.fileKey === fileKey,
    );
    expect(created).toBeDefined();

    try {
      await caller.images.updateDimensions({
        id: created!.id,
        displayWidth: 360,
        displayHeight: 240,
      });

      const resized = (await caller.images.list({ pageKey: "foyer", includeHidden: true })).find(
        (image: any) => image.id === created!.id,
      );
      expect(resized?.displayWidth).toBe(360);
      expect(resized?.displayHeight).toBe(240);

      await caller.images.updateDimensions({
        id: created!.id,
        displayWidth: null,
        displayHeight: null,
      });

      const reset = (await caller.images.list({ pageKey: "foyer", includeHidden: true })).find(
        (image: any) => image.id === created!.id,
      );
      expect(reset?.displayWidth).toBeNull();
      expect(reset?.displayHeight).toBeNull();
    } finally {
      await deleteImage(created!.id);
    }
  });
});
