export default () => ({
  app: {
    name: process.env.APP_NAME ?? 'LMS Backend',
    env: process.env.NODE_ENV ?? 'development',
    port: parseInt(process.env.PORT ?? '3000', 10)
  },
  logging: {
    level: process.env.LOG_LEVEL ?? 'info',
    pretty: process.env.LOG_PRETTY === 'true'
  },
  database: {
    url: process.env.DATABASE_URL ?? '',
    shadowUrl: process.env.SHADOW_DATABASE_URL ?? ''
  },
  auth: {
    accessTokenSecret: process.env.JWT_ACCESS_TOKEN_SECRET ?? '',
    accessTokenExpiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN ?? '15m',
    refreshTokenSecret: process.env.JWT_REFRESH_TOKEN_SECRET ?? '',
    refreshTokenExpiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN ?? '7d'
  },
  cache: {
    redisUrl: process.env.REDIS_URL ?? ''
  },
  queue: {
    bullRedisUrl: process.env.BULL_REDIS_URL ?? '',
    rabbitMqUrl: process.env.RABBITMQ_URL ?? ''
  },
  files: {
    driver: process.env.FILES_DRIVER ?? 's3',
    s3: {
      endpoint: process.env.FILES_S3_ENDPOINT ?? '',
      accessKey: process.env.FILES_S3_ACCESS_KEY ?? '',
      secretKey: process.env.FILES_S3_SECRET_KEY ?? '',
      bucket: process.env.FILES_S3_BUCKET ?? ''
    }
  },
  observability: {
    otlpEndpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT ?? '',
    sentryDsn: process.env.SENTRY_DSN ?? ''
  },
  metrics: {
    enabled: process.env.METRICS_ENABLED !== 'false',
    path: process.env.METRICS_PATH ?? '/metrics'
  },
  tracing: {
    enabled: process.env.TRACING_ENABLED === 'true',
    serviceName: process.env.OTEL_SERVICE_NAME ?? 'lms-backend'
  },
  payments: {
    provider: process.env.PAYMENTS_PROVIDER ?? 'vnpay',
    vnpay: {
      tmnCode: process.env.PAYMENTS_VNPAY_TMNCODE ?? '',
      hashSecret: process.env.PAYMENTS_VNPAY_HASH_SECRET ?? ''
    }
  }
});
