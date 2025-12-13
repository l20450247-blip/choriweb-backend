import { z } from 'zod';

export const createCategorySchema = z.object({
  nombre: z
    .string({
      required_error: 'El nombre de la categoría es obligatorio',
    })
    .min(3, { message: 'El nombre debe tener al menos 3 caracteres' }),
  descripcion: z
    .string()
    .max(500, { message: 'La descripción no puede exceder 500 caracteres' })
    .optional(),
  activa: z.boolean().optional(),
});

export const updateCategorySchema = z.object({
  nombre: z
    .string()
    .min(3, { message: 'El nombre debe tener al menos 3 caracteres' })
    .optional(),
  descripcion: z
    .string()
    .max(500, { message: 'La descripción no puede exceder 500 caracteres' })
    .optional(),
  activa: z.boolean().optional(),
});
