import { UserRole } from '@app/modules/identity/domain/entities/user.entity';

import { ParentStudentLink } from './parent-student-link.entity';

export interface ParentUserSummary {
  id: string;
  email: string;
  username: string;
  displayName: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'invited';
  phoneNumber?: string | null;
  dateOfBirth?: Date | null;
}

export interface Parent {
  id: string;
  userId: string;
  phone?: string;
  secondaryEmail?: string;
  address?: string;
  notes?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  user: ParentUserSummary;
  links?: ParentStudentLink[];
}
