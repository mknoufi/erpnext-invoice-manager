import React, { createContext, useContext, useCallback } from 'react';
import { AlertColor, Slide, SlideProps } from '@mui/material';
import { SnackbarProvider, useSnackbar } from 'notistack';

interface NotificationContextType {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showWarning: (message: string) => void;
  showInfo: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// Slide transition component
function SlideTransition(props: SlideProps) {
  return <Slide {...props} direction="up" />;
}

// Custom notification component
const NotificationComponent: React.FC = () => {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const showNotification = useCallback((
    message: string, 
    variant: AlertColor, 
    duration: number = 4000
  ) => {
    enqueueSnackbar(message, {
      variant,
      autoHideDuration: duration,
      TransitionComponent: SlideTransition,
      anchorOrigin: {
        vertical: 'bottom',
        horizontal: 'right',
      },
      action: (key) => (
        <button
          onClick={() => closeSnackbar(key)}
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            fontSize: '16px',
            padding: '4px 8px',
          }}
        >
          ✕
        </button>
      ),
    });
  }, [enqueueSnackbar, closeSnackbar]);

  const showSuccess = useCallback((message: string) => {
    showNotification(message, 'success', 3000);
  }, [showNotification]);

  const showError = useCallback((message: string) => {
    showNotification(message, 'error', 6000);
  }, [showNotification]);

  const showWarning = useCallback((message: string) => {
    showNotification(message, 'warning', 4000);
  }, [showNotification]);

  const showInfo = useCallback((message: string) => {
    showNotification(message, 'info', 4000);
  }, [showNotification]);

  const contextValue: NotificationContextType = {
    showSuccess,
    showError,
    showWarning,
    showInfo,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {/* This component doesn't render anything, it just provides context */}
    </NotificationContext.Provider>
  );
};

// Main notification provider
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <SnackbarProvider
      maxSnack={3}
      dense
      preventDuplicate
      autoHideDuration={4000}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      TransitionComponent={SlideTransition}
    >
      <NotificationComponent />
      {children}
    </SnackbarProvider>
  );
};

// Enhanced notification hooks
export const useEnhancedNotification = () => {
  const { showSuccess, showError, showWarning, showInfo } = useNotification();

  const showApiError = useCallback((error: any) => {
    if (error?.response?.data?.message) {
      showError(`API Error: ${error.response.data.message}`);
    } else if (error?.message) {
      showError(`Error: ${error.message}`);
    } else {
      showError('An unexpected error occurred');
    }
  }, [showError]);

  const showApiSuccess = useCallback((message: string = 'Operation completed successfully') => {
    showSuccess(message);
  }, [showSuccess]);

  const showValidationError = useCallback((message: string) => {
    showWarning(`Validation Error: ${message}`);
  }, [showWarning]);

  const showNetworkError = useCallback(() => {
    showError('Network Error: Please check your internet connection');
  }, [showError]);

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showApiError,
    showApiSuccess,
    showValidationError,
    showNetworkError,
  };
};

export default NotificationProvider;
