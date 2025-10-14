export interface RepositoryPort<T, CreatePayload = Partial<T>, UpdatePayload = Partial<T>> {
  findById(id: string): Promise<T | null>;
  findMany?(filters?: Record<string, unknown>): Promise<T[]>;
  create(payload: CreatePayload): Promise<T>;
  update(id: string, payload: UpdatePayload): Promise<T>;
  delete(id: string): Promise<void>;
}
