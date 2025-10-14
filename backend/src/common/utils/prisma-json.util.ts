import { Prisma } from '@prisma/client';

export const serializePrismaJson = (
  metadata?: Record<string, unknown>
): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined => {
  if (metadata === undefined) {
    return undefined;
  }

  return metadata as Prisma.InputJsonValue;
};

export const mapPrismaJson = (
  value: Prisma.JsonValue | null
): Record<string, unknown> | undefined => {
  if (!value || Array.isArray(value) || typeof value !== 'object') {
    return undefined;
  }

  return value as Record<string, unknown>;
};
