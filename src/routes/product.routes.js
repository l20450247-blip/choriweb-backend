import { Router } from 'express';
import Product from '../models/product.model.js';
import Category from '../models/category.model.js';
import { authRequired } from '../middlewares/validateToken.js';
import { isAdmin } from '../middlewares/isAdmin.js';

// Cloudinary + Multer + Streamifier
import { v2 as cloudinary } from 'cloudinary';
import { upload } from '../middlewares/upload.js';
import streamifier from 'streamifier';

// Configurar Cloudinary directamente aquí
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,  // .env
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Logs para comprobar que sí lee las variables
console.log('[CLOUDINARY] CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME);
console.log(
  '[CLOUDINARY] Tiene API_KEY?',
  !!process.env.CLOUDINARY_API_KEY
);
console.log(
  '[CLOUDINARY] Tiene API_SECRET?',
  !!process.env.CLOUDINARY_API_SECRET
);

const router = Router();

// Helper para subir un buffer a Cloudinary
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'choriweb_productos' }, // carpeta en Cloudinary
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    // Enviamos el buffer (que viene de Multer) al stream de Cloudinary
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

// Log de productos
router.use((req, _res, next) => {
  console.log(`[PRODUCTOS] ${req.method} ${req.originalUrl}`);
  next();
});

/**
 * Función auxiliar para listar productos
 * (la usamos en '/' y en '/getallproducts')
 */
const listarProductos = async (_req, res) => {
  try {
    const products = await Product.find()
      .populate('categoria', 'nombre')
      .sort({ createdAt: -1 });

    console.log(`Productos enviados: ${products.length}`);
    res.json(products);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).json({ message: ['Error al obtener los productos'] });
  }
};

/* ➕ CREAR PRODUCTO (SOLO ADMIN) 
   POST /api/productos
   Ahora acepta:
   - Campos normales en body (nombre, descripcion, precio, disponible, categoria)
   - Una imagen en el campo "imagen" (form-data) que se sube a Cloudinary
*/
router.post(
  '/',
  authRequired,
  isAdmin,
  upload.single('imagen'), //  Multer recibe el archivo
  async (req, res) => {
    console.log('Datos recibidos (producto):', req.body);
    console.log('Archivo recibido:', req.file?.originalname);

    try {
      const { nombre, descripcion, precio, disponible, categoria } = req.body;

      // Validaciones básicas
      if (!nombre || nombre.trim().length < 3) {
        console.log('Error: nombre inválido');
        return res.status(400).json({
          message: ['El nombre es obligatorio y debe tener al menos 3 caracteres'],
        });
      }

      if (precio == null || isNaN(precio) || Number(precio) < 0) {
        console.log('Error: precio inválido');
        return res.status(400).json({
          message: [
            'El precio es obligatorio y debe ser un número mayor o igual a 0',
          ],
        });
      }

      if (!categoria) {
        console.log('Error: falta categoría');
        return res.status(400).json({
          message: ['La categoría es obligatoria'],
        });
      }

      // Verificar que la categoría exista
      const categoryFound = await Category.findById(categoria);
      if (!categoryFound) {
        console.log('Error: categoría no existe');
        return res
          .status(404)
          .json({ message: ['La categoría seleccionada no existe'] });
      }

      // Imagen: si viene archivo, lo subimos a Cloudinary
      let imagen_url = req.body.imagen_url || null;

      if (req.file && req.file.buffer) {
        try {
          const result = await uploadToCloudinary(req.file.buffer);
          imagen_url = result.secure_url;
          console.log('Imagen subida a Cloudinary:', imagen_url);
        } catch (errImg) {
          console.error('Error subiendo imagen a Cloudinary:', errImg);
          return res.status(500).json({
            message: [
              'Error al subir la imagen del producto',
              errImg?.message || 'Error desconocido de Cloudinary',
            ],
          });
        }
      }

      const product = new Product({
        nombre: nombre.trim(),
        descripcion,
        precio,
        disponible: disponible !== undefined ? disponible : true,
        imagen_url, //  Guardamos la URL de Cloudinary
        categoria,
      });

      const savedProduct = await product.save();
      console.log('Producto creado:', savedProduct.nombre);

      res.status(201).json(savedProduct);
    } catch (error) {
      console.error('Error al crear producto:', error);
      //  Ahora mostramos más detalle para saber qué truena
      res.status(500).json({
        message: [
          'Error al crear el producto',
          error?.message || 'Error desconocido en creación de producto',
        ],
      });
    }
  }
);

/* LISTAR TODOS LOS PRODUCTOS (PÚBLICO) 
   GET /api/productos
*/
router.get('/', listarProductos);

/*  LISTAR TODOS LOS PRODUCTOS (CLIENTE LOGUEADO)
   GET /api/productos/getallproducts
   – Esta ruta la usaremos desde el Front como en el PDF del profe
*/
router.get('/getallproducts', authRequired, listarProductos);

/*  OBTENER UN PRODUCTO POR ID (PÚBLICO) */
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'categoria',
      'nombre'
    );

    if (!product) {
      console.log('Producto no encontrado');
      return res
        .status(404)
        .json({ message: ['Producto no encontrado'] });
    }

    console.log('Producto encontrado:', product.nombre);
    res.json(product);
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ message: ['Error al obtener el producto'] });
  }
});

/*  ACTUALIZAR PRODUCTO (SOLO ADMIN) */
router.put('/:id', authRequired, isAdmin, async (req, res) => {
  console.log(`Actualizar producto ${req.params.id} con:`, req.body);

  try {
    const { nombre, precio, categoria } = req.body;

    if (nombre && nombre.trim().length < 3) {
      return res.status(400).json({
        message: [
          'El nombre del producto debe tener al menos 3 caracteres',
        ],
      });
    }

    if (precio != null && (isNaN(precio) || Number(precio) < 0)) {
      return res.status(400).json({
        message: ['El precio debe ser un número mayor o igual a 0'],
      });
    }

    if (categoria) {
      const categoryFound = await Category.findById(categoria);
      if (!categoryFound) {
        return res
          .status(404)
          .json({ message: ['La categoría seleccionada no existe'] });
      }
    }

    const productUpdated = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!productUpdated) {
      console.log('Producto no encontrado para actualizar');
      return res
        .status(404)
        .json({ message: ['Producto no encontrado'] });
    }

    console.log('Producto actualizado:', productUpdated.nombre);
    res.json(productUpdated);
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ message: ['Error al actualizar el producto'] });
  }
});

/*  ELIMINAR PRODUCTO (SOLO ADMIN) */
router.delete('/:id', authRequired, isAdmin, async (req, res) => {
  console.log(`Eliminando producto ${req.params.id}`);

  try {
    const productDeleted = await Product.findByIdAndDelete(req.params.id);

    if (!productDeleted) {
      console.log('Producto no encontrado para eliminar');
      return res
        .status(404)
        .json({ message: ['Producto no encontrado'] });
    }

    console.log('Producto eliminado:', productDeleted.nombre);
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ message: ['Error al eliminar el producto'] });
  }
});

export default router;
