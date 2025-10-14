import { Module } from '@nestjs/common';

import { AiService } from './application/services/ai.service';
import { AiController } from './presentation/http/ai.controller';

@Module({
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService]
})
export class AiModule {}
