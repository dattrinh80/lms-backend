import Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
  APP_NAME: Joi.string().default('LMS Backend'),

  LOG_LEVEL: Joi.string().default('info'),
  LOG_PRETTY: Joi.boolean().truthy('true').falsy('false').optional(),

  DATABASE_URL: Joi.string().uri().required(),
  SHADOW_DATABASE_URL: Joi.string().uri().allow('').optional(),

  JWT_ACCESS_TOKEN_SECRET: Joi.string().min(16).required(),
  JWT_ACCESS_TOKEN_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_TOKEN_SECRET: Joi.string().min(16).required(),
  JWT_REFRESH_TOKEN_EXPIRES_IN: Joi.string().default('7d'),

  REDIS_URL: Joi.string().uri().required(),
  BULL_REDIS_URL: Joi.string().uri().allow('').optional(),
  RABBITMQ_URL: Joi.string().uri().allow('').optional(),

  FILES_DRIVER: Joi.string().valid('s3', 'local').default('s3'),
  FILES_S3_ENDPOINT: Joi.string().uri().allow('').optional(),
  FILES_S3_ACCESS_KEY: Joi.string().allow('').optional(),
  FILES_S3_SECRET_KEY: Joi.string().allow('').optional(),
  FILES_S3_BUCKET: Joi.string().allow('').optional(),

  OTEL_EXPORTER_OTLP_ENDPOINT: Joi.string().uri().allow('').optional(),
  OTEL_SERVICE_NAME: Joi.string().allow('').optional(),
  TRACING_ENABLED: Joi.boolean().truthy('true').falsy('false').optional(),
  SENTRY_DSN: Joi.string().allow('').optional(),

  METRICS_ENABLED: Joi.boolean().truthy('true').falsy('false').optional(),
  METRICS_PATH: Joi.string().default('/metrics'),

  PAYMENTS_PROVIDER: Joi.string().valid('vnpay', 'momo', 'zalopay', 'manual').default('vnpay'),
  PAYMENTS_VNPAY_TMNCODE: Joi.string().allow('').optional(),
  PAYMENTS_VNPAY_HASH_SECRET: Joi.string().allow('').optional()
});
