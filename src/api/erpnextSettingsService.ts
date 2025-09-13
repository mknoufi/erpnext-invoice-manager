import api from './client';

export interface PaymentMode {
  name: string;
  mode_of_payment: string;
  type: 'Bank' | 'Cash' | 'General';
  enabled: boolean;
  accounts?: string[];
}

export interface LedgerAccount {
  name: string;
  account_name: string;
  account_type: string;
  parent_account: string;
  is_group: boolean;
  company: string;
  currency?: string;
}

export interface Currency {
  name: string;
  currency_name: string;
  symbol: string;
  fraction: string;
  fraction_units: number;
  smallest_currency_fraction_value: number;
  enabled: boolean;
}

export interface CompanySettings {
  name: string;
  company_name: string;
  default_currency: string;
  country: string;
  timezone: string;
  fiscal_year_start: string;
  fiscal_year_end: string;
}

export interface Denomination {
  denomination: number;
  currency: string;
  enabled: boolean;
}

// Configuration: Set to true to use real ERPNext data, false for mock data
const USE_REAL_ERPNEXT_DATA = true;

// Mock data for demo purposes
const mockPaymentModes: PaymentMode[] = [
  { name: 'Cash', mode_of_payment: 'Cash', type: 'Cash', enabled: true },
  { name: 'Bank Transfer', mode_of_payment: 'Bank Transfer', type: 'Bank', enabled: true },
  { name: 'Credit Card', mode_of_payment: 'Credit Card', type: 'Bank', enabled: true },
  { name: 'Cheque', mode_of_payment: 'Cheque', type: 'Bank', enabled: true },
];

const mockLedgerAccounts: LedgerAccount[] = [
  { name: 'Cash', account_name: 'Cash', account_type: 'Asset', parent_account: 'Current Assets', is_group: false, company: 'Your Company' },
  { name: 'Bank', account_name: 'Bank', account_type: 'Asset', parent_account: 'Current Assets', is_group: false, company: 'Your Company' },
  { name: 'Sales', account_name: 'Sales', account_type: 'Income', parent_account: 'Direct Income', is_group: false, company: 'Your Company' },
  { name: 'Accounts Receivable', account_name: 'Accounts Receivable', account_type: 'Asset', parent_account: 'Current Assets', is_group: false, company: 'Your Company' },
];

const mockCurrencies: Currency[] = [
  { name: 'USD', currency_name: 'US Dollar', symbol: '$', fraction: 'Cent', fraction_units: 100, smallest_currency_fraction_value: 0.01, enabled: true },
  { name: 'EUR', currency_name: 'Euro', symbol: '€', fraction: 'Cent', fraction_units: 100, smallest_currency_fraction_value: 0.01, enabled: true },
  { name: 'GBP', currency_name: 'British Pound', symbol: '£', fraction: 'Penny', fraction_units: 100, smallest_currency_fraction_value: 0.01, enabled: true },
];

// Mock denominations are now handled in getDefaultDenominations function

// Fetch Payment Modes from ERPNext
export const fetchPaymentModes = async (): Promise<PaymentMode[]> => {
  if (USE_REAL_ERPNEXT_DATA) {
    try {
      const response = await api.get('/Mode of Payment', {
        params: {
          fields: JSON.stringify([
            'name',
            'mode_of_payment',
            'type',
            'enabled',
            'accounts.account'
          ]),
          filters: JSON.stringify({ enabled: 1 }),
          order_by: 'name asc',
        },
      });

      return response.data.data.map((mode: any) => ({
        name: mode.name,
        mode_of_payment: mode.mode_of_payment,
        type: mode.type,
        enabled: mode.enabled,
        accounts: mode.accounts?.map((acc: any) => acc.account) || []
      }));
    } catch (error) {
      console.error('Error fetching payment modes from ERPNext:', error);
      return mockPaymentModes;
    }
  } else {
    return mockPaymentModes;
  }
};

// Fetch Ledger Accounts from ERPNext
export const fetchLedgerAccounts = async (): Promise<LedgerAccount[]> => {
  if (USE_REAL_ERPNEXT_DATA) {
    try {
      const response = await api.get('/Account', {
        params: {
          fields: JSON.stringify([
            'name',
            'account_name',
            'account_type',
            'parent_account',
            'is_group',
            'company',
            'account_currency'
          ]),
          filters: JSON.stringify({ 
            is_group: 0,
            disabled: 0 
          }),
          order_by: 'account_name asc',
        },
      });

      return response.data.data.map((account: any) => ({
        name: account.name,
        account_name: account.account_name,
        account_type: account.account_type,
        parent_account: account.parent_account,
        is_group: account.is_group,
        company: account.company,
        currency: account.account_currency
      }));
    } catch (error) {
      console.error('Error fetching ledger accounts from ERPNext:', error);
      return mockLedgerAccounts;
    }
  } else {
    return mockLedgerAccounts;
  }
};

// Fetch Currencies from ERPNext
export const fetchCurrencies = async (): Promise<Currency[]> => {
  if (USE_REAL_ERPNEXT_DATA) {
    try {
      const response = await api.get('/Currency', {
        params: {
          fields: JSON.stringify([
            'name',
            'currency_name',
            'symbol',
            'fraction',
            'fraction_units',
            'smallest_currency_fraction_value',
            'enabled'
          ]),
          filters: JSON.stringify({ enabled: 1 }),
          order_by: 'currency_name asc',
        },
      });

      return response.data.data.map((currency: any) => ({
        name: currency.name,
        currency_name: currency.currency_name,
        symbol: currency.symbol,
        fraction: currency.fraction,
        fraction_units: currency.fraction_units,
        smallest_currency_fraction_value: currency.smallest_currency_fraction_value,
        enabled: currency.enabled
      }));
    } catch (error) {
      console.error('Error fetching currencies from ERPNext:', error);
      return mockCurrencies;
    }
  } else {
    return mockCurrencies;
  }
};

// Fetch Company Settings from ERPNext
export const fetchCompanySettings = async (): Promise<CompanySettings[]> => {
  if (USE_REAL_ERPNEXT_DATA) {
    try {
      const response = await api.get('/Company', {
        params: {
          fields: JSON.stringify([
            'name',
            'company_name',
            'default_currency',
            'country',
            'timezone',
            'fiscal_year_start',
            'fiscal_year_end'
          ]),
          order_by: 'company_name asc',
        },
      });

      return response.data.data.map((company: any) => ({
        name: company.name,
        company_name: company.company_name,
        default_currency: company.default_currency,
        country: company.country,
        timezone: company.timezone,
        fiscal_year_start: company.fiscal_year_start,
        fiscal_year_end: company.fiscal_year_end
      }));
    } catch (error) {
      console.error('Error fetching company settings from ERPNext:', error);
      return [{
        name: 'Your Company',
        company_name: 'Your Company',
        default_currency: 'USD',
        country: 'United States',
        timezone: 'America/New_York',
        fiscal_year_start: '01-01',
        fiscal_year_end: '12-31'
      }];
    }
  } else {
    return [{
      name: 'Your Company',
      company_name: 'Your Company',
      default_currency: 'USD',
      country: 'United States',
      timezone: 'America/New_York',
      fiscal_year_start: '01-01',
      fiscal_year_end: '12-31'
    }];
  }
};

// Fetch Denominations (custom implementation - not standard ERPNext)
export const fetchDenominations = async (currency: string = 'USD'): Promise<Denomination[]> => {
  if (USE_REAL_ERPNEXT_DATA) {
    try {
      // This would be a custom DocType in ERPNext for denomination management
      const response = await api.get('/Denomination', {
        params: {
          fields: JSON.stringify([
            'denomination',
            'currency',
            'enabled'
          ]),
          filters: JSON.stringify({ 
            currency: currency,
            enabled: 1 
          }),
          order_by: 'denomination desc',
        },
      });

      return response.data.data.map((denom: any) => ({
        denomination: denom.denomination,
        currency: denom.currency,
        enabled: denom.enabled
      }));
    } catch (error) {
      console.error('Error fetching denominations from ERPNext:', error);
      // Return default denominations for the currency
      return getDefaultDenominations(currency);
    }
  } else {
    return getDefaultDenominations(currency);
  }
};

// Get default denominations for a currency
const getDefaultDenominations = (currency: string): Denomination[] => {
  const defaultDenoms: Record<string, number[]> = {
    'USD': [100, 50, 20, 10, 5, 1, 0.25, 0.10, 0.05, 0.01],
    'EUR': [100, 50, 20, 10, 5, 2, 1, 0.50, 0.20, 0.10, 0.05, 0.02, 0.01],
    'GBP': [50, 20, 10, 5, 2, 1, 0.50, 0.20, 0.10, 0.05, 0.02, 0.01],
  };

  const denominations = defaultDenoms[currency] || defaultDenoms['USD'];
  
  return denominations.map(denom => ({
    denomination: denom,
    currency: currency,
    enabled: true
  }));
};

// Create Payment Entry in ERPNext
export const createPaymentEntry = async (paymentData: {
  payment_type: 'Receive' | 'Pay';
  party_type: 'Customer' | 'Supplier';
  party: string;
  mode_of_payment: string;
  paid_amount: number;
  received_amount: number;
  references: Array<{
    reference_doctype: string;
    reference_name: string;
    allocated_amount: number;
  }>;
  posting_date: string;
  company: string;
  currency: string;
}): Promise<any> => {
  if (USE_REAL_ERPNEXT_DATA) {
    try {
      const response = await api.post('/Payment Entry', paymentData);
      return response.data;
    } catch (error) {
      console.error('Error creating payment entry:', error);
      throw new Error('Failed to create payment entry in ERPNext');
    }
  } else {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Mock payment entry created:', paymentData);
    return { name: 'PE-' + Date.now(), ...paymentData };
  }
};

// Create Journal Entry in ERPNext (for cash collection/payout)
export const createJournalEntry = async (journalData: {
  posting_date: string;
  company: string;
  accounts: Array<{
    account: string;
    debit_in_account_currency: number;
    credit_in_account_currency: number;
    party_type?: string;
    party?: string;
  }>;
  user_remark?: string;
}): Promise<any> => {
  if (USE_REAL_ERPNEXT_DATA) {
    try {
      const response = await api.post('/Journal Entry', journalData);
      return response.data;
    } catch (error) {
      console.error('Error creating journal entry:', error);
      throw new Error('Failed to create journal entry in ERPNext');
    }
  } else {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('Mock journal entry created:', journalData);
    return { name: 'JE-' + Date.now(), ...journalData };
  }
};
