export type Denomination = { 
  value: number; 
  label?: string; 
};

export type DenominationEntry = { 
  value: number; 
  count: number; 
  total: number; 
};

export type PaymentModeTotal = {
  mode: string;
  amount: number;
};

export type CashierClosePayload = {
  cashier_id: string;
  closing_date: string; // ISO
  expected_total: number;
  denominations: DenominationEntry[];
  payment_mode_totals: PaymentModeTotal[];
  notes?: string;
};

export type CashierCloseResponse = {
  id: string;
  status: 'requested' | 'verified' | 'rejected';
  created_at: string;
  variance?: number;
  journal_entry_id?: string;
};

export type CashierVerificationPayload = {
  id: string;
  action: 'approve' | 'reject';
  notes?: string;
};

export type CashCounterSettings = {
  currency: string;
  denominations: number[];
  account_mappings: {
    cash_account: string;
    upi_account: string;
    card_account: string;
    others_account: string;
  };
  variance_threshold: number;
};
