import { ApiProperty } from '@nestjs/swagger';

import { ParentPortalInvoiceSummary } from '../../../application/dto/parent-portal.dto';

class ParentPortalInvoiceLineResponseDto {
  @ApiProperty()
  item: string;

  @ApiProperty()
  quantity: number;

  @ApiProperty()
  unitPrice: number;

  @ApiProperty()
  subtotal: number;
}

class ParentPortalInvoicePaymentResponseDto {
  @ApiProperty()
  amount: number;

  @ApiProperty()
  method: string;

  @ApiProperty()
  paidAt: Date;

  @ApiProperty({ required: false, nullable: true })
  txRef?: string;
}

export class ParentPortalInvoiceResponseDto {
  @ApiProperty()
  invoiceId: string;

  @ApiProperty()
  period: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  totalAmount: number;

  @ApiProperty()
  outstandingAmount: number;

  @ApiProperty()
  issuedAt: Date;

  @ApiProperty({ required: false, nullable: true })
  dueDate?: Date;

  @ApiProperty({ type: () => [ParentPortalInvoiceLineResponseDto] })
  lines: ParentPortalInvoiceLineResponseDto[];

  @ApiProperty({ type: () => [ParentPortalInvoicePaymentResponseDto] })
  payments: ParentPortalInvoicePaymentResponseDto[];

  static fromSummary(summary: ParentPortalInvoiceSummary): ParentPortalInvoiceResponseDto {
    return {
      invoiceId: summary.invoiceId,
      period: summary.period,
      status: summary.status,
      totalAmount: summary.totalAmount,
      outstandingAmount: summary.outstandingAmount,
      issuedAt: summary.issuedAt,
      dueDate: summary.dueDate ?? undefined,
      lines: summary.lines.map(line => ({
        item: line.item,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        subtotal: line.subtotal
      })),
      payments: summary.payments.map(payment => ({
        amount: payment.amount,
        method: payment.method,
        paidAt: payment.paidAt,
        txRef: payment.txRef ?? undefined
      }))
    };
  }
}
