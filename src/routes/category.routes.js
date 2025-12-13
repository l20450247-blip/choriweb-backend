import { Router } from 'express';
import Category from '../models/category.model.js';
import { authRequired } from '../middlewares/validateToken.js';
import { isAdmin } from '../middlewares/isAdmin.js';

const router = Router();

// Log para ver las peticiones de categorías
router.use((req, _res, next) => {
  console.log(`[CATEGORIAS] ${req.method} ${req.originalUrl}`);
  next();
});

/*CREAR CATEGORÍA SOLO ADMIN */
router.post('/', authRequired, isAdmin, async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    if (!nombre || nombre.trim().length < 3) {
      return res.status(400).json({
        message: ['El nombre es obligatorio y debe tener al menos 3 caracteres'],
      });
    }

    const existing = await Category.findOne({ nombre: nombre.trim() });
    if (existing) {
      return res.status(400).json({
        message: ['Ya existe una categoría con ese nombre'],
      });
    }

    const category = new Category({
      nombre: nombre.trim(),
      descripcion,
      activa: true,
    });

    const savedCategory = await category.save();
    console.log('Categoría creada:', savedCategory.nombre);

    res.status(201).json(savedCategory);
  } catch (error) {
    console.error('Error al crear categoría:', error);
    res.status(500).json({ message: ['Error al crear la categoría'] });
  }
});

/* LISTAR CATEGORÍAS PÚBLICO*/
router.get('/', async (_req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.json(categories);
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    res.status(500).json({ message: ['Error al obtener las categorías'] });
  }
});

/*  OBTENER UNA CATEGORÍA PÚBLICO */
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: ['Categoría no encontrada'] });
    }

    res.json(category);
  } catch (error) {
    console.error('Error al obtener categoría:', error);
    res.status(500).json({ message: ['Error al obtener la categoría'] });
  }
});

/*ACTUALIZAR CATEGORÍA SOLO ADMIN */
router.put('/:id', authRequired, isAdmin, async (req, res) => {
  try {
    const { nombre } = req.body;

    if (nombre && nombre.trim().length < 3) {
      return res.status(400).json({
        message: ['El nombre debe tener al menos 3 caracteres'],
      });
    }

    const updated = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updated) {
      return res.status(404).json({ message: ['Categoría no encontrada'] });
    }

    console.log('Categoría actualizada:', updated.nombre);
    res.json(updated);
  } catch (error) {
    console.error('Error al actualizar categoría:', error);
    res.status(500).json({ message: ['Error al actualizar la categoría'] });
  }
});

/*ELIMINAR CATEGORÍA SOLO ADMIN*/
router.delete('/:id', authRequired, isAdmin, async (req, res) => {
  try {
    const deleted = await Category.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: ['Categoría no encontrada'] });
    }

    console.log('Categoría eliminada:', deleted.nombre);
    res.json({ message: 'Categoría eliminada correctamente' });
  } catch (error) {
    console.error('Error al eliminar categoría:', error);
    res.status(500).json({ message: ['Error al eliminar la categoría'] });
  }
});

export default router;
