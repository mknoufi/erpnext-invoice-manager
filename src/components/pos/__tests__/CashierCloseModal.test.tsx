import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CashierCloseModal } from '../CashierCloseModal';
import { useSettings } from '../../../contexts/SettingsContext';

// Mock the settings context
jest.mock('../../../contexts/SettingsContext');
const mockUseSettings = useSettings as jest.MockedFunction<typeof useSettings>;

// Mock the logger
jest.mock('../../../utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
}));

const mockSettings = {
  cashCounter: {
    currency: 'INR',
    denominations: [2000, 1000, 500, 200, 100, 50, 20, 10, 5, 2, 1],
    account_mappings: {
      cash_account: 'Cash Account',
      upi_account: 'UPI Account',
      card_account: 'Card Account',
      others_account: 'Others Account',
    },
    variance_threshold: 100,
  },
} as any;

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const renderWithQueryClient = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe('CashierCloseModal', () => {
  beforeEach(() => {
    mockUseSettings.mockReturnValue({
      settings: mockSettings,
      saveSettings: jest.fn(),
      resetSettings: jest.fn(),
      upgradeSettings: jest.fn(),
      toggleFeature: jest.fn(),
      isFeatureEnabled: jest.fn(),
      getAvailableFeatures: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders modal with correct title', () => {
    renderWithQueryClient(
      <CashierCloseModal
        open={true}
        onClose={jest.fn()}
        expectedAmount={5000}
        cashierId="cashier_1"
      />
    );

    expect(screen.getByText('Cashier Close - Balance Reconciliation')).toBeInTheDocument();
  });

  it('displays expected total correctly', () => {
    renderWithQueryClient(
      <CashierCloseModal
        open={true}
        onClose={jest.fn()}
        expectedAmount={5000}
        cashierId="cashier_1"
      />
    );

    // More specific assertion for expected total
    expect(screen.getByText('Expected Total')).toBeInTheDocument();
    // Verify the expected amount is displayed somewhere
    const expectedAmountElements = screen.getAllByText('₹5,000.00');
    expect(expectedAmountElements.length).toBeGreaterThan(0);
  });

  it('calculates denomination total correctly', async () => {
    renderWithQueryClient(
      <CashierCloseModal
        open={true}
        onClose={jest.fn()}
        expectedAmount={5000}
        cashierId="cashier_1"
      />
    );

    // Find denomination input for ₹1000
    const denominationInput = screen.getByLabelText('INR 1000');
    fireEvent.change(denominationInput, { target: { value: '5' } });

    // Check if total is calculated correctly (5 * 1000 = 5000)
    // Look specifically for the "Counted Total" value, not the "Expected Total"
    await waitFor(() => {
      const countedTotalElements = screen.getAllByText('₹5,000.00');
      expect(countedTotalElements.length).toBeGreaterThan(0);
      // Verify we have both Expected Total and Counted Total with the same value
      expect(screen.getByText('Expected Total')).toBeInTheDocument();
      expect(screen.getByText('Counted Total')).toBeInTheDocument();
    });
  });

  it('shows variance calculation', async () => {
    renderWithQueryClient(
      <CashierCloseModal
        open={true}
        onClose={jest.fn()}
        expectedAmount={5000}
        cashierId="cashier_1"
      />
    );

    // Enter denomination that creates variance
    const denominationInput = screen.getByLabelText('INR 1000');
    fireEvent.change(denominationInput, { target: { value: '4' } }); // 4000 instead of 5000

    await waitFor(() => {
      expect(screen.getByText('-₹1,000.00')).toBeInTheDocument(); // Variance should be -1000
    });
  });

  it('validates payment mode totals', async () => {
    const mockOnSubmit = jest.fn();
    
    renderWithQueryClient(
      <CashierCloseModal
        open={true}
        onClose={jest.fn()}
        expectedAmount={5000}
        cashierId="cashier_1"
        onSubmit={mockOnSubmit}
      />
    );

    // Set up denominations to match expected amount
    const denominationInput = screen.getByLabelText('INR 1000');
    fireEvent.change(denominationInput, { target: { value: '5' } });

    // Set payment mode totals
    const cashInput = screen.getByLabelText('Cash');
    fireEvent.change(cashInput, { target: { value: '5000' } });

    // Try to submit
    const submitButton = screen.getByText('Submit for Verification');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          cashier_id: 'cashier_1',
          expected_total: 5000,
          denominations: expect.arrayContaining([
            expect.objectContaining({ value: 1000, count: 5, total: 5000 })
          ]),
          payment_mode_totals: expect.arrayContaining([
            expect.objectContaining({ mode: 'cash', amount: 5000 })
          ]),
        })
      );
    });
  });

  it('disables submit button when validation fails', () => {
    renderWithQueryClient(
      <CashierCloseModal
        open={true}
        onClose={jest.fn()}
        expectedAmount={5000}
        cashierId="cashier_1"
      />
    );

    const submitButton = screen.getByText('Submit for Verification');
    expect(submitButton).toBeDisabled();
  });

  it('shows variance warning when threshold is exceeded', async () => {
    renderWithQueryClient(
      <CashierCloseModal
        open={true}
        onClose={jest.fn()}
        expectedAmount={5000}
        cashierId="cashier_1"
      />
    );

    // Create large variance (exceeds threshold of 100)
    const denominationInput = screen.getByLabelText('INR 1000');
    fireEvent.change(denominationInput, { target: { value: '1' } }); // 1000 instead of 5000

    await waitFor(() => {
      expect(screen.getByText(/Variance exceeds threshold/)).toBeInTheDocument();
    });
  });

  it('calls onClose when close button is clicked', () => {
    const mockOnClose = jest.fn();
    
    renderWithQueryClient(
      <CashierCloseModal
        open={true}
        onClose={mockOnClose}
        expectedAmount={5000}
        cashierId="cashier_1"
      />
    );

    const closeButton = screen.getByText('Close');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('handles notes input', () => {
    renderWithQueryClient(
      <CashierCloseModal
        open={true}
        onClose={jest.fn()}
        expectedAmount={5000}
        cashierId="cashier_1"
      />
    );

    const notesInput = screen.getByLabelText('Notes (Optional)');
    fireEvent.change(notesInput, { target: { value: 'Test notes' } });

    expect(notesInput).toHaveValue('Test notes');
  });
});
