export const USER_ROLES = ['ADMIN', 'STUDENT', 'TEACHER', 'PARENT', 'HUMAN_RESOURCES'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'invited';
  metadata?: Record<string, unknown>;
  phoneNumber?: string | null;
  dateOfBirth?: Date | null;
  passwordHash?: string;
}
