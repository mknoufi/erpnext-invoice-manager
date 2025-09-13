export type Money = {
  currency: string;
  value: number; // stored in major units, e.g., 123.45
};

export type CashDenomination = {
  label: string; // e.g., "2000", "500", "200", "100", "50", "20", "10", "5", "2", "1"
  value: number; // numeric value
  qty: number;
};

export type CashInHand = {
  denominations: CashDenomination[];
  total: Money;
  variance?: Money; // computed at close
  lastCountedAt?: string;
};

export type CashierUser = {
  id: string;
  name: string;
  pinLoginEnabled: boolean;
  roles: string[];
};

export type CashierSession = {
  sessionId: string;
  cashier: CashierUser;
  storeId: string;
  startedAt: string;
  closedAt?: string;
  isActive: boolean;
};

export type InvoiceItem = {
  itemCode: string;
  itemName: string;
  qty: number;
  rate: number;
  amount: number;
  discountAmount?: number;
};

export type InvoiceSummary = {
  id: string;
  name?: string; // ERPNext name
  customerName: string;
  customerPhone?: string;
  status: 'Unpaid' | 'Partially Paid' | 'Paid' | 'Overdue';
  postingDate: string;
  grandTotal: number;
  outstanding: number;
  outstandingAmount: number; // Alias for outstanding
  currency?: string;
  items: InvoiceItem[];
};

export type PaymentMode = 'Cash' | 'Card' | 'UPI' | 'Cheque' | 'BankTransfer' | 'Wallet';

export type PaymentEntry = {
  id: string;
  invoiceId: string;
  mode: PaymentMode;
  amount: Money;
  reference?: string; // UTR/txn ref, last 4 digits, etc.
  tags?: string[]; // accounting tags
  createdAt: string;
};

export type PayoutType = 'Accountable' | 'NonAccountable';

export type PayoutEntry = {
  id: string;
  type: PayoutType;
  purpose: string; // staff advance, transport, petty cash, etc.
  amount: Money;
  reference?: string;
  createdAt: string;
};

export type EODReport = {
  sessionId: string;
  date: string;
  totalCollections: Money;
  totalPayouts: Money;
  closingBalance: Money;
  variance?: Money;
  exportedTo?: string[]; // e.g., ['accounts', 'management']
};

export type ManagerApprovalRequest = {
  requestId: string;
  reason: 'HighValueDiscount' | 'Override';
  invoiceIds: string[];
  requestedBy: string; // cashier id
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
  decidedAt?: string;
  decidedBy?: string; // manager id
  note?: string;
};


