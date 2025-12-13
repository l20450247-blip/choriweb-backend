// src/routes/order.routes.js
import { Router } from "express";
import Order from "../models/order.model.js";
import { authRequired } from "../middlewares/validateToken.js";
import { isAdmin } from "../middlewares/isAdmin.js";

const router = Router();

/* ===============================
   ADMIN: OBTENER TODOS LOS PEDIDOS
   GET /api/pedidos
   =============================== */
router.get("/", authRequired, isAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("usuario", "nombre email")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    console.error("Error al obtener pedidos:", error);
    res.status(500).json({
      message: ["Error al obtener pedidos"],
    });
  }
});

/* ===============================
   CLIENTE: OBTENER MIS PEDIDOS
   GET /api/pedidos/mis-pedidos
   =============================== */
router.get("/mis-pedidos", authRequired, async (req, res) => {
  try {
    const myOrders = await Order.find({ usuario: req.user.id }).sort({
      createdAt: -1,
    });

    res.json(myOrders);
  } catch (error) {
    console.error("Error al obtener mis pedidos:", error);
    res.status(500).json({
      message: ["Error al obtener tus pedidos"],
    });
  }
});

/* ===============================
   CLIENTE: CREAR PEDIDO
   POST /api/pedidos
   =============================== */
router.post("/", authRequired, async (req, res) => {
  try {
    const {
      items = [],
      total = 0,
      direccion = {},
      metodoPago = "pago_en_entrega",
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: ["No hay productos en el pedido"],
      });
    }

    // Recalcular total por seguridad
    const totalCalculado = items.reduce(
      (sum, item) => sum + (item.subtotal || 0),
      0
    );

    const newOrder = new Order({
      usuario: req.user.id,
      items: items.map((it) => ({
        producto: it.producto,          // ObjectId del producto
        nombre: it.nombre,
        cantidad: it.cantidad,
        precioUnitario: it.precioUnitario,
        subtotal: it.subtotal,
      })),
      total: totalCalculado || total,
      direccion,
      metodoPago,
      estado: "Pendiente",
      estadoPago: "Pendiente",          // por default
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const saved = await newOrder.save();

    res.status(201).json({
      message: "Pedido creado correctamente",
      order: saved,
    });
  } catch (error) {
    console.error("Error al crear pedido:", error);
    res.status(500).json({
      message: ["Error al crear el pedido"],
    });
  }
});

/* ===============================
   ADMIN: ACTUALIZAR ESTADO DEL PEDIDO
   PUT /api/pedidos/:id/estado
   =============================== */
router.put("/:id/estado", authRequired, isAdmin, async (req, res) => {
  try {
    const { estado } = req.body;

    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { estado, updatedAt: new Date() },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        message: ["Pedido no encontrado"],
      });
    }

    res.json({
      message: "Estado actualizado correctamente",
      order: updated,
    });
  } catch (error) {
    console.error("Error al actualizar estado del pedido:", error);
    res.status(500).json({
      message: ["Error al actualizar estado del pedido"],
    });
  }
});

/* ===============================
   ADMIN: ACTUALIZAR ESTADO DE PAGO
   PUT /api/pedidos/:id/pago
   =============================== */
router.put("/:id/pago", authRequired, isAdmin, async (req, res) => {
  try {
    const { estadoPago } = req.body;

    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { estadoPago, updatedAt: new Date() },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        message: ["Pedido no encontrado"],
      });
    }

    res.json({
      message: "Estado de pago actualizado correctamente",
      order: updated,
    });
  } catch (error) {
    console.error("Error al actualizar estado de pago:", error);
    res.status(500).json({
      message: ["Error al actualizar estado de pago"],
    });
  }
});

/* ===============================
   ADMIN: SEED DE PRUEBA
   POST /api/pedidos/seed-prueba
   =============================== */
router.post("/seed-prueba", authRequired, isAdmin, async (req, res) => {
  try {
    const pedidosDemo = [
      {
        usuario: req.user.id,
        total: 350,
        estado: "Pendiente",
        estadoPago: "Pendiente",
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        usuario: req.user.id,
        total: 480.5,
        estado: "Entregado",
        estadoPago: "Pagado",
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    const inserted = await Order.insertMany(pedidosDemo);

    res.json({
      message: "Pedidos de prueba creados correctamente",
      pedidos: inserted,
    });
  } catch (error) {
    console.error("Error al crear pedidos de prueba:", error);
    res.status(500).json({
      message: ["Error al crear pedidos de prueba"],
    });
  }
});

export default router;
