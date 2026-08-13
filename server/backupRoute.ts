import type { Express, Request, Response } from "express";
import { writeCompleteBackupArchive } from "./backupArchive";
import { sdk } from "./_core/sdk";

type BackupRequestUser = {
  role: "admin" | "user";
  isCron?: boolean;
};

export function isBackupDownloadAuthorized(user: BackupRequestUser | null | undefined) {
  return user?.role === "admin" && !user.isCron;
}

function backupFilename() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  return `kimi-complete-backup-${timestamp}.zip`;
}

export function registerBackupRoute(app: Express) {
  app.get("/api/admin/backup", async (req: Request, res: Response) => {
    let user: Awaited<ReturnType<typeof sdk.authenticateRequest>>;
    try {
      user = await sdk.authenticateRequest(req);
    } catch {
      res.status(401).json({ error: "Sign in is required to download a backup." });
      return;
    }

    if (!isBackupDownloadAuthorized(user)) {
      res.status(403).json({ error: "Administrator access is required." });
      return;
    }

    try {
      res.status(200);
      res.set({
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${backupFilename()}"`,
        "Cache-Control": "private, no-store, max-age=0",
        "X-Content-Type-Options": "nosniff",
      });

      await writeCompleteBackupArchive(res, process.cwd());
    } catch (error) {
      console.error("[Backup] Failed to create owner backup archive:", error);
      if (!res.headersSent) {
        res.status(500).json({ error: "Backup could not be created. Please try again." });
      } else {
        res.destroy(error instanceof Error ? error : undefined);
      }
    }
  });
}
