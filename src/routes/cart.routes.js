// src/routes/cart.routes.js
import { Router } from "express";
import {
  getCart,
  addToCart,
  clearCart,
} from "../controllers/cart.controller.js";
// Si quieres proteger estas rutas, luego le agregamos authRequired aquí.

const router = Router();

// Obtener carrito actual
router.get("/", getCart);

// Agregar producto al carrito
router.post("/agregar", addToCart);

// Vaciar carrito
router.delete("/limpiar", clearCart);

export default router;
