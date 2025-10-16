import { Injectable } from '@nestjs/common';

import { PaginatedResult } from '@app/common/types/pagination';

import { User } from '../../domain/entities/user.entity';
import {
  CreateUserInput,
  UpdateUserInput,
  UsersRepository,
  SearchUsersFilters
} from '../../domain/repositories/users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  searchUsers(filters?: SearchUsersFilters): Promise<PaginatedResult<User>> {
    return this.usersRepository.search(filters);
  }

  findById(id: string): Promise<User | null> {
    return this.usersRepository.findById(id);
  }

  findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findByUsername(username);
  }

  createUser(input: CreateUserInput): Promise<User> {
    return this.usersRepository.create(input);
  }

  updateUser(id: string, input: UpdateUserInput): Promise<User> {
    return this.usersRepository.update(id, input);
  }

  async deleteUser(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
