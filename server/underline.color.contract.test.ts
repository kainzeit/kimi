import { describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";

const projectRoot = path.resolve(import.meta.dirname, "..");

describe("underline color contract", () => {
  it("uses #719199 for navigation and article wavy underlines", async () => {
    const css = await fs.readFile(path.join(projectRoot, "client/src/index.css"), "utf8");
    const knock = await fs.readFile(path.join(projectRoot, "client/src/pages/Knock.tsx"), "utf8");

    expect(css).toContain("stroke='%23719199'");
    expect(css).toContain("text-decoration-color: #719199;");
    expect(css).toContain(".nav-link::after");
    expect(css).toContain("stroke-width='2.8'");
    expect(css).toContain(".a-whim-date::after");
    expect(css).toContain("stroke-width='1.35'");
    expect(css).toContain("text-decoration-style: wavy;");
    expect(css).toContain(".prose-content a,");
    expect(css).toContain("text-decoration: none;");
    expect(knock).toContain("text-[#719199] no-underline");
    expect(knock).not.toContain("className=\"underline underline-offset-4");
    expect(css).not.toContain("stroke='%23fbbf24'");
  });
});

