export type DebtType   = 'OWED_TO_ME' | 'OWED_BY_ME';
export type DebtStatus = 'OUTSTANDING' | 'PAID' | 'OVERDUE';

export interface DebtDto {
  id:           string;
  type:         DebtType;
  amount:       number;
  personEntity: string;
  dueDate:      string | null;
  status:       DebtStatus;
  createdAt:    string;
}

export interface DebtWithPaymentsDto extends DebtDto {
  payments: DebtPaymentDto[];
}

export interface DebtPaymentDto {
  id:         string;
  debtId:     string;
  amount:     number;
  walletId:   string;
  walletName: string;
  paidAt:     string;
}

export interface DebtSummaryDto {
  totalOwedToMe: number;
  totalOwedByMe: number;
  netPosition:   number;
}

export interface CreateDebtDto {
  type:         DebtType;
  amount:       number;
  personEntity: string;
  dueDate?:     string;
}

export interface RecordPaymentDto {
  amount:   number;
  walletId: string;
}

export interface UpdateDebtDto {
  type:         DebtType;
  amount:       number;
  personEntity: string;
  dueDate?:     string;
}
