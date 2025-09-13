import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import logger from '../utils/logger';
import { Box, CircularProgress } from '@mui/material';
import { AuthState, AuthUser, UserRole } from '../types/security';

// Define the context type
type SecurityContextType = {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  verify2FA: (token: string) => Promise<boolean>;
  hasPermission: (permission: keyof AuthUser['permissions']) => boolean;
  hasRole: (role: UserRole) => boolean;
  refreshSession: () => Promise<void>;
};

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  is2FAPending: false,
  loading: false,
  error: null,
};

// Create context
const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

// Reducer function for state management
function securityReducer(state: AuthState, action: any): AuthState {
  switch (action.type) {
    case 'INITIALIZE':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: !!action.payload.user,
        isInitialized: true,
        loading: false,
      };
    case 'LOGIN_REQUEST':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        is2FAPending: action.payload.user.is2FAEnabled,
        loading: false,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload.error,
        isAuthenticated: false,
        user: null,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        is2FAPending: false,
      };
    case 'VERIFY_2FA_SUCCESS':
      return {
        ...state,
        is2FAPending: false,
        isAuthenticated: true,
      };
    default:
      return state;
  }
}

// Provider component
export const SecurityProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(securityReducer, initialState);
  const navigate = useNavigate();

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token && token.startsWith('demo-token-')) {
          // For demo purposes, create a mock user if token exists
          const mockUser: AuthUser = {
            id: '1',
            email: 'admin@example.com',
            name: 'Admin User',
            role: UserRole.ADMIN,
            is2FAEnabled: false,
            permissions: {
              canViewInvoices: true,
              canCreateInvoices: true,
              canEditInvoices: true,
              canDeleteInvoices: true,
              canManageUsers: true,
              canViewReports: true,
              canManageSettings: true,
              canProcessPayments: true,
              canViewAuditLogs: true,
            },
            lastLogin: new Date(),
            lastLoginIP: '127.0.0.1',
          };
          dispatch({ type: 'INITIALIZE', payload: { user: mockUser } });
        } else {
          dispatch({ type: 'INITIALIZE', payload: { user: null } });
        }
      } catch (error) {
        console.error('Failed to initialize auth', error);
        dispatch({ type: 'INITIALIZE', payload: { user: null } });
      }
    };

    initializeAuth();
  }, [navigate]);

  // Login function
  const login = async (email: string, password: string) => {
    dispatch({ type: 'LOGIN_REQUEST' });
    
    // Simple validation for demo purposes
    if (!email || !password) {
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: { error: 'Email and password are required' } 
      });
      throw new Error('Email and password are required');
    }
    
    try {
      // Simulated response for now - accept any email/password for demo
      const mockUser: AuthUser = {
        id: '1',
        email,
        name: 'Admin User',
        role: UserRole.ADMIN,
        is2FAEnabled: false, // Temporarily disable 2FA for testing
        permissions: {
          canViewInvoices: true,
          canCreateInvoices: true,
          canEditInvoices: true,
          canDeleteInvoices: true,
          canManageUsers: true,
          canViewReports: true,
          canManageSettings: true,
          canProcessPayments: true,
          canViewAuditLogs: true,
        },
        lastLogin: new Date(),
        lastLoginIP: '127.0.0.1',
      };
      
      // Store auth token
      localStorage.setItem('authToken', 'demo-token-' + Date.now());
      
      dispatch({ 
        type: 'LOGIN_SUCCESS', 
        payload: { user: mockUser } 
      });
      
      logger.info('Login successful, navigating to dashboard...');
      
      // Navigate immediately after state update
      navigate('/', { replace: true });
      
    } catch (error) {
      console.error('Login error:', error);
      dispatch({ 
        type: 'LOGIN_FAILURE', 
        payload: { error: 'Login failed. Please try again.' } 
      });
      throw error;
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('authToken');
    dispatch({ type: 'LOGOUT' });
    // Use setTimeout to ensure navigation happens after state update
    setTimeout(() => {
      navigate('/login');
    }, 0);
  };

  // 2FA Verification
  const verify2FA = async (token: string): Promise<boolean> => {
    try {
      // TODO: Replace with actual 2FA verification
      // await api.post('/auth/verify-2fa', { token });
      dispatch({ type: 'VERIFY_2FA_SUCCESS' });
      // Use setTimeout to ensure navigation happens after state update
      setTimeout(() => {
        navigate('/');
      }, 0);
      return true;
    } catch (error) {
      console.error('2FA verification failed', error);
      return false;
    }
  };

  // Check permission
  const hasPermission = (permission: keyof AuthUser['permissions']): boolean => {
    if (!state.user) return false;
    return state.user.permissions[permission] === true;
  };

  // Check role
  const hasRole = (role: UserRole): boolean => {
    if (!state.user) return false;
    return state.user.role === role;
  };

  // Refresh session
  const refreshSession = async () => {
    // TODO: Implement session refresh logic
  };

  return (
    <SecurityContext.Provider
      value={{
        state,
        login,
        logout,
        verify2FA,
        hasPermission,
        hasRole,
        refreshSession,
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
};

// Custom hook to use security context
export const useSecurity = (): SecurityContextType => {
  const context = useContext(SecurityContext);
  if (context === undefined) {
    throw new Error('useSecurity must be used within a SecurityProvider');
  }
  return context;
};

// Higher Order Component for protected routes
export const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredPermissions: (keyof AuthUser['permissions'])[] = []
) => {
  return function WithAuth(props: P) {
    const { state, hasPermission } = useSecurity();
    const navigate = useNavigate();

    useEffect(() => {
      if (!state.isInitialized) return;
      
      const checkAuth = () => {
        if (!state.isAuthenticated) {
          navigate('/login', { replace: true });
        } else if (requiredPermissions.length > 0) {
          const hasAllPermissions = requiredPermissions.every(permission => 
            hasPermission(permission)
          );
          
          if (!hasAllPermissions) {
            navigate('/unauthorized', { replace: true });
          }
        }
      };
      
      // Use setTimeout to ensure navigation happens after render
      const timer = setTimeout(checkAuth, 0);
      return () => clearTimeout(timer);
    }, [state.isAuthenticated, state.isInitialized, hasPermission, navigate]);

    if (!state.isInitialized) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (!state.isAuthenticated) {
      return null; // Will be redirected by the effect
    }

    if (requiredPermissions.length > 0 && !requiredPermissions.every(hasPermission)) {
      return <div>Checking permissions...</div>; // Or a loading spinner
    }

    return <WrappedComponent {...props as P} />;
  };
};
