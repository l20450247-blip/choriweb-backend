import { Router } from 'express';
import {
  register,
  login,
  logout,
  profile,
} from '../controllers/auth.controller.js';
import { validateSchema } from '../middlewares/validateSchema.js';
import { registerSchema, loginSchema } from '../schemas/auth.schema.js';
import { authRequired } from '../middlewares/validateToken.js';
import rateLimit from 'express-rate-limit';

const router = Router();

// Limitar intentos de login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máximo 10 intentos por IP en ese tiempo
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: ['Demasiados intentos de login. Intenta de nuevo más tarde.'],
  },
});

router.post('/register', validateSchema(registerSchema), register);
router.post('/login', loginLimiter, validateSchema(loginSchema), login);
router.post('/logout', logout);
router.get('/profile', authRequired, profile);

export default router;
