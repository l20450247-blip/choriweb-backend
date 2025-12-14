import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from './routes/auth.routes.js';
import categoryRoutes from './routes/category.routes.js';
import productRoutes from './routes/product.routes.js';
import cartRoutes from './routes/cart.routes.js';
import orderRoutes from './routes/order.routes.js';

import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

/*CORS (Local + Vercel) */
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://choriweb-frontend.vercel.app',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Permitir requests sin origin (Postman, Render health checks)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

/* Middlewares*/
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser());

// Log de requests
app.use((req, _res, next) => {
  console.log(`[REQ] ${req.method} ${req.url}`);
  next();
});

/* ======================
   Rutas
====================== */
app.use('/api/auth', authRoutes);
app.use('/api/categorias', categoryRoutes);
app.use('/api/productos', productRoutes);
app.use('/api/carrito', cartRoutes);
app.use('/api/pedidos', orderRoutes);

// Ruta raíz (health check)
app.get('/', (_req, res) => {
  res.json({ message: 'API Choriweb funcionando' });
});

/*Errores*/
app.use(errorHandler);

export default app;
