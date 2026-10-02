export interface AppConfig {
  port: number;
  mongodbUri: string;
  jwtSecret: string;
  jwtRefreshSecret: string;
  jwtAccessExpiresIn: string;
  jwtRefreshExpiresIn: string;
  cloudinary: {
    cloudName?: string;
    apiKey?: string;
    apiSecret?: string;
  };
  corsOrigin: string[];
  nodeEnv: string;
  cookieDomain?: string;
}

export default (): AppConfig => ({
  port: parseInt(process.env.PORT ?? '4000', 10),
  mongodbUri:
    process.env.MONGODB_URI ?? 'mongodb://127.0.0.1:27017/bhanvi-solar',
  jwtSecret: process.env.JWT_SECRET ?? 'dev-insecure-access-secret-change-me',
  jwtRefreshSecret:
    process.env.JWT_REFRESH_SECRET ?? 'dev-insecure-refresh-secret-change-me',
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN ?? '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN ?? '7d',
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  corsOrigin: (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim()),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  cookieDomain: process.env.COOKIE_DOMAIN,
});
