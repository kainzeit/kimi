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
    expect(css).toContain("text-decoration-style: solid;");
    expect(css).toContain("text-decoration-color: #719199;");
    expect(css).toContain("text-underline-offset: 5px;");
    expect(knock).toContain("textDecoration: \"underline\"");
    expect(knock).toContain("textDecorationColor: \"#719199\"");
    expect(knock).toContain("textUnderlineOffset: \"5px\"");
    expect(css).not.toContain("stroke='%23fbbf24'");
  });
});

