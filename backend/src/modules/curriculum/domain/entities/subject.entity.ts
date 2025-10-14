export interface Subject {
  id: string;
  code: string;
  name: string;
  description?: string;
  defaultDurationMinutes?: number;
  metadata?: Record<string, unknown>;
}
