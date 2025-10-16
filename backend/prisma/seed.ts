import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const teacherPassword = await bcrypt.hash('teacher123', 10);
  const studentPassword = await bcrypt.hash('student123', 10);
  const parentPassword = await bcrypt.hash('parent123', 10);
  const seedUserPassword = await bcrypt.hash('SeedUser123!', 10);

  const adminUserData = {
    email: 'dattvhp@gmail.com',
    username: 'admin',
    password: adminPassword,
    displayName: 'System Admin',
    role: 'ADMIN' as const,
    status: 'active' as const,
    phoneNumber: '+84900111222',
    dateOfBirth: new Date('1980-01-01')
  };

  const adminUser = await prisma.user.upsert({
    where: { email: adminUserData.email },
    update: {
      username: adminUserData.username,
      password: adminUserData.password,
      displayName: adminUserData.displayName,
      role: adminUserData.role,
      status: adminUserData.status,
      phoneNumber: adminUserData.phoneNumber,
      dateOfBirth: adminUserData.dateOfBirth
    },
    create: adminUserData
  });

  const teacherUserData = {
    email: 'dattv.apt@gmail.com',
    username: 'jane.teacher',
    password: teacherPassword,
    displayName: 'Jane Teacher',
    role: 'TEACHER' as const,
    status: 'active' as const,
    phoneNumber: '+84908887766',
    dateOfBirth: new Date('1985-05-10')
  };

  const teacherUser = await prisma.user.upsert({
    where: { email: teacherUserData.email },
    update: {
      username: teacherUserData.username,
      password: teacherUserData.password,
      displayName: teacherUserData.displayName,
      role: teacherUserData.role,
      status: teacherUserData.status,
      phoneNumber: teacherUserData.phoneNumber,
      dateOfBirth: teacherUserData.dateOfBirth
    },
    create: teacherUserData
  });

  const studentUserData = {
    email: 'dattv.pro@gmail.com',
    username: 'john.student',
    password: studentPassword,
    displayName: 'John Student',
    role: 'STUDENT' as const,
    status: 'active' as const,
    phoneNumber: '+84907776655',
    dateOfBirth: new Date('2006-09-15')
  };

  const studentUser = await prisma.user.upsert({
    where: { email: studentUserData.email },
    update: {
      username: studentUserData.username,
      password: studentUserData.password,
      displayName: studentUserData.displayName,
      role: studentUserData.role,
      status: studentUserData.status,
      phoneNumber: studentUserData.phoneNumber,
      dateOfBirth: studentUserData.dateOfBirth
    },
    create: studentUserData
  });

  const parentUserData = {
    email: 'parent@example.com',
    username: 'mary.parent',
    password: parentPassword,
    displayName: 'Mary Parent',
    role: 'PARENT' as const,
    status: 'active' as const,
    phoneNumber: '+84901234567',
    dateOfBirth: new Date('1982-03-20')
  };

  const parentUser = await prisma.user.upsert({
    where: { email: parentUserData.email },
    update: {
      username: parentUserData.username,
      password: parentUserData.password,
      displayName: parentUserData.displayName,
      role: parentUserData.role,
      status: parentUserData.status,
      phoneNumber: parentUserData.phoneNumber,
      dateOfBirth: parentUserData.dateOfBirth
    },
    create: parentUserData
  });

  const extraRoles = ['ADMIN', 'STUDENT', 'TEACHER', 'PARENT', 'HUMAN_RESOURCES'] as const;

  await Promise.all(
    Array.from({ length: 50 }, (_, index) => {
      const sequence = index + 1;
      const role = extraRoles[index % extraRoles.length];
      const email = `seeduser${sequence}@example.com`;
      const username = `seed.user${sequence}`;
      const displayName = `Seed ${role.replace('_', ' ')} ${sequence}`;
      const phoneNumber = `+8498${(1000 + sequence).toString().slice(-4)}`;
      const dateOfBirth = new Date(1990 + Math.floor(index / 12), index % 12, (index % 28) + 1);

      return prisma.user.upsert({
        where: { email },
        update: {
          username,
          displayName,
          role,
          status: 'active',
          password: seedUserPassword,
          phoneNumber,
          dateOfBirth,
          metadata: {
            source: 'seed',
            batch: 'extra-users',
            index: sequence
          }
        },
        create: {
          email,
          username,
          password: seedUserPassword,
          displayName,
          role,
          status: 'active',
          phoneNumber,
          dateOfBirth,
          metadata: {
            source: 'seed',
            batch: 'extra-users',
            index: sequence
          }
        }
      });
    })
  );

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

  const parent = await prisma.parent.upsert({
    where: { userId: parentUser.id },
    update: {},
    create: {
      userId: parentUser.id,
      phone: '+84901234567',
      metadata: { preferredLanguage: 'vi' }
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

  await prisma.parentStudentLink.upsert({
    where: {
      parentId_studentId: {
        parentId: parent.id,
        studentId: student.id
      }
    },
    update: {},
    create: {
      parentId: parent.id,
      studentId: student.id,
      relationship: 'Mother',
      isPrimary: true,
      status: 'active',
      invitedAt: new Date()
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
