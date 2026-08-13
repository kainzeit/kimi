import { createWriteStream, promises as fs } from "node:fs";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import path from "node:path";

const execFileAsync = promisify(execFile);
const projectRoot = path.resolve(import.meta.dirname, "..");
const outputDirectory = "/home/ubuntu/backups";
const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const outputPath = path.join(outputDirectory, `kimi-complete-backup-${timestamp}.zip`);
const sqlPath = path.join(outputDirectory, `kimi-database-${timestamp}.sql`);

function buildMysqlDumpCommand(connectionString) {
  const url = new URL(connectionString);
  if (!url.protocol.startsWith("mysql")) {
    throw new Error("DATABASE_URL is not a MySQL-compatible connection string");
  }

  const database = decodeURIComponent(url.pathname.replace(/^\//, ""));
  if (!database) throw new Error("DATABASE_URL is missing a database name");

  const args = [
    "--skip-lock-tables",
    "--skip-add-locks",
    "--no-tablespaces",
    "--set-gtid-purged=OFF",
    "--column-statistics=0",
    "--host", url.hostname,
    "--port", url.port || "3306",
    "--user", decodeURIComponent(url.username),
    "--ssl-mode=REQUIRED",
    database,
  ];
  return { args, password: decodeURIComponent(url.password) };
}

await fs.mkdir(outputDirectory, { recursive: true });
try {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is unavailable to the backup script");
  const { args, password } = buildMysqlDumpCommand(connectionString);
  const { stdout } = await execFileAsync("mysqldump", args, {
    env: { ...process.env, MYSQL_PWD: password },
    maxBuffer: 50 * 1024 * 1024,
  });
  await fs.writeFile(sqlPath, stdout, { mode: 0o600 });

  const output = createWriteStream(outputPath);
  const { writeCompleteBackupArchive } = await import("../server/backupArchive.ts");
  const manifest = await writeCompleteBackupArchive(output, projectRoot, { databaseSqlDumpPath: sqlPath });
  console.log(JSON.stringify({ outputPath, manifest }, null, 2));
} finally {
  await fs.rm(sqlPath, { force: true });
}

process.exit(0);
