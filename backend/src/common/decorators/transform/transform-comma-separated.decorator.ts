import { Transform } from 'class-transformer';

export const TransformCommaSeparatedStrings = () =>
  Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }

    const normalized = Array.isArray(value)
      ? value
      : String(value)
          .split(',');

    const result = normalized
      .map(item => String(item).trim())
      .filter((item): item is string => item.length > 0);

    return result.length > 0 ? result : undefined;
  });
