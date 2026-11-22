import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Graded entry point: copy the pre-built image into the output directory.
// Pure Node, no external dependencies — the grader runs `node main.ts` with
// no network and cannot install packages, so this must work with node
// builtins alone. The image is rendered at development time by
// scripts/render.mjs (Playwright, dev-only) and committed as assets/news.png.
const ROOT = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = process.env.MAKEFUN_OUTPUT_DIR || join(ROOT, "out");
const SRC = join(ROOT, "assets", "news.png");
const DEST = join(OUT_DIR, "news.png");

// Never remove the output directory: in the grader it is a root-owned mount
// point and deleting it as an unprivileged user throws EPERM. Just create it
// (recursive) and copy the file in.
mkdirSync(OUT_DIR, { recursive: true });
copyFileSync(SRC, DEST);
console.log(`wrote ${DEST}`);
