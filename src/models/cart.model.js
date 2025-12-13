import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema(
  {
    producto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    cantidad: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
  },
  { _id: false } // no necesitamos _id para cada item
);

const cartSchema = new mongoose.Schema(
  {
    usuario: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // un carrito por usuario
    },
    items: [cartItemSchema],
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);


export default mongoose.model('Cart', cartSchema);
