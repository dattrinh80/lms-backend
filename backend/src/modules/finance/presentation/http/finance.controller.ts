import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { FinanceService } from '../../application/services/finance.service';

@ApiTags('finance')
@Controller({
  path: 'finance',
  version: '1'
})
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('invoices')
  async listInvoices() {
    return this.financeService.listInvoices();
  }
}
