import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "PMCosmetics Hub API" });
});

// Placeholder routes
app.use("/api/products", (_req, res) => {
  res.json({ message: "Products API placeholder" });
});

app.use("/api/countries", (_req, res) => {
  res.json({ message: "Countries API placeholder" });
});

app.use("/api/orders", (_req, res) => {
  res.json({ message: "Orders API placeholder" });
});

app.listen(port, () => {
  console.log(`PMCosmetics Hub API running on port ${port}`);
});
