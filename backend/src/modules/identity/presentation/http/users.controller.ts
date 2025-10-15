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
import {
  ApiOperation,
  ApiQuery,
  ApiTags,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiBody
} from '@nestjs/swagger';

import { Roles } from '@app/common/decorators/roles.decorator';
import { buildPaginatedResponse } from '@app/common/utils/pagination.util';
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
  @ApiOperation({
    summary: 'List users with filtering and pagination',
    description: 'Retrieve a paginated list of users with optional filtering by search query and roles'
  })
  @ApiQuery({ name: 'query', required: false, description: 'Search text applied to email/display name' })
  @ApiQuery({ name: 'roles', required: false, description: 'Comma separated roles', example: 'TEACHER,ADMIN' })
  @ApiQuery({ name: 'status', required: false, description: 'User status filter', enum: ['active', 'inactive', 'invited'] })
  @ApiOkResponse({
    description: 'List of users returned successfully',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array', items: { $ref: '#/components/schemas/UserResponseDto' } },
        pagination: {
          type: 'object',
          properties: {
            page: { type: 'number', example: 1 },
            limit: { type: 'number', example: 10 },
            total: { type: 'number', example: 100 },
            totalPages: { type: 'number', example: 10 }
          }
        }
      }
    }
  })
  async findAll(@Query() query: ListUsersQueryDto) {
    const result = await this.usersService.searchUsers(query);
    return buildPaginatedResponse(result, user => UserResponseDto.fromDomain(user));
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user details by ID',
    description: 'Retrieve detailed information for a specific user'
  })
  @ApiOkResponse({
    description: 'User details returned successfully',
    type: UserResponseDto
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'User not found' },
        error: { type: 'string', example: 'Not Found' }
      }
    }
  })
  async findById(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return UserResponseDto.fromDomain(user);
  }

  @Post()
  @ApiOperation({
    summary: 'Create a new user account',
    description: 'Create a new user account with specified roles and status'
  })
  @ApiBody({
    type: CreateUserDto,
    description: 'User account creation data',
    required: true
  })
  @ApiCreatedResponse({
    description: 'User created successfully',
    type: UserResponseDto
  })
  @ApiBadRequestResponse({
    description: 'Validation failed or email already exists',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 400 },
        message: { type: 'string', example: 'Validation failed' },
        error: { type: 'string', example: 'Bad Request' }
      }
    }
  })
  async create(@Body() dto: CreateUserDto) {
    const user = await this.usersService.createUser(dto);
    return UserResponseDto.fromDomain(user);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update user information',
    description: 'Update user account information including display name, status, and roles'
  })
  @ApiBody({
    type: UpdateUserDto,
    description: 'User update data',
    required: true
  })
  @ApiOkResponse({
    description: 'User updated successfully',
    type: UserResponseDto
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'User not found' },
        error: { type: 'string', example: 'Not Found' }
      }
    }
  })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const user = await this.usersService.updateUser(id, dto);
    return UserResponseDto.fromDomain(user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete/Remove user account',
    description: 'Permanently delete a user account and all associated data'
  })
  @ApiNoContentResponse({
    description: 'User deleted successfully, no content returned'
  })
  @ApiNotFoundResponse({
    description: 'User not found',
    schema: {
      type: 'object',
      properties: {
        statusCode: { type: 'number', example: 404 },
        message: { type: 'string', example: 'User not found' },
        error: { type: 'string', example: 'Not Found' }
      }
    }
  })
  async remove(@Param('id') id: string) {
    await this.usersService.deleteUser(id);
  }
}
