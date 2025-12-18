const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// ❗ Hardcoded Postgres connection (TEMPORARY)
const pool = new Pool({
  connectionString: "postgresql://gameapp_user:zfmTWrckSwQZuC7958H94f4pMikUiwvx@dpg-d51peu15pdvs73edcj4g-a/gameapp",
  ssl: { rejectUnauthorized: false }
});

// ✅ Auto-create table if missing
async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS productos (
      id SERIAL PRIMARY KEY,
      nombre TEXT NOT NULL,
      descripcion TEXT NOT NULL,
      precio INT NOT NULL,
      imagen_url TEXT NOT NULL
    );
  `);
  console.log("✅ DB ready: table productos exists");
}

initDb().catch((e) => {
  console.error("❌ DB init failed:", e);
  process.exit(1);
});

app.get("/ping", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true, db: "connected" });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

app.get("/productos", async (req, res) => {
  const { rows } = await pool.query(
    `SELECT id, nombre, descripcion, precio, imagen_url AS "imagenUrl"
     FROM productos
     ORDER BY id`
  );
  res.json(rows);
});

// GET product by id
app.get("/productos/:id", async (req, res) => {
  const id = Number(req.params.id);
  const { rows } = await pool.query(
    `SELECT id, nombre, descripcion, precio,
            imagen_url AS "imagenUrl"
     FROM productos
     WHERE id = $1`,
    [id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  res.json(rows[0]);
});

// POST product
app.post("/productos", async (req, res) => {
  const { nombre, descripcion, precio, imagenUrl } = req.body;
  const precioNum = parseInt(precio, 10) || 0;

  const { rows } = await pool.query(
    `INSERT INTO productos (nombre, descripcion, precio, imagen_url)
     VALUES ($1, $2, $3, $4)
     RETURNING id, nombre, descripcion, precio,
               imagen_url AS "imagenUrl"`,
    [nombre, descripcion, precioNum, imagenUrl]
  );

  res.status(201).json(rows[0]);
});

// PUT product
app.put("/productos", async (req, res) => {
  const { id, nombre, descripcion, precio, imagenUrl } = req.body;
  const precioNum = parseInt(precio, 10);

  const { rows } = await pool.query(
    `UPDATE productos
     SET nombre = $2,
         descripcion = $3,
         precio = $4,
         imagen_url = $5
     WHERE id = $1
     RETURNING id, nombre, descripcion, precio,
               imagen_url AS "imagenUrl"`,
    [id, nombre, descripcion, precioNum, imagenUrl]
  );

  if (rows.length === 0) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  res.json(rows[0]);
});

// DELETE product
app.delete("/productos/:id", async (req, res) => {
  const id = Number(req.params.id);

  const { rows } = await pool.query(
    `DELETE FROM productos
     WHERE id = $1
     RETURNING id, nombre, descripcion, precio,
               imagen_url AS "imagenUrl"`,
    [id]
  );

  if (rows.length === 0) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }

  res.json(rows[0]);
});

// ------------------ START SERVER ------------------
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});