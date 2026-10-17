import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

// Read-only audit: reports likely out-of-scope reference rows; never edits or deletes source data.
const root = "data/reference-review-batches-2026-10-10";
const files = (await readdir(root)).filter((name) => name.endsWith(".csv")).sort();
const patterns = [
  /supplement/i,
  /vitamin/i,
  /medicine|medication|pharmaceutical/i,
  /medical device|test supply|baby milk/i,
  /مكمل غذائي|فيتامين|دواء|أجهزة طبية|حليب أطفال/
];
let flagged = 0;
for (const file of files) {
  const rows = (await readFile(join(root, file), "utf8")).split(/\r?\n/);
  const hits = [];
  for (let index = 1; index < rows.length; index += 1) {
    const row = rows[index];
    if (row.trim() && patterns.some((pattern) => pattern.test(row))) {
      hits.push(index + 1);
    }
  }
  if (hits.length) {
    flagged += hits.length;
    console.log(`${file}: ${hits.length} candidate row(s); line numbers: ${hits.join(", ")}`);
  }
}
console.log(`Read-only reference-data audit complete. Candidate rows flagged: ${flagged}. No records changed.`);
