// src/controllers/order.controller.js

// Pedidos en memoria (por usuario)
let orders = []; // [{ id, userId, items, total, direccion, metodoPago, estado, fecha }]
let nextOrderId = 1;

// Mismo helper que usas en cart.controller.js
function getUserId(req) {
  // Si tienes auth con JWT y guardas el usuario en req.user, úsalo:
  return req.user?.id || "demo-user";
}

// POST /api/pedidos
export const createOrder = (req, res) => {
  const userId = getUserId(req);
  const { items, total, direccion, metodoPago } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res
      .status(400)
      .json({ message: ["No hay productos en el pedido"] });
  }

  const order = {
    id: nextOrderId++,
    userId,
    items: items.map((it) => ({
      productoId: it.productoId,
      nombre: it.nombre,
      precio: it.precio,
      cantidad: it.cantidad,
      subtotal: (it.precio || 0) * (it.cantidad || 0),
    })),
    total: total || 0,
    direccion: direccion || "",
    metodoPago: metodoPago || "efectivo",
    estado: "pendiente",
    fecha: new Date().toISOString(),
  };

  orders.push(order);

  return res.status(201).json(order);
};

// GET /api/pedidos/mis-pedidos
export const getMyOrders = (req, res) => {
  const userId = getUserId(req);
  const myOrders = orders.filter((o) => o.userId === userId);
  return res.json(myOrders);
};

// GET /api/pedidos/admin
export const getAllOrders = (req, res) => {
  return res.json(orders);
};

// PUT /api/pedidos/admin/:id/estado
export const updateOrderStatus = (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  const order = orders.find((o) => String(o.id) === String(id));
  if (!order) {
    return res.status(404).json({ message: ["Pedido no encontrado"] });
  }

  order.estado = estado || order.estado;
  return res.json(order);
};
