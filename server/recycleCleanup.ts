import type { Request, Response } from "express";
import { RECYCLE_RETENTION_DAYS, purgeExpiredDeletedArticles } from "./db";
import { sdk } from "./_core/sdk";

/**
 * Scheduled callback for project-level recycle retention. The handler is
 * idempotent: retries see only still-expired recycle-bin articles.
 */
export async function handleRecycleArticleCleanup(req: Request, res: Response) {
  try {
    const user = await sdk.authenticateRequest(req);
    if (!user.isCron || !user.taskUid) {
      return res.status(403).json({ error: "cron-only" });
    }

    const result = await purgeExpiredDeletedArticles();
    return res.json({
      ok: true,
      taskUid: user.taskUid,
      retentionDays: RECYCLE_RETENTION_DAYS,
      cutoff: result.cutoff.toISOString(),
      permanentlyDeleted: result.affected,
    });
  } catch (error) {
    const detail = error instanceof Error ? { message: error.message, stack: error.stack } : { message: String(error) };
    console.error("[Scheduled recycle cleanup] Failed:", error);
    return res.status(500).json({
      error: "recycle-cleanup-failed",
      ...detail,
      context: { path: req.path },
      timestamp: new Date().toISOString(),
    });
  }
}
