export const validateSchema = (schema) => (req, res, next) => {
  
  const result = schema.safeParse(req.body);

  if (!result.success) {
    console.error(
      'Error de validación Zod:',
      result.error.issues.map((issue) => issue.message)
    );

    return res.status(400).json({
      message: result.error.issues.map((issue) => issue.message),
    });
  }

 
  next();
};
