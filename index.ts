import keys from "./assets/keys.json"; // search in en
import Fuse from "fuse.js";
import { readFileSync } from "fs";

const [langCode, ...searchTerms] = process.argv.slice(2);

if (!langCode || searchTerms.length === 0) {
  console.error("Usage: node script.js <lang-code> <search term>");
  process.exit(1);
}

const searchTerm = searchTerms.join(" ");
const targetLang = JSON.parse(
  readFileSync(`./assets/${langCode}.json`, "utf-8"),
);

const entries = Object.entries(keys).map(([k, v]) => ({ key: k, value: v }));
const fuse = new Fuse(entries, { keys: ["value"], threshold: 0.1 });
const results = fuse.search(searchTerm);

const seen = new Set();

results.reverse().forEach((result) => {
  const k = result.item.key;
  const signature = `${keys[k]}|${targetLang[k]}`;

  if (!seen.has(signature)) {
    seen.add(signature);
    console.log(
      `\x1b[33m${keys[k]}\x1b[0m\n` + `\x1b[32m${targetLang[k]}\x1b[0m \n`,
    );
  }
});
