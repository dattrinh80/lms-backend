import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const teacherPassword = await bcrypt.hash('teacher123', 10);
  const studentPassword = await bcrypt.hash('student123', 10);

  const adminUser = await prisma.user.upsert({
    where: { email: 'dattvhp@gmail.com' },
    update: {},
    create: {
      email: 'dattvhp@gmail.com',
      password: adminPassword,
      displayName: 'System Admin',
      roles: ['ADMIN'],
      status: 'active'
    }
  });

  const teacherUser = await prisma.user.upsert({
    where: { email: 'dattv.apt@gmail.com' },
    update: {},
    create: {
      email: 'dattv.apt@gmail.com',
      password: teacherPassword,
      displayName: 'Jane Teacher',
      roles: ['TEACHER'],
      status: 'active'
    }
  });

  const studentUser = await prisma.user.upsert({
    where: { email: 'dattv.pro@gmail.com' },
    update: {},
    create: {
      email: 'dattv.pro@gmail.com',
      password: studentPassword,
      displayName: 'John Student',
      roles: ['STUDENT'],
      status: 'active'
    }
  });

  const teacher = await prisma.teacher.upsert({
    where: { userId: teacherUser.id },
    update: {},
    create: {
      userId: teacherUser.id,
      bio: 'English instructor with 5 years of experience.'
    }
  });

  const student = await prisma.student.upsert({
    where: { userId: studentUser.id },
    update: {},
    create: {
      userId: studentUser.id,
      code: 'STU-001'
    }
  });

  const subject = await prisma.subject.upsert({
    where: { code: 'ENG-BASIC' },
    update: {},
    create: {
      code: 'ENG-BASIC',
      name: 'English Basics',
      description: 'Foundation English program',
      defaultDurationMinutes: 90
    }
  });

  const classSection = await prisma.classSection.upsert({
    where: { code: 'CLS-001' },
    update: {},
    create: {
      code: 'CLS-001',
      name: 'English Class 1',
      level: 'Beginner',
      capacity: 20,
      homeroomTeacherId: teacher.id,
      startDate: new Date(),
      metadata: { note: 'Sample class section' }
    }
  });

  const classSubject = await prisma.classSubject.upsert({
    where: {
      classSectionId_subjectId: {
        classSectionId: classSection.id,
        subjectId: subject.id
      }
    },
    update: {},
    create: {
      classSectionId: classSection.id,
      subjectId: subject.id,
      leadTeacherId: teacher.id,
      weeklySessions: 3,
      creditHours: 3,
      metadata: { note: 'Primary English subject' }
    }
  });

  const room = await prisma.room.upsert({
    where: { name: 'Room A' },
    update: {},
    create: {
      name: 'Room A',
      location: 'Building 1',
      capacity: 25
    }
  });

  const now = new Date();
  const sessionStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0);
  const sessionEnd = new Date(sessionStart.getTime() + 90 * 60 * 1000);

  const session = await prisma.session.create({
    data: {
      classSubjectId: classSubject.id,
      teacherId: teacher.id,
      roomId: room.id,
      startsAt: sessionStart,
      endsAt: sessionEnd
    }
  });

  await prisma.enrollment.upsert({
    where: {
      studentId_classSectionId: {
        studentId: student.id,
        classSectionId: classSection.id
      }
    },
    update: {},
    create: {
      studentId: student.id,
      classSectionId: classSection.id
    }
  });

  await prisma.assignment.create({
    data: {
      classSubjectId: classSubject.id,
      title: 'Homework 1',
      description: 'Introduce yourself in English.',
      dueDate: new Date(sessionEnd.getTime() + 3 * 24 * 60 * 60 * 1000),
      metadata: { difficulty: 'easy' }
    }
  });

  await prisma.attendanceRecord.create({
    data: {
      sessionId: session.id,
      studentId: student.id,
      status: 'present'
    }
  });

  const invoice = await prisma.invoice.create({
    data: {
      studentId: student.id,
      period: '2024-10',
      status: 'issued',
      totalAmount: 2500000,
      outstandingAmount: 2500000,
      dueDate: new Date(sessionEnd.getTime() + 7 * 24 * 60 * 60 * 1000)
    }
  });

  await prisma.invoiceLine.create({
    data: {
      invoiceId: invoice.id,
      item: 'Monthly tuition',
      quantity: 1,
      unitPrice: 2500000,
      subtotal: 2500000
    }
  });
}

main()
  .catch(error => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
