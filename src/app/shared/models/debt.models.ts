export type DebtType   = 'OWED_TO_ME' | 'OWED_BY_ME';

export interface DebtDto {
  id:              string;
  creditorName:    string | null;
  amount:          number;
  remainingAmount: number;
  dueDate:         string;
  isPaid:          boolean;
  isOverdue:       boolean;
  debtType:        DebtType | null;
  notes:           string | null;
  createdAt:       string;
  updatedAt:       string | null;
}

export interface DebtWithPaymentsDto extends DebtDto {
  payments: DebtPaymentDto[];
}

export interface DebtPaymentDto {
  id:          string;
  debtId:      string;
  amount:      number;
  paymentDate: string;
  notes:       string | null;
}

export interface DebtSummaryDto {
  totalDebtsCount:   number;
  unpaidDebtsCount:  number;
  overdueDebtsCount: number;
}

export interface CreateDebtDto {
  creditorName: string;
  amount:       number;
  debtType:     DebtType;
  dueDate:      string;
  notes?:       string | null;
}

export interface RecordPaymentDto {
  amount:      number;
  paymentDate: string;
  notes?:      string | null;
}

export interface UpdateDebtDto {
  creditorName: string;
  dueDate:      string;
  notes?:       string | null;
}
