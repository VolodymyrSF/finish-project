import * as process from 'node:process';
import * as dotenv from 'dotenv';
dotenv.config();
import { Config } from './config.type';

export default (): Config => ({
  app: {
    port: parseInt(process.env.APP_PORT ?? '3000', 10),
    host: process.env.APP_HOST ?? 'localhost',
  },
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT,10),
    username: process.env.POSTGRES_USERNAME,
    password: process.env.POSTGRES_PASSWORD,
    name: process.env.DB_NAME,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ,
    accessExpiresIn: parseInt(process.env.JWT_ACCESS_EXPIRES_IN , 10),
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: parseInt(process.env.JWT_REFRESH_EXPIRES_IN, 10) || 86400,
  },

});


