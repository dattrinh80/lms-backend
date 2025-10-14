import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { NextFunction, Response } from 'express';

import { RequestContext } from '@app/common/types/request-context';

@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  use(req: RequestContext, res: Response, next: NextFunction) {
    const incoming = req.headers['x-request-id'];
    const requestId = (Array.isArray(incoming) ? incoming[0] : incoming)?.toString() ?? randomUUID();

    req.requestId = requestId;
    res.locals.requestId = requestId;
    res.setHeader('x-request-id', requestId);
    next();
  }
}
