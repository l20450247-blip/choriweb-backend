// Middleware global de manejo de errores
export const errorHandler = (err, req, res, _next) => {
  console.error('Error no manejado:', err);

  // Si ya se enviaron headers, delegamos a Express
  if (res.headersSent) {
    return res.end();
  }

  const statusCode = err.statusCode || 500;
  const message =
    err.message || 'Error interno del servidor. Intenta más tarde.';

  // Siempre respondemos en el mismo formato
  res.status(statusCode).json({
    message: [message],
  });
};
