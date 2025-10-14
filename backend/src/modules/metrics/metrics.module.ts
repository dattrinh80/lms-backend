import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    PrometheusModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        path: configService.get<string>('metrics.path', '/metrics'),
        defaultMetrics: {
          enabled: true
        }
      })
    })
  ],
  exports: [PrometheusModule]
})
export class MetricsModule {}
