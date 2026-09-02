CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(255),
  price NUMERIC(10,2),
  country VARCHAR(50),
  image TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
