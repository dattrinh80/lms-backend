export interface StudentUserSummary {
  id: string;
  email: string;
  displayName: string;
  roles: string[];
  status: 'active' | 'inactive' | 'invited';
}

export interface Student {
  id: string;
  userId: string;
  code?: string | null;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  user: StudentUserSummary;
}
