// backend/src/controllers/cart.controller.js
import Product from "../models/product.model.js";

// 🛒 Carritos en memoria por usuario
// Estructura: { [userId]: { items: [], total: number } }
const carts = {};

function getUserId(req) {
  // Si tu middleware de auth mete el usuario en req.user, úsalo
  // Si no, usamos un id fijo de prueba
  return req.user?.id || "demo-user";
}

// GET /api/carrito
export const getCart = (req, res) => {
  const userId = getUserId(req);

  if (!carts[userId]) {
    carts[userId] = { items: [], total: 0 };
  }

  return res.json(carts[userId]);
};

// POST /api/carrito/agregar
export const addToCart = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { productoId, cantidad = 1 } = req.body;

    if (!productoId) {
      return res
        .status(400)
        .json({ message: ["productoId es obligatorio"] });
    }

    const cant = Number(cantidad) || 1;

    if (!carts[userId]) {
      carts[userId] = { items: [], total: 0 };
    }

    const cart = carts[userId];

    // 🔹 Traemos datos del producto para mostrar en el carrito
    const product = await Product.findById(productoId).select("nombre precio");

    if (!product) {
      return res.status(404).json({
        message: ["Producto no encontrado"],
      });
    }

    const precio = Number(product.precio) || 0;
    const nombre = product.nombre || "Producto";

    // Buscamos si ya existe el producto en el carrito
    const index = cart.items.findIndex(
      (item) => String(item.productoId) === String(productoId)
    );

    if (index >= 0) {
      // Ya existe → sumamos cantidad
      cart.items[index].cantidad += cant;
    } else {
      // Nuevo item en el carrito
      cart.items.push({
        productoId,          // Para referencias futuras
        nombre,              // Para mostrar en el carrito
        precio,              // Precio unitario
        cantidad: cant,
      });
    }

    // Recalcular total
    cart.total = cart.items.reduce(
      (sum, item) => sum + (Number(item.precio) || 0) * (item.cantidad || 0),
      0
    );

    return res.json(cart);
  } catch (error) {
    console.error(" Error en addToCart:", error);
    return res.status(500).json({
      message: ["Error al agregar producto al carrito"],
    });
  }
};

// DELETE /api/carrito/limpiar
export const clearCart = (req, res) => {
  const userId = getUserId(req);
  carts[userId] = { items: [], total: 0 };
  return res.json(carts[userId]);
};
