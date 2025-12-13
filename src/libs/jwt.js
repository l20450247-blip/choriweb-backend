import jwt from 'jsonwebtoken';

const TOKEN_SECRET = process.env.TOKEN_SECRET || 'CHORIWEB_SUPER_SECRET_2025';

export const createAccessToken = (payload) => {
  return new Promise((resolve, reject) => {
    jwt.sign(
      payload,
      TOKEN_SECRET,
      {
        // dura 7 dias, suficiente para tus pruebas
        expiresIn: '7d',
      },
      (err, token) => {
        if (err) return reject(err);
        resolve(token);
      }
    );
  });
};
