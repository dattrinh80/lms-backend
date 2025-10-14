export type InvoiceStatus = 'draft' | 'issued' | 'partial' | 'paid' | 'void';

export interface InvoiceLine {
  id: string;
  item: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface Invoice {
  id: string;
  studentId: string;
  period: string;
  status: InvoiceStatus;
  totalAmount: number;
  outstandingAmount: number;
  issuedAt: Date;
  dueDate?: Date;
  lines: InvoiceLine[];
}
