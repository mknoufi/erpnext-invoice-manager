import React, { createContext, useContext, useState, useCallback } from 'react';
import posService from '../api/posService';
import type { CashierSession } from '../types/pos';

type CashierState = {
  session: CashierSession | null;
  isLoading: boolean;
  error?: string;
};

type CashierContextType = {
  state: CashierState;
  pinLogin: (pin: string) => Promise<boolean>;
  logout: () => Promise<void>;
};

const CashierContext = createContext<CashierContextType>({
  state: { session: null, isLoading: false },
  pinLogin: async () => false,
  logout: async () => {},
});

export const useCashier = () => useContext(CashierContext);

export const CashierProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<CashierState>({ session: null, isLoading: false });

  const pinLogin = useCallback(async (pin: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: undefined }));
      const session = await posService.loginWithPin(pin);
      setState({ session, isLoading: false });
      return true;
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false, error: 'Invalid PIN or login failed' }));
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const sessionId = state.session?.sessionId;
      if (sessionId) {
        await posService.closeSession(sessionId);
      }
    } finally {
      setState({ session: null, isLoading: false });
    }
  }, [state.session]);

  return (
    <CashierContext.Provider value={{ state, pinLogin, logout }}>
      {children}
    </CashierContext.Provider>
  );
};

export default CashierContext;


