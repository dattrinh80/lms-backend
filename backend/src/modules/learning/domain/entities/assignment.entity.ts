export interface Assignment {
  id: string;
  classSubjectId: string;
  title: string;
  description?: string;
  dueDate?: Date;
  attachments?: string[];
}
