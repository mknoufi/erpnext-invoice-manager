import { apiWithRetry } from './client';

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
      // Real ERPNext API call
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

      return response.data.data.map((invoice: any) => ({
        ...invoice,
        is_paid: invoice.status === 'Paid' || invoice.outstanding_amount <= 0,
        items: invoice.items || [],
        taxes: invoice.taxes_and_charges || []
      }));
    } catch (error) {
      console.error('Error fetching invoices from ERPNext:', error);
      // Fallback to mock data if ERPNext is not available
      console.log('Falling back to mock data...');
      return fetchMockInvoices(status);
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
      // Real ERPNext API call for creating payment entries
      await apiWithRetry.post('/method/erpnext.accounts.doctype.payment_entry.payment_entry.create_payment', {
        payment_type: 'Receive',
        posting_date: new Date().toISOString().split('T')[0],
        mode_of_payment: paymentMode,
        party_type: 'Customer',
        payment_entries: invoiceNames.map(name => ({
          reference_doctype: 'Sales Invoice',
          reference_name: name,
          allocated_amount: 0, // This will be set to the outstanding amount by the server
        })),
      });
      console.log('Successfully created payment entries for invoices:', invoiceNames);
    } catch (error) {
      console.error('Error creating payment entries:', error);
      throw new Error('Failed to create payment entries in ERPNext');
    }
  } else {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Marking invoices as paid:', invoiceNames);
    
    mockInvoices.forEach(invoice => {
      if (invoiceNames.includes(invoice.name)) {
        invoice.outstanding_amount = 0;
        invoice.status = 'Paid';
        invoice.is_paid = true;
      }
    });
  }
};

export const getInvoiceDetails = async (invoiceId: string): Promise<Invoice> => {
  if (USE_REAL_ERPNEXT_DATA) {
    // Real ERPNext API call
    // Uncomment the import at the top and use this code:
    /*
    const response = await api.get(`/Sales Invoice/${invoiceId}`);
    return response.data.data;
    */
    throw new Error('Real ERPNext data not configured. Set USE_REAL_ERPNEXT_DATA = true and configure API client.');
  } else {
    // Mock implementation
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const invoice = mockInvoices.find(inv => inv.name === invoiceId);
    if (!invoice) {
      throw new Error(`Invoice ${invoiceId} not found`);
    }
    
    return invoice;
  }
};