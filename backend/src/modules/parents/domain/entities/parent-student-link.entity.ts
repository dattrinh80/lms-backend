export interface ClassSectionSummary {
  id: string;
  code: string;
  name: string;
}

export interface ParentSummary {
  id: string;
  email: string;
  displayName: string;
  phone?: string | null;
  secondaryEmail?: string | null;
}

export interface StudentSummary {
  id: string;
  code?: string | null;
  displayName: string;
  email: string;
  status: 'active' | 'inactive' | 'invited';
  classSections: ClassSectionSummary[];
}

export type ParentStudentLinkStatus = 'active' | 'inactive' | 'invited' | 'revoked';

export interface ParentStudentLink {
  id: string;
  parentId: string;
  studentId: string;
  relationship?: string;
  isPrimary: boolean;
  status: ParentStudentLinkStatus;
  invitedAt?: Date;
  linkedAt: Date;
  revokedAt?: Date;
  metadata?: Record<string, unknown>;
  student?: StudentSummary;
  parent?: ParentSummary;
}
