export interface Room {
  id: string;
  name: string;
  location?: string;
  capacity?: number;
  metadata?: Record<string, unknown>;
}
