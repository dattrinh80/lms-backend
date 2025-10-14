import { Module } from '@nestjs/common';

import { DatabaseModule } from '@app/infrastructure/database';

import { FinanceService } from './application/services/finance.service';
import { FinanceController } from './presentation/http/finance.controller';

@Module({
  imports: [DatabaseModule],
  controllers: [FinanceController],
  providers: [FinanceService],
  exports: [FinanceService]
})
export class FinanceModule {}
