import { mkdir, readFile, writeFile } from "node:fs/promises";

const required = [
  "package.json",
  "config/markets.json",
  "config/catalog.schema.json",
  "archive/legacy-nextjs-boilerplate/app/api/health/route.ts",
  "archive/legacy-nextjs-boilerplate/app/api/products/route.ts",
];

for (const file of required) {
  await readFile(file);
}

const packageJson = JSON.parse(await readFile("package.json", "utf8"));
await mkdir("dist", { recursive: true });
await writeFile(
  "dist/build-manifest.json",
  JSON.stringify(
    {
      name: packageJson.name,
      version: packageJson.version,
      gate: "CLOSED",
      productsApi: "503 DATA_INTAKE_LOCKED",
      source: "empire-unification",
      generatedAt: new Date().toISOString(),
    },
    null,
    2,
  ) + "\n",
);
console.log(`Build completed: ${packageJson.name} (Gate CLOSED)`);
