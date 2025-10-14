import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { randomUUID } from 'crypto';

@Module({
  imports: [
    LoggerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const level = configService.get<string>('logging.level') ?? 'info';
        const pretty = configService.get<boolean>('logging.pretty') ?? false;

        return {
          pinoHttp: {
            level,
            transport: pretty
              ? {
                  target: 'pino-pretty',
                  options: {
                    translateTime: 'SYS:standard',
                    singleLine: false,
                    ignore: 'pid,hostname'
                  }
                }
              : undefined,
            redact: {
              paths: ['req.headers.authorization', 'req.headers.cookie', 'res.headers["set-cookie"]'],
              remove: true
            },
            genReqId: req => {
              const existing = req.headers['x-request-id'];
              return (Array.isArray(existing) ? existing[0] : existing)?.toString() ?? randomUUID();
            },
            customProps: (_req, res) => {
              const locals = (res as { locals?: { requestId?: string } }).locals;

              return {
                requestId: locals?.requestId,
                context: 'HTTP'
              };
            }
          }
        };
      }
    })
  ],
  exports: [LoggerModule]
})
export class LoggingModule {}
