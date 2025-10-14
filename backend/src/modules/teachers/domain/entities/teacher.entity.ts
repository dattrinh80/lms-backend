export interface TeacherUserSummary {
  id: string;
  email: string;
  displayName: string;
  roles: string[];
  status: 'active' | 'inactive' | 'invited';
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
