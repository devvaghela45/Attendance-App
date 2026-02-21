import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: process.env.JWT_SECRET ?? 'change-me',
  encryptionKey: process.env.ENCRYPTION_KEY ?? '0123456789abcdef0123456789abcdef'
};
