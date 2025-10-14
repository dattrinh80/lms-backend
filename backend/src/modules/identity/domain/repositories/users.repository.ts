import { PaginatedResult } from '@app/common/types/pagination';

import { User } from '../entities/user.entity';

export interface CreateUserInput {
  email: string;
  password: string;
  displayName: string;
  roles: string[];
  status?: 'active' | 'inactive' | 'invited';
  metadata?: Record<string, unknown>;
}

export interface UpdateUserInput {
  displayName?: string;
  password?: string;
  roles?: string[];
  status?: 'active' | 'inactive' | 'invited';
  metadata?: Record<string, unknown>;
}

export interface SearchUsersFilters {
  query?: string;
  roles?: string[];
  status?: 'active' | 'inactive' | 'invited';
  page?: number;
  limit?: number;
}

export abstract class UsersRepository {
  abstract create(input: CreateUserInput): Promise<User>;
  abstract update(id: string, input: UpdateUserInput): Promise<User>;
  abstract delete(id: string): Promise<void>;
  abstract findById(id: string): Promise<User | null>;
  abstract findByEmail(email: string): Promise<User | null>;
  abstract search(filters?: SearchUsersFilters): Promise<PaginatedResult<User>>;
}
