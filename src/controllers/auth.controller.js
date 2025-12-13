import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import { createAccessToken } from '../libs/jwt.js';

/* REGISTRO DE USUARIO (POST /api/auth/register) */
export const register = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    // Zod ya validó los datos antes de llegar aquí

    const userFound = await User.findOne({ email });
    if (userFound) {
      return res
        .status(400)
        .json({ message: ['El email ya está registrado'] });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new User({
      nombre,
      email,
      password: passwordHash,
      // Siempre registramos como cliente
      tipo: 'cliente',
    });

    const userSaved = await newUser.save();

    // Crear token para el nuevo usuario
    const token = await createAccessToken({ id: userSaved._id });

    // Guardamos el token en cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // poner true en producción con HTTPS
      sameSite: 'lax',
    });

    // También devolvemos el token en el JSON
    res.status(201).json({
      id: userSaved._id,
      nombre: userSaved.nombre,
      email: userSaved.email,
      tipo: userSaved.tipo,
      activo: userSaved.activo,
      createdAt: userSaved.createdAt,
      updatedAt: userSaved.updatedAt,
      token,
    });
  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({ message: ['Error en el registro'] });
  }
};

/* LOGIN (POST /api/auth/login) CON GOOGLE reCAPTCHA v2 */
export const login = async (req, res) => {
  try {
    const { email, password, captcha } = req.body;

    // Verificar que venga el token del reCAPTCHA
    if (!captcha) {
      return res
        .status(400)
        .json({ message: ['Falta validar el reCAPTCHA'] });
    }

    // Obtener SECRET: del .env o, si falla, usar el de prueba por defecto
    const secret =
      process.env.RECAPTCHA_SECRET_KEY ||
      '6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe';

    console.log('SECRET usado para reCAPTCHA:', secret ? 'OK' : 'VACIO');
    console.log('Captcha recibido del front:', captcha);

    // Verificar el token con Google reCAPTCHA usando FORM URLENCODED
    const params = new URLSearchParams();
    params.append('secret', secret);
    params.append('response', captcha);

    const googleRes = await fetch(
      'https://www.google.com/recaptcha/api/siteverify',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      }
    );

    const googleData = await googleRes.json();
    console.log('Respuesta reCAPTCHA:', googleData);

    if (!googleData.success) {
      return res.status(400).json({ message: ['Captcha inválido'] });
    }

    // Buscar usuario por email
    const userFound = await User.findOne({ email });
    if (!userFound) {
      return res
        .status(400)
        .json({ message: ['Usuario o contraseña incorrectos'] });
    }

    // Comparar contraseña
    const isMatch = await bcrypt.compare(password, userFound.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: ['Usuario o contraseña incorrectos'] });
    }

    // Crear token con el id del usuario
    const token = await createAccessToken({ id: userFound._id });

    // Guardar token en cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // poner true en producción con HTTPS
      sameSite: 'lax',
    });

    // Devolvemos datos del usuario + token
    res.json({
      id: userFound._id,
      nombre: userFound.nombre,
      email: userFound.email,
      tipo: userFound.tipo,
      activo: userFound.activo,
      createdAt: userFound.createdAt,
      updatedAt: userFound.updatedAt,
      token,
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: ['Error al iniciar sesión'] });
  }
};

/* LOGOUT (POST /api/auth/logout) */
export const logout = (_req, res) => {
  try {
    res.cookie('token', '', {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      expires: new Date(0),
    });

    res.json({ message: 'Sesión cerrada correctamente' });
  } catch (error) {
    console.error('Error en logout:', error);
    res.status(500).json({ message: ['Error al cerrar sesión'] });
  }
};

/* PROFILE (GET /api/auth/profile) Requiere authRequired antes en la ruta */
export const profile = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id || req.userId;

    const userFound = await User.findById(userId);

    if (!userFound) {
      return res.status(404).json({ message: ['Usuario no encontrado'] });
    }

    res.json({
      id: userFound._id,
      nombre: userFound.nombre,
      email: userFound.email,
      tipo: userFound.tipo,
      activo: userFound.activo,
      createdAt: userFound.createdAt,
      updatedAt: userFound.updatedAt,
    });
  } catch (error) {
    console.error('Error en profile:', error);
    res.status(500).json({ message: ['Error al obtener el perfil'] });
  }
};
