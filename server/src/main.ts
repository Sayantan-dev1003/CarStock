import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // CORS
  app.enableCors();

  // Swagger / OpenAPI
  const config = new DocumentBuilder()
    .setTitle('CarStock Admin API')
    .setDescription('Admin-only inventory and billing management API for a car accessories shop')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        in: 'header',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  // Socket.io gateway runs on the same port as the HTTP server automatically
  // — no extra configuration needed. Connect via ws://localhost:<port>
  console.log(`🚀 CarStock server running on http://localhost:${port}`);
  console.log(`📚 Swagger docs at   http://localhost:${port}/api/docs`);
  console.log(`🔌 WebSocket gateway at  ws://localhost:${port}`);
}

bootstrap();
