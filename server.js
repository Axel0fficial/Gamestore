const express = require("express");
const cors = require("cors");

const app = express();

// ✅ IMPORTANT for Render: use process.env.PORT
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// In-memory products (prototype DB)
let productos = [
  { id: 1, nombre: "The Witcher 3", descripcion: "RPG mundo abierto", precio: 19990, imagenUrl: "https://example.com/witcher3.jpg" },
  { id: 2, nombre: "Elden Ring", descripcion: "Acción-RPG", precio: 29990, imagenUrl: "https://example.com/eldenring.jpg" }
];

let nextId = 3;

// simple health check
app.get("/ping", (req, res) => res.json({ ok: true, message: "pong" }));

// GET /productos
app.get("/productos", (req, res) => res.json(productos));

// GET /productos/:id
app.get("/productos/:id", (req, res) => {
  const id = Number(req.params.id);
  const p = productos.find(x => x.id === id);
  if (!p) return res.status(404).json({ error: "Producto no encontrado" });
  res.json(p);
});

// POST /productos
app.post("/productos", (req, res) => {
  const { nombre, descripcion, precio, imagenUrl } = req.body;
  const precioNum = parseInt(precio, 10) || 0;

  const nuevo = { id: nextId++, nombre, descripcion, precio: precioNum, imagenUrl };
  productos.push(nuevo);

  res.status(201).json(nuevo);
});

// PUT /productos  (id viene en el body, como tu interfaz)
app.put("/productos", (req, res) => {
  const { id, nombre, descripcion, precio, imagenUrl } = req.body;
  const idx = productos.findIndex(x => x.id === id);
  if (idx === -1) return res.status(404).json({ error: "Producto no encontrado" });

  const precioNum = precio !== undefined ? (parseInt(precio, 10) || productos[idx].precio) : productos[idx].precio;

  productos[idx] = {
    ...productos[idx],
    nombre: nombre ?? productos[idx].nombre,
    descripcion: descripcion ?? productos[idx].descripcion,
    precio: precioNum,
    imagenUrl: imagenUrl ?? productos[idx].imagenUrl
  };

  res.json(productos[idx]);
});

// DELETE /productos/:id
app.delete("/productos/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = productos.findIndex(x => x.id === id);
  if (idx === -1) return res.status(404).json({ error: "Producto no encontrado" });

  const eliminado = productos.splice(idx, 1)[0];
  res.json(eliminado);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ API up on port ${PORT}`);
});
