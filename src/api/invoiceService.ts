import api from './client';

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
}

export const fetchInvoices = async (status: 'Overdue' | 'Unpaid' | 'All' = 'All'): Promise<Invoice[]> => {
  let filters: Record<string, any> = {
    docstatus: 1, // Only submitted documents
    outstanding_amount: ['>', 0], // Only invoices with outstanding amount
  };

  if (status === 'Overdue') {
    filters.due_date = ['<', new Date().toISOString().split('T')[0]];
  } else if (status === 'Unpaid') {
    filters.due_date = ['>=', new Date().toISOString().split('T')[0]];
  }

  const response = await api.get('/Sales Invoice', {
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
      ]),
      filters: JSON.stringify(filters),
      order_by: 'posting_date desc',
      limit_page_length: 1000,
    },
  });

  return response.data.data.map((invoice: any) => ({
    ...invoice,
    is_paid: invoice.status === 'Paid' || invoice.outstanding_amount <= 0,
  }));
};

export const markAsPaid = async (invoiceNames: string[]): Promise<void> => {
  await api.post('/method/erpnext.accounts.doctype.payment_entry.payment_entry.create_payment', {
    payment_type: 'Receive',
    posting_date: new Date().toISOString().split('T')[0],
    mode_of_payment: 'Cash',
    party_type: 'Customer',
    payment_entries: invoiceNames.map(name => ({
      reference_doctype: 'Sales Invoice',
      reference_name: name,
      allocated_amount: 0, // This will be set to the outstanding amount by the server
    })),
  });
};

export const getInvoiceDetails = async (invoiceId: string): Promise<Invoice> => {
  const response = await api.get(`/Sales Invoice/${invoiceId}`);
  return response.data.data;
};
