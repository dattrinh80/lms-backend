import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { PrismaInstrumentation } from '@prisma/instrumentation';

let sdk: NodeSDK | null = null;

export const initializeTracing = async (): Promise<NodeSDK | null> => {
  const enabled = process.env.TRACING_ENABLED === 'true';
  if (!enabled) {
    return null;
  }

  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR);

  const serviceName = process.env.OTEL_SERVICE_NAME ?? 'lms-backend';
  const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT;

  const traceExporter = otlpEndpoint
    ? new OTLPTraceExporter({ url: otlpEndpoint })
    : undefined;

  sdk = new NodeSDK({
    resource: new Resource({
      [SemanticResourceAttributes.SERVICE_NAME]: serviceName
    }),
    traceExporter,
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-http': {
          enabled: true
        },
        '@opentelemetry/instrumentation-express': {
          enabled: true
        }
      }),
      new PrismaInstrumentation()
    ]
  });

  await sdk.start();
  return sdk;
};

export const shutdownTracing = async () => {
  if (sdk) {
    await sdk.shutdown();
    sdk = null;
  }
};
