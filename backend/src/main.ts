import { Logger as NestLogger, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger as PinoLogger } from 'nestjs-pino';

import { AppModule } from './app.module';
import { initializeTracing, shutdownTracing } from './tracing';

async function bootstrap() {
  const tracingSdk = await initializeTracing();

  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(PinoLogger));
  const configService = app.get(ConfigService);
  const logger = new NestLogger('Bootstrap');

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidUnknownValues: true
    })
  );

  const config = new DocumentBuilder()
    .setTitle('LMS Backend')
    .setDescription('LMS modular monolith API documentation')
    .setVersion('0.1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'JWT access token',
        in: 'header'
      },
      'JWT'
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = configService.get<number>('app.port', 3000);
  await app.listen(port);

  logger.log(`Application is running on http://localhost:${port}`);
  logger.log(`Swagger docs available at http://localhost:${port}/docs`);

  const shutdown = async () => {
    await app.close();
    await shutdownTracing();
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

bootstrap().catch(async error => {
  const logger = new NestLogger('Bootstrap');
  if (error instanceof Error) {
    logger.error('Application failed to start', error.stack);
  } else {
    logger.error('Application failed to start', `${error}`);
  }
  await shutdownTracing();
  process.exit(1);
});
