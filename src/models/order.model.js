// backend/src/models/order.model.js
import mongoose from "mongoose";

// Items del pedido
const orderItemSchema = new mongoose.Schema(
  {
    producto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product", // deja "Product" si así se llama tu modelo
      required: true,
    },
    cantidad: {
      type: Number,
      required: true,
      min: 1,
    },
    precioUnitario: {
      type: Number,
      required: true,
      min: 0,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

// Dirección de entrega
const direccionSchema = new mongoose.Schema(
  {
    calle: { type: String, required: true },
    numero: { type: String, required: true },
    colonia: { type: String, required: true },
    municipio: { type: String, required: true },
    estado: { type: String, required: true },
    cp: { type: String, required: true },
    telefono: { type: String, required: true },
    referencias: { type: String },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Productos del pedido
    items: [orderItemSchema],

    total: {
      type: Number,
      required: true,
      min: 0,
    },

    // Dirección de entrega completa
    direccion: {
      type: direccionSchema,
      required: true,
    },

    // Método de pago (por ahora puro pago al entregar)
    metodoPago: {
      type: String,
      enum: ["pago_en_entrega", "transferencia"],
      default: "pago_en_entrega",
    },

    // Estado del pedido (logística)
    estado: {
      type: String,
      enum: ["Pendiente", "Preparando", "En camino", "Entregado", "Cancelado"],
      default: "Pendiente",
    },

    //  Estado del pago (lo que cambias en Admin: Pendiente / Pagado)
    estadoPago: {
      type: String,
      enum: ["Pendiente", "Pagado"],
      default: "Pendiente",
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

export default mongoose.model("Order", orderSchema);
