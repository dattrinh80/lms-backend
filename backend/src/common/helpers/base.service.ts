import { NotFoundException } from '@nestjs/common';

export abstract class BaseService {
  protected ensureFound<T>(
    value: T | null | undefined,
    message = 'Resource not found'
  ): T {
    if (value === null || value === undefined) {
      throw new NotFoundException(message);
    }

    return value;
  }
}
