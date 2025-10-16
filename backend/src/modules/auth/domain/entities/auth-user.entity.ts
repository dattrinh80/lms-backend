import { UserRole } from '@app/modules/identity/domain/entities/user.entity';

export interface AuthUser {
  id: string;
  username: string;
  role: UserRole;
}
