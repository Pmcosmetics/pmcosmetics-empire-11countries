import { readFile } from 'node:fs/promises';

const required = [
  'README.md',
  'package.json',
  'config/markets.json',
  'config/catalog.schema.json',
  '.gitignore',
  'app/index.html',
  'docs/operations.md',
  'docs/EMPIRE-OPERATING-SYSTEM.md',
  'data/catalog.example.json'
];

for (const file of required) {
  try {
    await readFile(file, 'utf8');
  } catch {
    throw new Error(`Missing required baseline file: ${file}`);
  }
}

const pkg = JSON.parse(await readFile('package.json', 'utf8'));
const config = JSON.parse(await readFile('config/markets.json', 'utf8'));
const schema = JSON.parse(await readFile('config/catalog.schema.json', 'utf8'));
const catalog = JSON.parse(await readFile('data/catalog.example.json', 'utf8'));
const storefront = await readFile('app/index.html', 'utf8');

if (pkg.name !== 'pm-cosmetics-hub') throw new Error('Invalid package name');
if (config.canonical_name !== 'PM Cosmetics Hub') throw new Error('Invalid canonical brand name');
if (!Array.isArray(config.markets) || config.markets.length !== 6) throw new Error('Unexpected market configuration');
if (config.rules.secrets_in_git !== false) throw new Error('Secret protection rule is invalid');
if (config.rules.catalog_requires_validation !== true) throw new Error('Catalog validation rule is invalid');
if (config.rules.ledger_requires_validation !== true) throw new Error('Ledger validation rule is invalid');
if (schema.title !== 'PM Cosmetics Hub Catalog Item') throw new Error('Catalog schema is invalid');
if (!Array.isArray(catalog.items)) throw new Error('Catalog fixture is invalid');
if (!storefront.includes('<title>PM Cosmetics Hub</title>')) throw new Error('Storefront title is invalid');
if (!storefront.includes('dir="rtl"')) throw new Error('Arabic RTL storefront support is missing');
if (!storefront.includes('id="markets"')) throw new Error('Market section is missing');

console.log(`Validation passed: ${config.canonical_name} / ${config.markets.length} markets / storefront + catalog contract ready`);
