import { Injectable } from '@nestjs/common';

import { AiSuggestion } from '../../domain/entities/ai-suggestion.entity';

@Injectable()
export class AiService {
  async suggestHomeworkTopics(subject: string): Promise<AiSuggestion[]> {
    return [
      {
        id: 'ai-suggestion-1',
        subject,
        description: 'Phonics practice for beginner learners',
        confidence: 0.75
      }
    ];
  }
}
