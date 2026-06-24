/**
 * Generate a 1200×630 blog cover PNG with sharp (brand background + title).
 * No LLM, no network — deterministic and free.
 *
 *   import { generateCover } from "./og-thumbnail.mjs";
 *   const buf = await generateCover("My title", { brand: "#2567ff" });
 */
import sharp from "sharp";

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Wrap a title into <= maxLines lines of <= perLine chars. */
function wrap(title, perLine = 26, maxLines = 4) {
  const words = String(title).split(/\s+/);
  const lines = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > perLine) {
      lines.push(line.trim());
      line = w;
    } else {
      line = (line + " " + w).trim();
    }
    if (lines.length === maxLines) break;
  }
  if (line && lines.length < maxLines) lines.push(line.trim());
  return lines;
}

export async function generateCover(title, { brand = "#2567ff", fg = "#0a0a0a" } = {}) {
  const lines = wrap(title);
  const tspans = lines
    .map((l, i) => `<tspan x="80" dy="${i === 0 ? 0 : 84}">${esc(l)}</tspan>`)
    .join("");
  const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="#ffffff"/>
    <rect x="80" y="64" width="44" height="44" rx="10" fill="${brand}"/>
    <text x="140" y="96" font-family="Inter, sans-serif" font-size="30" font-weight="600" fill="${fg}">Blog</text>
    <text x="80" y="300" font-family="Inter, sans-serif" font-size="68" font-weight="700" fill="${fg}">${tspans}</text>
    <rect x="80" y="540" width="180" height="8" rx="4" fill="${brand}"/>
  </svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}
