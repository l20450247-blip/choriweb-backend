// src/controllers/product.controller.js
import Product from '../models/product.model.js';

/**
 * Crear producto (ADMIN)
 * POST /api/productos
 */
export const createProduct = async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      precio,
      categoria,   // ID de la categoría
      disponible,  // opcional, por defecto true
    } = req.body;

    const newProduct = new Product({
      nombre,
      descripcion,
      precio,
      categoria,
      disponible: disponible ?? true,
    });

    const productSaved = await newProduct.save();

    res.status(201).json(productSaved);
  } catch (error) {
    console.error('Error en createProduct:', error);
    res.status(500).json({ message: ['Error al crear producto'] });
  }
};

/**
 * Listar productos (ADMIN – panel)
 * GET /api/productos
 */
export const getProducts = async (_req, res) => {
  try {
    const products = await Product.find().populate('categoria');
    res.json(products);
  } catch (error) {
    console.error('Error en getProducts:', error);
    res.status(500).json({ message: ['Error al obtener productos'] });
  }
};

/**
 * Obtener un producto por ID (ADMIN)
 * GET /api/productos/:id
 */
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('categoria');

    if (!product) {
      return res.status(404).json({ message: ['Producto no encontrado'] });
    }

    res.json(product);
  } catch (error) {
    console.error('Error en getProduct:', error);
    res.status(500).json({ message: ['Error al obtener producto'] });
  }
};

/**
 * Actualizar producto (ADMIN)
 * PUT /api/productos/:id
 */
export const updateProduct = async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: ['Producto no encontrado'] });
    }

    res.json(updated);
  } catch (error) {
    console.error('Error en updateProduct:', error);
    res.status(500).json({ message: ['Error al actualizar producto'] });
  }
};

/**
 * Eliminar producto (ADMIN)
 * DELETE /api/productos/:id
 */
export const deleteProduct = async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: ['Producto no encontrado'] });
    }

    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error en deleteProduct:', error);
    res.status(500).json({ message: ['Error al eliminar producto'] });
  }
};

/**
 * 🔹 Obtener todos los productos para CLIENTE
 * GET /api/productos/getallproducts
 * (solo productos disponibles, ordenados del más nuevo al más viejo)
 */
export const getAllProducts = async (_req, res) => {
  try {
    const products = await Product.find({ disponible: true })
      .populate('categoria')
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    console.error('Error en getAllProducts:', error);
    res.status(500).json({ message: ['Error al obtener todos los productos'] });
  }
};
