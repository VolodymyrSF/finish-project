import * as process from 'node:process';
import * as dotenv from 'dotenv';
dotenv.config();
import { Config } from './config.type';

export default (): Config => ({
  app: {
    port: parseInt(process.env.APP_PORT, 10),
    host: process.env.APP_HOST,
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
    password:process.env.REDIS_PASSWORD,
  },
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET ,
    accessExpiresIn: parseInt(process.env.JWT_ACCESS_EXPIRES_IN , 10),
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    refreshExpiresIn: parseInt(process.env.JWT_REFRESH_EXPIRES_IN, 10) || 86400,
    activationSecret: process.env.JWT_ACTIVATION_SECRET,
    activationExpiresIn: parseInt(process.env.JWT_ACTIVATION_EXPIRES_IN, 10) || 1800,
    resetSecret: process.env.JWT_RESET_SECRET,
    resetExpiresIn: parseInt(process.env.JWT_RESET_EXPIRES_IN, 10) || 1800,
  },

});


