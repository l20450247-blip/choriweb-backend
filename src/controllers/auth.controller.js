import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { createAccessToken } from "../libs/jwt.js";

// Helper: opciones de cookie correctas según ambiente
const getCookieOptions = (req) => {
  const isProd = process.env.NODE_ENV === "production";

  // En Render/Vercel normalmente SIEMPRE es https
  // (aunque Express a veces no detecta req.secure si no hay proxy configurado)
  // así que nos guiamos por NODE_ENV.
  return {
    httpOnly: true,
    secure: isProd,                 // ✅ true en producción
    sameSite: isProd ? "none" : "lax", // ✅ none en prod (cross-site), lax en local
    path: "/",                      // recomendado
  };
};

/* REGISTRO DE USUARIO (POST /api/auth/register) */
export const register = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    const userFound = await User.findOne({ email });
    if (userFound) {
      return res.status(400).json({ message: ["El email ya está registrado"] });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = new User({
      nombre,
      email,
      password: passwordHash,
      tipo: "cliente",
    });

    const userSaved = await newUser.save();

    // Crear token
    const token = await createAccessToken({ id: userSaved._id });

    // Cookie (para quien sí use cookies)
    res.cookie("token", token, getCookieOptions(req));

    // JSON (para Authorization)
    return res.status(201).json({
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
    console.error("Error en register:", error);
    return res.status(500).json({ message: ["Error en el registro"] });
  }
};

/* LOGIN (POST /api/auth/login) CON GOOGLE reCAPTCHA v2 */
export const login = async (req, res) => {
  try {
    const { email, password, captcha } = req.body;

    if (!captcha) {
      return res.status(400).json({ message: ["Falta validar el reCAPTCHA"] });
    }

    const secret =
      process.env.RECAPTCHA_SECRET_KEY ||
      "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe"; // clave de prueba

    const params = new URLSearchParams();
    params.append("secret", secret);
    params.append("response", captcha);

    const googleRes = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const googleData = await googleRes.json();

    if (!googleData.success) {
      return res.status(400).json({ message: ["Captcha inválido"] });
    }

    const userFound = await User.findOne({ email });
    if (!userFound) {
      return res.status(400).json({ message: ["Usuario o contraseña incorrectos"] });
    }

    const isMatch = await bcrypt.compare(password, userFound.password);
    if (!isMatch) {
      return res.status(400).json({ message: ["Usuario o contraseña incorrectos"] });
    }

    const token = await createAccessToken({ id: userFound._id });

    // Cookie (para quien sí use cookies)
    res.cookie("token", token, getCookieOptions(req));

    // JSON (para Authorization)
    return res.json({
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
    console.error("Error en login:", error);
    return res.status(500).json({ message: ["Error al iniciar sesión"] });
  }
};

/* LOGOUT (POST /api/auth/logout) */
export const logout = (_req, res) => {
  try {
    // borrar cookie
    res.cookie("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      path: "/",
      expires: new Date(0),
    });

    return res.json({ message: "Sesión cerrada correctamente" });
  } catch (error) {
    console.error("Error en logout:", error);
    return res.status(500).json({ message: ["Error al cerrar sesión"] });
  }
};

/* PROFILE (GET /api/auth/profile) Requiere authRequired antes en la ruta */
export const profile = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id || req.userId;

    const userFound = await User.findById(userId);
    if (!userFound) {
      return res.status(404).json({ message: ["Usuario no encontrado"] });
    }

    return res.json({
      id: userFound._id,
      nombre: userFound.nombre,
      email: userFound.email,
      tipo: userFound.tipo,
      activo: userFound.activo,
      createdAt: userFound.createdAt,
      updatedAt: userFound.updatedAt,
    });
  } catch (error) {
    console.error("Error en profile:", error);
    return res.status(500).json({ message: ["Error al obtener el perfil"] });
  }
};
