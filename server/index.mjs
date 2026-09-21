import express from "express";

const app = express();
const port = Number(process.env.PORT || 3000);

app.disable("x-powered-by");
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", gate: "CLOSED" });
});

const lockedResponse = (_req, res) => {
  res.set("Cache-Control", "no-store");
  res.status(503).json({ error: "DATA_INTAKE_LOCKED" });
};

app.get("/api/products", lockedResponse);
app.post("/api/products", lockedResponse);
app.put("/api/products", lockedResponse);
app.patch("/api/products", lockedResponse);
app.delete("/api/products", lockedResponse);

app.get("/", (_req, res) => {
  res.json({
    name: "PM Cosmetics Hub",
    status: "online",
    gate: "CLOSED",
    productsApi: "locked",
  });
});

if (process.argv[1] === new URL(import.meta.url).pathname) {
  app.listen(port, () => {
    console.log(`PM Cosmetics Hub API listening on :${port} (Gate CLOSED)`);
  });
}

export default app;
