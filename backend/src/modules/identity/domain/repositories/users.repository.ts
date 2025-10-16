import { PaginatedResult } from '@app/common/types/pagination';

import { User, UserRole } from '../entities/user.entity';

export interface CreateUserInput {
  email: string;
  username: string;
  password: string;
  displayName: string;
  role: UserRole;
  status?: 'active' | 'inactive' | 'invited';
  metadata?: Record<string, unknown>;
  phoneNumber?: string | null;
  dateOfBirth?: Date | null;
}

export interface UpdateUserInput {
  displayName?: string;
  password?: string;
  username?: string;
  role?: UserRole;
  status?: 'active' | 'inactive' | 'invited';
  metadata?: Record<string, unknown>;
  phoneNumber?: string | null;
  dateOfBirth?: Date | null;
}

export interface SearchUsersFilters {
  query?: string;
  roles?: UserRole[];
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
  abstract findByUsername(username: string): Promise<User | null>;
  abstract search(filters?: SearchUsersFilters): Promise<PaginatedResult<User>>;
}
