import { z } from 'zod';

// REGISTRO: nombre, email, password FUERTE
export const registerSchema = z.object({
  nombre: z
    .string({
      required_error: 'El nombre es obligatorio',
    })
    .min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z
    .string({
      required_error: 'El email es obligatorio',
    })
    .email('El email no es válido'),
  password: z
    .string({
      required_error: 'La contraseña es obligatoria',
    })
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'La contraseña debe tener al menos una letra mayúscula')
    .regex(/[a-z]/, 'La contraseña debe tener al menos una letra minúscula')
    .regex(/[0-9]/, 'La contraseña debe tener al menos un número')
    .regex(
      /[^A-Za-z0-9]/,
      'La contraseña debe tener al menos un símbolo (por ejemplo: !@#$%^&*)'
    ),
});

// LOGIN: email, password y captcha sencillo
export const loginSchema = z.object({
  email: z
    .string({
      required_error: 'El email es obligatorio',
    })
    .email('El email no es válido'),
  password: z
    .string({
      required_error: 'La contraseña es obligatoria',
    })
    .min(1, 'La contraseña es obligatoria'),
  captcha: z
    .string({
      required_error: 'El captcha es obligatorio',
    })
    .min(1, 'El captcha es obligatorio'),
});
