import { Request } from 'express';

import { AuthUser } from '@app/modules/auth/domain/entities/auth-user.entity';

export interface RequestContext extends Request {
  user?: AuthUser;
  requestId?: string;
}
