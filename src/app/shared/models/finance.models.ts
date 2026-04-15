import { TransactionType, WalletType } from './enums';

export interface WalletDto {
  id:        string;
  name:      string;
  type:      WalletType;
  balance:   number;
  currency:  string;
  createdAt: string;
}

export interface CreateWalletDto {
  name:            string;
  type:            WalletType;
  currency:        string;
  openingBalance?: number;
}

export interface UpdateWalletDto {
  name: string;
  type: WalletType;
}

export interface FinanceSummaryDto {
  totalBalance:     number;
  currency:         string;
  totalIncome:      number;
  totalExpenses:    number;
  walletCount:      number;
  transactionCount: number;
}

export interface FinancialCategoryDto {
  id:        string;
  name:      string;
  icon:      string;
  createdAt: string;
}

export interface CreateFinancialCategoryDto {
  name: string;
  icon: string;
}

export interface FinancialTransactionDto {
  id:                    string;
  walletId:              string;
  walletName:            string | null;
  destinationWalletId:   string | null;
  destinationWalletName: string | null;
  financialCategoryId:   string | null;
  categoryName:          string | null;
  categoryIcon:          string | null;
  type:                  TransactionType;
  amount:                number;
  currency:              string;
  description:           string | null;
  transactionDate:       string;
  createdAt:             string;
}

export interface CreateFinancialTransactionDto {
  walletId:              string;
  destinationWalletId?:  string;
  financialCategoryId?:  string;
  type:                  TransactionType;
  amount:                number;
  description?:          string;
  transactionDate?:      string;
}

export interface UpdateFinancialTransactionDto {
  financialCategoryId?: string;
  amount:               number;
  description?:         string;
  transactionDate:      string;
}
