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

  const corsConfig = configService.get<{
    enabled: boolean;
    origin: true | string[];
    credentials?: boolean;
    allowedHeaders?: string[];
    methods?: string[];
  }>('cors');

  if (corsConfig?.enabled) {
    const origin =
      Array.isArray(corsConfig.origin) && corsConfig.origin.length === 0
        ? true
        : corsConfig.origin;
    app.enableCors({
      origin,
      credentials: corsConfig.credentials,
      ...(corsConfig.allowedHeaders ? { allowedHeaders: corsConfig.allowedHeaders } : {}),
      ...(corsConfig.methods ? { methods: corsConfig.methods } : {})
    });
  }

  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidUnknownValues: true
    })
  );

  const config = new DocumentBuilder()
    .setTitle('LMS Backend API')
    .setDescription('Learning Management System modular monolith API documentation')
    .setVersion('1.0.0')
    .addServer('http://localhost:3000/api', 'Development server')
    .addServer('https://api.lms.example.com/api', 'Production server')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT access token in the format: Bearer <token>',
        in: 'header'
      },
      'JWT'
    )
    .addTag('auth', 'Authentication and authorization endpoints')
    .addTag('users', 'User management endpoints')
    .addTag('admin-students', 'Student profile and account management (Admin only)')
    .addTag('admin-teachers', 'Teacher profile and account management (Admin only)')
    .addTag('admin-parents', 'Parent profile and account management (Admin only)')
    .addTag('parent-portal', 'Parent-facing endpoints for accessing student information')
    .addTag('classes', 'Class section and room management')
    .addTag('subjects', 'Subject curriculum management')
    .addTag('scheduling', 'Teaching session scheduling')
    .addTag('attendance', 'Student attendance tracking')
    .addTag('assignments', 'Assignment management')
    .addTag('grading', 'Grade recording and management')
    .addTag('finance', 'Financial records and invoicing')
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
