import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { SwaggerHelper } from './helpers/swagger.helpers';
import { AppConfig } from './config/config.type';
import { SeedService } from '../src/modules/seed/seed.service';
import cookieParser from 'cookie-parser';
import { DataSource } from 'typeorm';


async function bootstrap() {
  const app = await NestFactory.create(AppModule,{
    logger: ['log', 'error', 'warn', 'debug', 'verbose']
  });
  app.use(cookieParser());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );


  app.enableCors({
    origin: 'http://localhost:3000',
    allowedHeaders: ['Authorization', 'Content-Type'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });

  const config = new DocumentBuilder()
    .setTitle('FINAL PROJECT')
    .setDescription('My final project')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
      'JWT',
    )
    .build();



  const document = SwaggerModule.createDocument(app, config);

  if (SwaggerHelper) {
    SwaggerHelper.setDefaultResponses(document);
  }

  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      docExpansion: 'list',
      defaultModelsExpandDepth: -1,
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  const configService = app.get(ConfigService);
  const appConfig = configService.get<AppConfig>('app');

  if (!appConfig) {
    throw new Error('App configuration is missing');
  }


  const seedService = app.get(SeedService);
  await seedService.seed();




  await app.listen(appConfig.port, () => {
    console.log(`Server is running on http://${appConfig.host}:${appConfig.port}`);
    console.log(`Swagger is running on http://${appConfig.host}:${appConfig.port}/docs`);
  });



}

void bootstrap();