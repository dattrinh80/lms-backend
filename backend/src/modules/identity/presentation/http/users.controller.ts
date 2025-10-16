import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  UseGuards
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

import { buildPaginatedResponse } from '@app/common/utils/pagination.util';
import { Roles } from '@app/common/decorators/roles.decorator';
import { JwtAuthGuard } from '@app/modules/auth/infrastructure/http/jwt-auth.guard';
import { RolesGuard } from '@app/modules/auth/infrastructure/http/roles.guard';

import { CreateUserDto } from './dto/create-user.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersService } from '../../application/services/users.service';

@ApiTags('users')
@Controller({
  path: 'users',
  version: '1'
})
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List users' })
  async findAll(@Query() query: ListUsersQueryDto) {
    const result = await this.usersService.searchUsers(query);
    return buildPaginatedResponse(result, user => UserResponseDto.fromDomain(user));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user details' })
  async findById(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return UserResponseDto.fromDomain(user);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  async create(@Body() dto: CreateUserDto) {
    const user = await this.usersService.createUser({
      email: dto.email,
      username: dto.username,
      password: dto.password,
      displayName: dto.displayName,
      role: dto.role,
      status: dto.status,
      phoneNumber: this.normalizePhoneNumber(dto.phoneNumber),
      dateOfBirth: this.parseDateOfBirth(dto.dateOfBirth)
    });
    return UserResponseDto.fromDomain(user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const user = await this.usersService.updateUser(id, {
      displayName: dto.displayName,
      password: dto.password,
      username: dto.username,
      role: dto.role,
      status: dto.status,
      phoneNumber:
        dto.phoneNumber === undefined ? undefined : this.normalizePhoneNumber(dto.phoneNumber),
      dateOfBirth: this.parseDateOfBirth(dto.dateOfBirth)
    });
    return UserResponseDto.fromDomain(user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user' })
  async remove(@Param('id') id: string) {
    await this.usersService.deleteUser(id);
  }

  private parseDateOfBirth(value?: string | null): Date | null | undefined {
    if (value === undefined) {
      return undefined;
    }

    if (value === null || value.trim().length === 0) {
      return null;
    }

    return new Date(value);
  }

  private normalizePhoneNumber(value?: string | null): string | null | undefined {
    if (value === undefined) {
      return undefined;
    }

    if (value === null) {
      return null;
    }

    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
}
