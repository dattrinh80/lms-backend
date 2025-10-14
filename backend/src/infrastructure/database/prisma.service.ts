import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(private readonly configService: ConfigService) {
    const isDevelopment = configService.get<string>('app.env') === 'development';

    super({
      datasources: {
        db: {
          url: configService.get<string>('database.url')
        }
      },
      errorFormat: isDevelopment ? 'pretty' : 'minimal',
      log: isDevelopment ? ['query', 'error', 'warn'] : ['error', 'warn']
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  enableShutdownHooks(app: INestApplication) {
    process.on('beforeExit', () => {
      void app.close();
    });
  }
}
