import jwt from 'jsonwebtoken';

const TOKEN_SECRET = process.env.TOKEN_SECRET || 'CHORIWEB_SUPER_SECRET_2025';

export const authRequired = (req, res, next) => {
  try {
    let token = null;

    // 1) Intentar leer token desde cookie
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // 2) Si no hay cookie, intentar leer desde Authorization: Bearer xxx
    if (!token && req.headers.authorization) {
      const [scheme, value] = req.headers.authorization.split(' ');
      if (scheme === 'Bearer' && value) {
        token = value;
      }
    }

    // 3) Si no hay token en ningun lado
    if (!token) {
      return res.status(401).json({
        message: ['No autorizado, falta token'],
      });
    }

    // 4) Verificar token
    const decoded = jwt.verify(token, TOKEN_SECRET);

    // Guardamos info del usuario en req.user (viene { id: ... })
    req.user = decoded;

    next();
  } catch (error) {
    console.error('Error al verificar JWT:', error.message);
    return res.status(401).json({
      message: ['Token inválido o expirado'],
    });
  }
};
