export interface WalletDto {
  id:           string;
  userId:       string;
  name:         string;
  balance:      number;
  currency:     string;
  walletType:   number; // enum WalletType (Cash=0, Bank=1, CreditCard=2, EWallet=3, Other=4)
  color?:       string | null;
  createdAt:    string;
}

export interface CreateWalletDto {
  name:         string;
  initialBalance?: number;
  currency?:    string;
  walletType:   number;
  color?:       string | null;
}

export interface UpdateWalletDto {
  name:         string;
  walletType:   number;
  color?:       string | null;
}

export interface FinancialCategoryDto {
  id:           string;
  userId:       string;
  name:         string;
  type:         number; // enum TransactionType (Income=0, Expense=1, Transfer=2)
  icon?:        string | null;
  color?:       string | null;
}

export interface CreateFinancialCategoryDto {
  name:         string;
  type:         number;
  icon?:        string | null;
  color?:       string | null;
}

export interface TransactionDto {
  id:           string;
  walletId:     string;
  userId:       string;
  categoryId:   string | null;
  amount:       number;
  type:         number; // enum TransactionType
  transactionDate: string;
  notes?:       string | null;
  createdAt:    string;
  
  // Nav prop info often included in DTOs for list views
  walletName?:  string;
  categoryName?: string;
}

export interface CreateTransactionDto {
  walletId:     string;
  categoryId?:  string | null;
  amount:       number;
  type:         number;
  transactionDate: string;
  notes?:       string | null;

  // If Transfer
  toWalletId?:  string | null;
}
