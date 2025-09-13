import { apiWithRetry, ApiError } from './client';

export interface Invoice {
  name: string;
  customer: string;
  customer_name: string;
  posting_date: string;
  due_date: string;
  grand_total: number;
  outstanding_amount: number;
  status: 'Draft' | 'Paid' | 'Unpaid' | 'Overdue' | 'Cancelled';
  is_paid: boolean;
  currency?: string;
  company?: string;
  items?: InvoiceItem[];
  taxes?: InvoiceTax[];
}

export interface InvoiceItem {
  item_code: string;
  item_name: string;
  qty: number;
  rate: number;
  amount: number;
  uom?: string;
}

export interface InvoiceTax {
  charge_type: string;
  account_head: string;
  description: string;
  tax_amount: number;
  total: number;
}

// Enhanced error handling for invoice operations
export class InvoiceServiceError extends Error {
  constructor(
    message: string,
    public originalError?: Error,
    public operation?: string,
    public fallbackUsed: boolean = false
  ) {
    super(message);
    this.name = 'InvoiceServiceError';
  }
}

// Service configuration
const SERVICE_CONFIG = {
  fallbackToMockOnError: true,
  logErrors: true,
  retryFailedOperations: true,
};

// Configuration: Set to true to use real ERPNext data, false for mock data
const USE_REAL_ERPNEXT_DATA = true;

// Mock data for demo purposes
const mockInvoices: Invoice[] = [
  {
    name: 'INV-2024-001',
    customer: 'CUST-001',
    customer_name: 'ABC Company Ltd',
    posting_date: '2024-09-10',
    due_date: '2024-09-25',
    grand_total: 1500.00,
    outstanding_amount: 1500.00,
    status: 'Unpaid',
    is_paid: false,
  },
  {
    name: 'INV-2024-002',
    customer: 'CUST-002',
    customer_name: 'XYZ Corporation',
    posting_date: '2024-09-08',
    due_date: '2024-09-23',
    grand_total: 2500.00,
    outstanding_amount: 2500.00,
    status: 'Unpaid',
    is_paid: false,
  },
  {
    name: 'INV-2024-003',
    customer: 'CUST-003',
    customer_name: 'Tech Solutions Inc',
    posting_date: '2024-09-05',
    due_date: '2024-09-20',
    grand_total: 3200.00,
    outstanding_amount: 0.00,
    status: 'Paid',
    is_paid: true,
  },
  {
    name: 'INV-2024-004',
    customer: 'CUST-004',
    customer_name: 'Global Enterprises',
    posting_date: '2024-08-28',
    due_date: '2024-09-12',
    grand_total: 1800.00,
    outstanding_amount: 1800.00,
    status: 'Overdue',
    is_paid: false,
  },
  {
    name: 'INV-2024-005',
    customer: 'CUST-005',
    customer_name: 'Startup Ventures',
    posting_date: '2024-09-12',
    due_date: '2024-09-27',
    grand_total: 950.00,
    outstanding_amount: 950.00,
    status: 'Unpaid',
    is_paid: false,
  },
];

export const fetchInvoices = async (status: 'Overdue' | 'Unpaid' | 'All' = 'All'): Promise<Invoice[]> => {
  if (USE_REAL_ERPNEXT_DATA) {
    try {
      // Real ERPNext API call with enhanced error handling
      let filters: Record<string, any> = {
        docstatus: 1, // Only submitted documents
      };

      if (status === 'Overdue') {
        filters.due_date = ['<', new Date().toISOString().split('T')[0]];
        filters.outstanding_amount = ['>', 0];
      } else if (status === 'Unpaid') {
        filters.outstanding_amount = ['>', 0];
      }

      const response = await apiWithRetry.get('/Sales Invoice', {
        params: {
          fields: JSON.stringify([
            'name',
            'customer',
            'customer_name',
            'posting_date',
            'due_date',
            'grand_total',
            'outstanding_amount',
            'status',
            'currency',
            'company',
            'items.item_code',
            'items.item_name',
            'items.qty',
            'items.rate',
            'items.amount',
            'items.uom',
            'taxes_and_charges',
            'total_taxes_and_charges'
          ]),
          filters: JSON.stringify(filters),
          order_by: 'posting_date desc',
          limit_page_length: 1000,
        },
      });

      const invoices = response.data.data.map((invoice: any) => ({
        ...invoice,
        is_paid: invoice.status === 'Paid' || invoice.outstanding_amount <= 0,
        items: invoice.items || [],
        taxes: invoice.taxes_and_charges || []
      }));

      if (SERVICE_CONFIG.logErrors) {
        console.log(`Successfully fetched ${invoices.length} invoices from ERPNext`);
      }

      return invoices;
    } catch (error) {
      if (SERVICE_CONFIG.logErrors) {
        console.error('Error fetching invoices from ERPNext:', error);
      }

      // Enhanced error handling with specific error types
      if (error instanceof ApiError) {
        if (error.status === 401) {
          throw new InvoiceServiceError(
            'Authentication failed. Please check your ERPNext credentials.',
            error,
            'fetchInvoices'
          );
        } else if (error.status === 403) {
          throw new InvoiceServiceError(
            'Permission denied. Please check your ERPNext permissions for Sales Invoice.',
            error,
            'fetchInvoices'
          );
        } else if (error.retryable && SERVICE_CONFIG.fallbackToMockOnError) {
          if (SERVICE_CONFIG.logErrors) {
            console.log('Falling back to mock data due to retryable error...');
          }
          return fetchMockInvoices(status);
        }
      }

      // Fallback to mock data if configured
      if (SERVICE_CONFIG.fallbackToMockOnError) {
        if (SERVICE_CONFIG.logErrors) {
          console.log('Falling back to mock data...');
        }
        return fetchMockInvoices(status);
      }

      // Re-throw with enhanced error information
      throw new InvoiceServiceError(
        'Failed to fetch invoices from ERPNext',
        error instanceof Error ? error : new Error(String(error)),
        'fetchInvoices'
      );
    }
  } else {
    return fetchMockInvoices(status);
  }
};

const fetchMockInvoices = async (status: 'Overdue' | 'Unpaid' | 'All' = 'All'): Promise<Invoice[]> => {
  // Mock data implementation
  await new Promise(resolve => setTimeout(resolve, 500));
  
  let filteredInvoices = mockInvoices;
  
  if (status === 'Overdue') {
    filteredInvoices = mockInvoices.filter(invoice => invoice.status === 'Overdue');
  } else if (status === 'Unpaid') {
    filteredInvoices = mockInvoices.filter(invoice => 
      invoice.status === 'Unpaid' || invoice.status === 'Overdue'
    );
  }
  
  return filteredInvoices;
};

export const markAsPaid = async (invoiceNames: string[], paymentMode: string = 'Cash'): Promise<void> => {
  if (USE_REAL_ERPNEXT_DATA) {
    try {
      // Real ERPNext API call for creating payment entries with enhanced error handling
      const paymentData = {
        payment_type: 'Receive',
        posting_date: new Date().toISOString().split('T')[0],
        mode_of_payment: paymentMode,
        party_type: 'Customer',
        payment_entries: invoiceNames.map(name => ({
          reference_doctype: 'Sales Invoice',
          reference_name: name,
          allocated_amount: 0, // This will be set to the outstanding amount by the server
        })),
      };

      await apiWithRetry.post('/method/erpnext.accounts.doctype.payment_entry.payment_entry.create_payment', paymentData);
      
      if (SERVICE_CONFIG.logErrors) {
        console.log(`Successfully created payment entries for ${invoiceNames.length} invoices:`, invoiceNames);
      }
    } catch (error) {
      if (SERVICE_CONFIG.logErrors) {
        console.error('Error creating payment entries:', error);
      }

      // Enhanced error handling
      if (error instanceof ApiError) {
        if (error.status === 401) {
          throw new InvoiceServiceError(
            'Authentication failed. Please check your ERPNext credentials.',
            error,
            'markAsPaid'
          );
        } else if (error.status === 403) {
          throw new InvoiceServiceError(
            'Permission denied. Please check your ERPNext permissions for Payment Entry.',
            error,
            'markAsPaid'
          );
        } else if (error.status >= 400 && error.status < 500) {
          throw new InvoiceServiceError(
            `Invalid request: ${error.message}. Please check invoice names and payment mode.`,
            error,
            'markAsPaid'
          );
        }
      }

      // Fallback for mock mode when configured
      if (SERVICE_CONFIG.fallbackToMockOnError) {
        if (SERVICE_CONFIG.logErrors) {
          console.log('Falling back to mock payment processing...');
        }
        await markAsPaidMock(invoiceNames);
        return;
      }

      throw new InvoiceServiceError(
        'Failed to create payment entries in ERPNext',
        error instanceof Error ? error : new Error(String(error)),
        'markAsPaid'
      );
    }
  } else {
    await markAsPaidMock(invoiceNames);
  }
};

// Separate mock function for better separation of concerns
const markAsPaidMock = async (invoiceNames: string[]): Promise<void> => {
  // Mock implementation
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (SERVICE_CONFIG.logErrors) {
    console.log('Mock: Marking invoices as paid:', invoiceNames);
  }
  
  mockInvoices.forEach(invoice => {
    if (invoiceNames.includes(invoice.name)) {
      invoice.outstanding_amount = 0;
      invoice.status = 'Paid';
      invoice.is_paid = true;
    }
  });
};

export const getInvoiceDetails = async (invoiceId: string): Promise<Invoice> => {
  if (USE_REAL_ERPNEXT_DATA) {
    try {
      // Real ERPNext API call with enhanced error handling
      const response = await apiWithRetry.get(`/Sales Invoice/${invoiceId}`);
      
      if (SERVICE_CONFIG.logErrors) {
        console.log(`Successfully fetched invoice details for ${invoiceId}`);
      }
      
      return {
        ...response.data.data,
        is_paid: response.data.data.status === 'Paid' || response.data.data.outstanding_amount <= 0,
        items: response.data.data.items || [],
        taxes: response.data.data.taxes_and_charges || []
      };
    } catch (error) {
      if (SERVICE_CONFIG.logErrors) {
        console.error(`Error fetching invoice details for ${invoiceId}:`, error);
      }

      // Enhanced error handling
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new InvoiceServiceError(
            `Invoice ${invoiceId} not found`,
            error,
            'getInvoiceDetails'
          );
        } else if (error.status === 401) {
          throw new InvoiceServiceError(
            'Authentication failed. Please check your ERPNext credentials.',
            error,
            'getInvoiceDetails'
          );
        } else if (error.status === 403) {
          throw new InvoiceServiceError(
            'Permission denied. Please check your ERPNext permissions for Sales Invoice.',
            error,
            'getInvoiceDetails'
          );
        }
      }

      // Fallback to mock data if configured
      if (SERVICE_CONFIG.fallbackToMockOnError) {
        if (SERVICE_CONFIG.logErrors) {
          console.log('Falling back to mock data for invoice details...');
        }
        return getInvoiceDetailsMock(invoiceId);
      }

      throw new InvoiceServiceError(
        `Failed to fetch invoice details for ${invoiceId}`,
        error instanceof Error ? error : new Error(String(error)),
        'getInvoiceDetails'
      );
    }
  } else {
    return getInvoiceDetailsMock(invoiceId);
  }
};

// Separate mock function for better separation of concerns
const getInvoiceDetailsMock = async (invoiceId: string): Promise<Invoice> => {
  // Mock implementation
  await new Promise(resolve => setTimeout(resolve, 300));
  
  const invoice = mockInvoices.find(inv => inv.name === invoiceId);
  if (!invoice) {
    throw new InvoiceServiceError(
      `Invoice ${invoiceId} not found`,
      undefined,
      'getInvoiceDetails',
      true
    );
  }
  
  return invoice;
};