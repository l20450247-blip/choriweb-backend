// src/middlewares/upload.js
import multer from 'multer';

//  Usamos almacenamiento en memoria (RAM),
// así tenemos el buffer para mandarlo a Cloudinary
const storage = multer.memoryStorage();

// Este es el middleware que usamos en product.routes.js
export const upload = multer({ storage });
