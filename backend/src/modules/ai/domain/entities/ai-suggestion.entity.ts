export interface AiSuggestion {
  id: string;
  subject: string;
  description: string;
  confidence: number;
  metadata?: Record<string, unknown>;
}
