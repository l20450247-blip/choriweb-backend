// 🔹 Cargar variables de entorno ANTES de todo
import 'dotenv/config';

import app from './app.js';
import { PORT } from './config.js';
import { connectDB } from './db.js';

async function main() {
  await connectDB();

  app.listen(PORT, () => {
    console.log(` Servidor corriendo en el puerto ${PORT}`);
  });
}

main().catch((err) => {
  console.error('Error al iniciar la aplicación:', err);
});
