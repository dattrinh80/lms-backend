import { ParentStudentLink } from './parent-student-link.entity';

export interface ParentUserSummary {
  id: string;
  email: string;
  displayName: string;
  status: 'active' | 'inactive' | 'invited';
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
