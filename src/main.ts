import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  // All routes are served under /api.
  app.setGlobalPrefix('api');

  // Allow the React frontend to call the API.
  app.enableCors({
    origin: config.get<string>('FRONTEND_ORIGIN') ?? 'http://localhost:5173',
  });

  // Validate and strip incoming payloads against DTOs.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = config.get<number>('PORT') ?? 3000;
  await app.listen(port);
}
bootstrap();
