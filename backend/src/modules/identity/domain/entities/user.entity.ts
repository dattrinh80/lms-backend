export interface User {
  id: string;
  email: string;
  displayName: string;
  roles: string[];
  status: 'active' | 'inactive' | 'invited';
  metadata?: Record<string, unknown>;
  passwordHash?: string;
}
