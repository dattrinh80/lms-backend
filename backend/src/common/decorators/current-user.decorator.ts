import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { RequestContext } from '@app/common/types/request-context';
import { AuthUser } from '@app/modules/auth/domain/entities/auth-user.entity';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthUser | null => {
    const request = ctx.switchToHttp().getRequest<RequestContext>();
    const user = request?.user;
    return user ?? null;
  }
);
