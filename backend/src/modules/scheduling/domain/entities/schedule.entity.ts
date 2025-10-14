export interface Schedule {
  id: string;
  classSubjectId: string;
  classSectionId: string;
  teacherId?: string;
  startsAt: Date;
  endsAt: Date;
  roomId?: string;
  roomName?: string;
  recurrenceId?: string;
}
