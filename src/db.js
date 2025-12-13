import mongoose from 'mongoose';
import { MONGODB_URI } from './config.js';

export async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log(' Conectado a MongoDB');
  } catch (error) {
    console.error(' No se pudo conectar a MongoDB:', error.message);
    // OJO: ya no hacemos process.exit(1)
  }
}
