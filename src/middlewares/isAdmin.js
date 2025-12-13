import User from '../models/user.model.js';

export const isAdmin = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id || req.userId;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: ['Usuario no encontrado'] });
    }

    if (user.tipo !== 'admin') {
      return res.status(403).json({ message: ['Acceso solo para administradores'] });
    }

    next();
  } catch (error) {
    console.error('Error en isAdmin:', error);
    res.status(500).json({ message: ['Error al verificar rol de administrador'] });
  }
};
