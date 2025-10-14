export interface ParentPortalStudentSummary {
  studentId: string;
  studentCode?: string | null;
  displayName: string;
  email: string;
  relationship?: string;
  isPrimary: boolean;
  status: 'active' | 'inactive' | 'invited' | 'revoked';
  classSections: {
    id: string;
    code: string;
    name: string;
  }[];
}

export interface ParentPortalScheduleItem {
  sessionId: string;
  classSectionId: string;
  subjectId: string;
  subjectName: string;
  classSectionName: string;
  teacherId?: string;
  teacherName?: string;
  roomId?: string;
  roomName?: string;
  startsAt: Date;
  endsAt: Date;
}

export interface ParentPortalAttendanceRecord {
  id: string;
  status: string;
  note?: string | null;
  recordedAt: Date;
  session: {
    id: string;
    startsAt: Date;
    endsAt: Date;
    subjectName: string;
    classSectionName: string;
    teacherName?: string;
  };
}

export interface ParentPortalGradeSummary {
  gradeId: string;
  assignmentId: string;
  assignmentTitle: string;
  score: number;
  maxScore: number;
  gradedAt: Date;
  subjectName: string;
  classSectionName: string;
  teacherName?: string;
}

export interface ParentPortalInvoiceSummary {
  invoiceId: string;
  period: string;
  status: string;
  totalAmount: number;
  outstandingAmount: number;
  issuedAt: Date;
  dueDate?: Date | null;
  lines: {
    item: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }[];
  payments: {
    amount: number;
    method: string;
    paidAt: Date;
    txRef?: string | null;
  }[];
}

export interface ParentDashboardStudentOverview {
  student: ParentPortalStudentSummary;
  upcomingSessions: ParentPortalScheduleItem[];
  latestGrades: ParentPortalGradeSummary[];
  attendanceSummary: {
    total: number;
    present: number;
    absent: number;
    late: number;
  };
  outstandingAmount: number;
}

export interface ParentDashboardOverview {
  parentId: string;
  displayName: string;
  students: ParentDashboardStudentOverview[];
}
