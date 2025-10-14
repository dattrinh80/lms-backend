import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const payload: unknown =
      exception instanceof HttpException
        ? exception.getResponse()
        : {
            statusCode: status,
            message: 'Internal server error'
          };

    const normalizedPayload =
      payload && typeof payload === 'object'
        ? (payload as Record<string, unknown>)
        : {
            message: payload
          };

    this.logger.error(
      `Error processing ${request.method ?? 'unknown'} ${request.url ?? 'unknown'}`,
      exception instanceof Error ? exception.stack : undefined
    );

    response.status(status).json({
      path: request.url,
      timestamp: new Date().toISOString(),
      ...normalizedPayload
    });
  }
}
