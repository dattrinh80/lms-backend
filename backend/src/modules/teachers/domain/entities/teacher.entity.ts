import { UserRole } from '@app/modules/identity/domain/entities/user.entity';

export interface TeacherUserSummary {
  id: string;
  email: string;
  username: string;
  displayName: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'invited';
  phoneNumber?: string | null;
  dateOfBirth?: Date | null;
}

export interface Teacher {
  id: string;
  userId: string;
  bio?: string | null;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  user: TeacherUserSummary;
}
