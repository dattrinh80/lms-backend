import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { DatabaseModule } from '@app/infrastructure/database';

import { HealthController } from './health.controller';
import { PrismaHealthIndicator } from './prisma.health-indicator';

@Module({
  imports: [TerminusModule, DatabaseModule],
  controllers: [HealthController],
  providers: [PrismaHealthIndicator]
})
export class HealthModule {}
