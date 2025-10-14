import { Controller, Get, Query } from '@nestjs/common';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

import { AiService } from '../../application/services/ai.service';

@ApiTags('ai')
@Controller({
  path: 'ai',
  version: '1'
})
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Get('suggestions')
  @ApiQuery({ name: 'subject', required: true })
  async suggestHomeworkTopics(@Query('subject') subject: string) {
    return this.aiService.suggestHomeworkTopics(subject);
  }
}
