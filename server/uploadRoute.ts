import { Express } from "express";
import { storagePut } from "./storage";
import { createImage } from "./db";

export function registerUploadRoute(app: Express) {
  app.post("/api/upload", async (req, res) => {
    try {
      const contentType = req.headers["content-type"] || "";
      if (!contentType.includes("multipart/form-data")) {
        return res.status(400).json({ error: "Expected multipart/form-data" });
      }

      // Dynamically import busboy
      const { default: Busboy } = await import("busboy");
      const bb = Busboy({ headers: req.headers });

      let fileBuffer: Buffer | null = null;
      let fileName = "upload";
      let mimeType = "application/octet-stream";
      let pageKey = "home";

      bb.on("field", (fieldname: string, val: string) => {
        if (fieldname === "pageKey") pageKey = val;
      });

      bb.on("file", (_fieldname: string, file: NodeJS.ReadableStream, info: { filename: string; mimeType: string }) => {
        fileName = info.filename || "upload";
        mimeType = info.mimeType;
        const chunks: Buffer[] = [];
        file.on("data", (chunk: Buffer) => chunks.push(chunk));
        file.on("end", () => {
          fileBuffer = Buffer.concat(chunks);
        });
      });

      await new Promise<void>((resolve, reject) => {
        bb.on("finish", resolve);
        bb.on("error", reject);
        req.pipe(bb);
      });

      if (!fileBuffer) {
        return res.status(400).json({ error: "No file received" });
      }

      const ext = fileName.split(".").pop() || "jpg";
      const key = `images/${Date.now()}.${ext}`;
      const { url } = await storagePut(key, fileBuffer as Buffer, mimeType);

      // Save to DB
      await createImage({ url, fileKey: key, pageKey, uploadedBy: undefined });
      return res.json({ success: true, url });
    } catch (err) {
      console.error("[Upload] Error:", err);
      return res.status(500).json({ error: "Upload failed" });
    }
  });
}
