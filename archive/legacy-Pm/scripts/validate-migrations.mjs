import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const dir = join(process.cwd(), 'supabase', 'migrations');
const files = (await readdir(dir)).filter((name) => name.endsWith('.sql')).sort();

if (files.length === 0) throw new Error('No SQL migrations found in supabase/migrations');

const numbered = files.filter((name) => /^\d+_.*\.sql$/.test(name));
const timestamped = files.filter((name) => /^\d{14}_.*\.sql$/.test(name));
const invalid = files.filter((name) => !/^\d+_.*\.sql$/.test(name));
if (invalid.length > 0) throw new Error(`Invalid migration filename: ${invalid.join(', ')}`);

const numericVersions = numbered.map((name) => Number(name.match(/^(\d+)_/)[1]));
const unique = new Set(numericVersions);
if (unique.size !== numericVersions.length) throw new Error('Duplicate migration sequence number detected');

const legacy = numbered.filter((name) => !/^\d{14}_.*\.sql$/.test(name));
const legacyVersions = legacy.map((name) => Number(name.match(/^(\d+)_/)[1])).sort((a, b) => a - b);
for (let i = 0; i < legacyVersions.length; i += 1) {
  const expected = i + 1;
  if (legacyVersions[i] !== expected) {
    throw new Error(`Migration sequence gap/order error: expected ${String(expected).padStart(3, '0')}, found ${String(legacyVersions[i]).padStart(3, '0')}`);
  }
}

const timestampVersions = timestamped.map((name) => Number(name.slice(0, 14)));
for (let i = 1; i < timestampVersions.length; i += 1) {
  if (timestampVersions[i] <= timestampVersions[i - 1]) {
    throw new Error(`Timestamp migration order error: ${timestamped[i - 1]} then ${timestamped[i]}`);
  }
}

for (const file of files) {
  const content = await readFile(join(dir, file), 'utf8');
  if (!content.trim()) throw new Error(`Empty migration: ${file}`);
}

console.log(`Migration validation OK: ${files.length} files (${files.join(', ')})`);
