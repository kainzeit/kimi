import { execFile } from "node:child_process";
import { promisify } from "node:util";
import type { Writable } from "node:stream";
import { finished } from "node:stream/promises";
import { createHash } from "node:crypto";
import { ZipArchive } from "archiver";
import { getCompleteBackupDataset } from "./db";
import { storageGetSignedUrl } from "./storage";

const execFileAsync = promisify(execFile);

const BACKUP_ENVIRONMENT_TEMPLATE = `# kimi backup environment template\n# Copy to the destination platform's secure environment-variable settings.\n# Fill values from their original secure source; do not commit this file with values.\n\nDATABASE_URL=\nJWT_SECRET=\nVITE_APP_ID=\nOAUTH_SERVER_URL=\nVITE_OAUTH_PORTAL_URL=\nOWNER_OPEN_ID=\nOWNER_NAME=\nBUILT_IN_FORGE_API_URL=\nBUILT_IN_FORGE_API_KEY=\nVITE_FRONTEND_FORGE_API_URL=\nVITE_FRONTEND_FORGE_API_KEY=\nVITE_ANALYTICS_ENDPOINT=\nVITE_ANALYTICS_WEBSITE_ID=\nVITE_APP_TITLE=\nVITE_APP_LOGO=\n`;

const BACKUP_RESTORE_GUIDE = `# kimi backup package\n\nThis archive is an owner-only point-in-time backup. It includes a source snapshot, database JSON exports, media files copied from the current object store, and a template listing environment-variable names without values.\n\n## Important\n\n- The archive intentionally excludes all environment-variable values and session credentials. Retrieve replacement values from your secure secret manager or original providers.\n- Restore the database data into a compatible database before importing the media references.\n- Upload media files to a destination object store, then update images.url and rich-text image src values that point to /manus-storage/.\n- Read manifest.json before restoring. It lists downloaded and unavailable media files.\n- Keep this archive private because it contains website content, user data, access logs, and site configuration.\n`;

const SOURCE_IGNORE = [
  ".git/**",
  "node_modules/**",
  "dist/**",
  ".manus-logs/**",
  "coverage/**",
  "backups/**",
  ".env",
  ".env.*",
  "*.log",
];

export type BackupManifest = {
  formatVersion: 1;
  generatedAt: string;
  sourceRevision: string | null;
  sourceWorkingTreeDirty: boolean | null;
  databaseSqlIncluded: boolean;
  databaseTableCounts: Record<string, number>;
  media: {
    requested: number;
    included: Array<{ key: string; bytes: number; sha256: string }>;
    unavailable: Array<{ key: string; reason: string }>;
  };
  excluded: string[];
};

export type BackupArchiveOptions = {
  /** Available only to the sandbox backup script; serverless deployments use JSON snapshots. */
  databaseSqlDumpPath?: string;
};

function safeStorageKey(value: string): string | null {
  try {
    const normalized = decodeURIComponent(value).replace(/^\/+/, "");
    const segments = normalized.split("/").filter((segment) => segment && segment !== "." && segment !== "..");
    return segments.length > 0 ? segments.join("/") : null;
  } catch {
    return null;
  }
}

export function collectManagedStorageKeys(dataset: Awaited<ReturnType<typeof getCompleteBackupDataset>>): string[] {
  const keys = new Set<string>();

  for (const image of dataset.images) {
    const storedUrlMatch = image.url.match(/\/manus-storage\/([^?]+)/);
    const urlKey = storedUrlMatch ? safeStorageKey(storedUrlMatch[1]) : null;
    const fileKey = safeStorageKey(image.fileKey);
    const key = urlKey ?? fileKey;
    if (key) keys.add(key);
  }

  const htmlValues = [
    ...dataset.articles.map((article) => article.content),
    ...dataset.pageContent.map((page) => page.content),
  ];
  const pattern = /\/manus-storage\/([^"'<>\s?]+)/g;

  for (const html of htmlValues) {
    for (const match of Array.from(html.matchAll(pattern))) {
      const key = safeStorageKey(match[1]);
      if (key) keys.add(key);
    }
  }

  return Array.from(keys).sort();
}

async function getSourceState(projectRoot: string): Promise<{ revision: string | null; dirty: boolean | null }> {
  try {
    const [{ stdout: revisionOutput }, { stdout: statusOutput }] = await Promise.all([
      execFileAsync("git", ["rev-parse", "HEAD"], { cwd: projectRoot }),
      execFileAsync("git", ["status", "--porcelain"], { cwd: projectRoot }),
    ]);
    return { revision: revisionOutput.trim() || null, dirty: statusOutput.trim().length > 0 };
  } catch {
    return { revision: null, dirty: null };
  }
}

function tableCounts(dataset: Awaited<ReturnType<typeof getCompleteBackupDataset>>): Record<string, number> {
  return {
    users: dataset.users.length,
    articles: dataset.articles.length,
    articleAutosaves: dataset.articleAutosaves.length,
    pageContent: dataset.pageContent.length,
    images: dataset.images.length,
    accessLogs: dataset.accessLogs.length,
    articleViews: dataset.articleViews.length,
    siteConfig: dataset.siteConfig.length,
  };
}

/**
 * Streams a complete owner-only backup archive to any writable destination.
 * It intentionally exports a variable-name template rather than secret values.
 */
export async function writeCompleteBackupArchive(
  output: Writable,
  projectRoot = process.cwd(),
  options: BackupArchiveOptions = {},
): Promise<BackupManifest> {
  const dataset = await getCompleteBackupDataset();
  const storageKeys = collectManagedStorageKeys(dataset);
  const sourceState = await getSourceState(projectRoot);
  const manifest: BackupManifest = {
    formatVersion: 1,
    generatedAt: new Date().toISOString(),
    sourceRevision: sourceState.revision,
    sourceWorkingTreeDirty: sourceState.dirty,
    databaseSqlIncluded: Boolean(options.databaseSqlDumpPath),
    databaseTableCounts: tableCounts(dataset),
    media: { requested: storageKeys.length, included: [], unavailable: [] },
    excluded: [
      "Environment-variable values and session credentials",
      "node_modules, build output, git metadata, logs, and prior backup archives",
    ],
  };

  const archive = new ZipArchive({ zlib: { level: 9 } });
  archive.on("warning", (warning: Error & { code?: string }) => {
    if (warning.code !== "ENOENT") {
      console.warn("[Backup] Archive warning:", warning.message);
    }
  });
  archive.on("error", (error: Error) => output.destroy(error));
  archive.pipe(output);

  archive.glob("**/*", { cwd: projectRoot, dot: true, ignore: SOURCE_IGNORE }, { prefix: "code" });
  archive.append(BACKUP_ENVIRONMENT_TEMPLATE, { name: "config/.env.template" });
  archive.append(BACKUP_RESTORE_GUIDE, { name: "README_RESTORE.md" });

  for (const [tableName, rows] of Object.entries(dataset)) {
    archive.append(JSON.stringify(rows, null, 2), { name: `database/${tableName}.json` });
  }
  if (options.databaseSqlDumpPath) {
    archive.file(options.databaseSqlDumpPath, { name: "database/full-schema-and-data.sql" });
  } else {
    archive.append(
      "This deployment-generated archive provides JSON table snapshots plus the Drizzle schema in code/drizzle/schema.ts. A full SQL dump can be created by the sandbox backup script, which is not available in the deployed serverless runtime.\n",
      { name: "database/SQL_EXPORT_STATUS.txt" },
    );
  }

  for (const key of storageKeys) {
    try {
      const signedUrl = await storageGetSignedUrl(key);
      const response = await fetch(signedUrl);
      if (!response.ok) throw new Error(`download returned ${response.status}`);
      const buffer = Buffer.from(await response.arrayBuffer());
      manifest.media.included.push({
        key,
        bytes: buffer.length,
        sha256: createHash("sha256").update(buffer).digest("hex"),
      });
      archive.append(buffer, { name: `media/${key}` });
    } catch (error) {
      manifest.media.unavailable.push({
        key,
        reason: error instanceof Error ? error.message : "unknown media download error",
      });
    }
  }

  archive.append(JSON.stringify(manifest, null, 2), { name: "manifest.json" });
  await archive.finalize();
  await finished(output);
  return manifest;
}
