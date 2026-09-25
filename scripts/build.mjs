import { mkdir, readFile, writeFile } from "node:fs/promises";

const required = [
  "package.json",
  "config/markets.json",
  "config/catalog.schema.json",
  "server/index.mjs",
];

for (const file of required) {
  await readFile(file);
}

const packageJson = JSON.parse(await readFile("package.json", "utf8"));
const server = await readFile("server/index.mjs", "utf8");

if (!server.includes('app.get("/api/health"')) {
  throw new Error("Active server health route is missing");
}
if (!server.includes('app.get("/api/products"')) {
  throw new Error("Active products API route is missing");
}
if (!server.includes("DATA_INTAKE_LOCKED")) {
  throw new Error("Active products API lock is missing");
}

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
