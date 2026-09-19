import { Request, Response } from "express";
import { db } from "../../db/db";

export const getProducts = async (_req: Request, res: Response) => {
  try {
    const products = await db.query("SELECT * FROM products");
    res.json(products.rows);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
};

export const createProduct = async (req: Request, res: Response) => {
  const { name, brand, price, country, image } = req.body;

  try {
    const result = await db.query(
      "INSERT INTO products (name, brand, price, country, image) VALUES ($1,$2,$3,$4,$5) RETURNING *",
      [name, brand, price, country, image]
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to create product" });
  }
};
