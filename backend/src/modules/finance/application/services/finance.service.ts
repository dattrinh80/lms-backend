import { Injectable } from '@nestjs/common';

import { Invoice } from '../../domain/entities/invoice.entity';

@Injectable()
export class FinanceService {
  async listInvoices(): Promise<Invoice[]> {
    return [
      {
        id: 'invoice-1',
        studentId: 'student-1',
        period: '2024-01',
        status: 'paid',
        totalAmount: 2500000,
        outstandingAmount: 0,
        issuedAt: new Date(),
        lines: []
      }
    ];
  }
}
