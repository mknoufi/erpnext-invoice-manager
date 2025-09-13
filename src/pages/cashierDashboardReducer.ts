import { useReducer, Dispatch } from 'react';
import type { InvoiceSummary } from '../types/pos';

// State interface
export interface CashierDashboardState {
  // UI state
  tab: number;
  search: string;
  
  // Data state
  todayInvoices: InvoiceSummary[];
  pendingDeliveries: InvoiceSummary[];
  selectedInvoices: InvoiceSummary[];
  
  // Modal states
  modals: {
    showDiscount: boolean;
    showApproval: boolean;
    showPayment: boolean;
    showPayout: boolean;
    showCashCollection: boolean;
    showCashCount: boolean;
    showEOD: boolean;
  };
  
  // Toast state
  toast: {
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  };
  
  // Loading states
  loading: {
    data: boolean;
    payment: boolean;
    payout: boolean;
  };
}

// Action types
export type CashierDashboardAction = 
  | { type: 'SET_TAB'; payload: number }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_TODAY_INVOICES'; payload: InvoiceSummary[] }
  | { type: 'SET_PENDING_DELIVERIES'; payload: InvoiceSummary[] }
  | { type: 'SET_SELECTED_INVOICES'; payload: InvoiceSummary[] }
  | { type: 'SHOW_MODAL'; payload: keyof CashierDashboardState['modals'] }
  | { type: 'HIDE_MODAL'; payload: keyof CashierDashboardState['modals'] }
  | { type: 'HIDE_ALL_MODALS' }
  | { type: 'SHOW_TOAST'; payload: Omit<CashierDashboardState['toast'], 'open'> }
  | { type: 'HIDE_TOAST' }
  | { type: 'SET_LOADING'; payload: { key: keyof CashierDashboardState['loading']; value: boolean } }
  | { type: 'RESET_STATE' };

// Initial state
export const initialState: CashierDashboardState = {
  tab: 0,
  search: '',
  todayInvoices: [],
  pendingDeliveries: [],
  selectedInvoices: [],
  modals: {
    showDiscount: false,
    showApproval: false,
    showPayment: false,
    showPayout: false,
    showCashCollection: false,
    showCashCount: false,
    showEOD: false,
  },
  toast: {
    open: false,
    message: '',
    severity: 'success',
  },
  loading: {
    data: false,
    payment: false,
    payout: false,
  },
};

// Reducer function
export const cashierDashboardReducer = (
  state: CashierDashboardState,
  action: CashierDashboardAction
): CashierDashboardState => {
  switch (action.type) {
    case 'SET_TAB':
      return { ...state, tab: action.payload };
      
    case 'SET_SEARCH':
      return { ...state, search: action.payload };
      
    case 'SET_TODAY_INVOICES':
      return { ...state, todayInvoices: action.payload };
      
    case 'SET_PENDING_DELIVERIES':
      return { ...state, pendingDeliveries: action.payload };
      
    case 'SET_SELECTED_INVOICES':
      return { ...state, selectedInvoices: action.payload };
      
    case 'SHOW_MODAL':
      return {
        ...state,
        modals: { ...state.modals, [action.payload]: true },
      };
      
    case 'HIDE_MODAL':
      return {
        ...state,
        modals: { ...state.modals, [action.payload]: false },
      };
      
    case 'HIDE_ALL_MODALS':
      return {
        ...state,
        modals: {
          showDiscount: false,
          showApproval: false,
          showPayment: false,
          showPayout: false,
          showCashCollection: false,
          showCashCount: false,
          showEOD: false,
        },
      };
      
    case 'SHOW_TOAST':
      return {
        ...state,
        toast: { ...action.payload, open: true },
      };
      
    case 'HIDE_TOAST':
      return {
        ...state,
        toast: { ...state.toast, open: false },
      };
      
    case 'SET_LOADING':
      return {
        ...state,
        loading: { ...state.loading, [action.payload.key]: action.payload.value },
      };
      
    case 'RESET_STATE':
      return initialState;
      
    default:
      return state;
  }
};

// Custom hook for using the reducer with action creators
export const useCashierDashboard = () => {
  const [state, dispatch] = useReducer(cashierDashboardReducer, initialState);
  
  // Action creators
  const actions = {
    setTab: (tab: number) => dispatch({ type: 'SET_TAB', payload: tab }),
    setSearch: (search: string) => dispatch({ type: 'SET_SEARCH', payload: search }),
    setTodayInvoices: (invoices: InvoiceSummary[]) => 
      dispatch({ type: 'SET_TODAY_INVOICES', payload: invoices }),
    setPendingDeliveries: (deliveries: InvoiceSummary[]) => 
      dispatch({ type: 'SET_PENDING_DELIVERIES', payload: deliveries }),
    setSelectedInvoices: (invoices: InvoiceSummary[]) => 
      dispatch({ type: 'SET_SELECTED_INVOICES', payload: invoices }),
    showModal: (modal: keyof CashierDashboardState['modals']) => 
      dispatch({ type: 'SHOW_MODAL', payload: modal }),
    hideModal: (modal: keyof CashierDashboardState['modals']) => 
      dispatch({ type: 'HIDE_MODAL', payload: modal }),
    hideAllModals: () => dispatch({ type: 'HIDE_ALL_MODALS' }),
    showToast: (toast: Omit<CashierDashboardState['toast'], 'open'>) => 
      dispatch({ type: 'SHOW_TOAST', payload: toast }),
    hideToast: () => dispatch({ type: 'HIDE_TOAST' }),
    setLoading: (key: keyof CashierDashboardState['loading'], value: boolean) => 
      dispatch({ type: 'SET_LOADING', payload: { key, value } }),
    resetState: () => dispatch({ type: 'RESET_STATE' }),
  };
  
  return { state, actions, dispatch };
};

export type CashierDashboardActions = ReturnType<typeof useCashierDashboard>['actions'];
export type CashierDashboardDispatch = Dispatch<CashierDashboardAction>;