import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchInvoices, markAsPaid, getInvoiceDetails, Invoice } from '../api/invoiceService';
import { subscribeToDocType } from '../api/socket';
import { useEffect } from 'react';

export const useInvoices = (status: 'Overdue' | 'Unpaid' | 'All' = 'All') => {
  const queryClient = useQueryClient();
  
  const {
    data: invoices = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Invoice[]>({
    queryKey: ['invoices', status],
    queryFn: () => fetchInvoices(status),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const markPaidMutation = useMutation({
    mutationFn: (invoiceNames: string[]) => markAsPaid(invoiceNames),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
  });

  // Subscribe to real-time updates
  useEffect(() => {
    const unsubscribe = subscribeToDocType('Sales Invoice', () => {
      refetch();
    });

    return () => {
      unsubscribe();
    };
  }, [refetch]);

  const handleMarkAsPaid = (invoiceNames: string[]) => {
    return markPaidMutation.mutateAsync(invoiceNames);
  };

  return {
    invoices,
    isLoading,
    error,
    markAsPaid: handleMarkAsPaid,
    isMarkingPaid: markPaidMutation.isPending,
    refetch,
  };
};

export const useInvoice = (invoiceId?: string) => {
  return useQuery<Invoice>({
    queryKey: ['invoice', invoiceId],
    queryFn: () => getInvoiceDetails(invoiceId!), // The non-null assertion is safe because of enabled: !!invoiceId
    enabled: !!invoiceId,
  });
};
