import keys from "./assets/keys.json";
import en from "./assets/en.json";
import Fuse from "fuse.js";
import { readFileSync } from "fs";

const [langCode, ...searchTerms] = process.argv.slice(2);

if (!langCode || searchTerms.length === 0) {
  console.error("Usage: bun run index.ts <lang-code> <search term>");
  process.exit(1);
}

const searchTerm = searchTerms.join(" ");
const targetLang = JSON.parse(
  readFileSync(`./assets/${langCode}.json`, "utf-8"),
);

function printEntry(hash: string) {
  console.log(
    `\x1b[36mHash:\x1b[0m ${hash}\n` +
      `\x1b[35mKey:\x1b[0m ${keys[hash] ?? "N/A"}\n` +
      `\x1b[33mEN:\x1b[0m ${en[hash] ?? "N/A"}\n` +
      `\x1b[32m${langCode}:\x1b[0m ${targetLang[hash] ?? "N/A"}\n`,
  );
}

// Exact hash match
if (en[searchTerm] || keys[searchTerm]) {
  printEntry(searchTerm);
} else {
  // Fuzzy search across en values and key names
  const entries = Object.keys(en).map((hash) => ({
    hash,
    key: keys[hash] ?? "",
    value: String(en[hash]),
  }));

  const fuse = new Fuse(entries, {
    keys: ["value", "key"],
    threshold: 0.1,
  });
  const results = fuse.search(searchTerm);

  const seen = new Set();

  results.reverse().forEach((result) => {
    const h = result.item.hash;
    const signature = `${keys[h]}|${targetLang[h]}`;

    if (!seen.has(signature)) {
      seen.add(signature);
      printEntry(h);
    }
  });
}
