import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER } from '@nestjs/core';

import { AllExceptionsFilter } from '@app/common/filters/http-exception.filter';
import { LoggingModule } from '@app/common/logging/logging.module';
import { RequestContextMiddleware } from '@app/common/middleware/request-context.middleware';
import { configuration, validationSchema } from '@app/config';
import { DatabaseModule } from '@app/infrastructure/database';
import { AiModule } from '@app/modules/ai/ai.module';
import { AttendanceModule } from '@app/modules/attendance/attendance.module';
import { AuthModule } from '@app/modules/auth/auth.module';
import { ClassroomsModule } from '@app/modules/classrooms/classrooms.module';
import { CurriculumModule } from '@app/modules/curriculum/curriculum.module';
import { HealthModule } from '@app/modules/health/health.module';
import { FinanceModule } from '@app/modules/finance/finance.module';
import { IdentityModule } from '@app/modules/identity/identity.module';
import { LearningModule } from '@app/modules/learning/learning.module';
import { MetricsModule } from '@app/modules/metrics/metrics.module';
import { ParentsModule } from '@app/modules/parents/parents.module';
import { SchedulingModule } from '@app/modules/scheduling/scheduling.module';

const metricsEnabled = process.env.METRICS_ENABLED !== 'false';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '.env.local', '.env.development'],
      load: [configuration],
      validationSchema
    }),
    LoggingModule,
    DatabaseModule,
    AuthModule,
    AiModule,
    AttendanceModule,
    ClassroomsModule,
    CurriculumModule,
    FinanceModule,
    IdentityModule,
    LearningModule,
    ParentsModule,
    SchedulingModule,
    HealthModule,
    ...(metricsEnabled ? [MetricsModule] : [])
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter
    }
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestContextMiddleware).forRoutes('*');
  }
}
