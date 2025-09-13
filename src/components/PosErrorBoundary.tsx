import React, { Component, ReactNode, ErrorInfo } from 'react';
import { Box, Typography, Button, Paper, Alert } from '@mui/material';
import { ShoppingCart as PosIcon, Refresh as RefreshIcon, Home as HomeIcon } from '@mui/icons-material';

interface Props {
  children: ReactNode;
  onRetry?: () => void;
  onGoHome?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  sessionLost?: boolean;
}

export class PosErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if this is a session-related error
    const sessionLost = error.message.includes('session') || 
                       error.message.includes('authentication') ||
                       error.message.includes('unauthorized');
    
    return { hasError: true, error, sessionLost };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('PosErrorBoundary caught an error:', error, errorInfo);
    
    // Report POS-specific error information
    this.reportPosError(error, errorInfo);
  }

  reportPosError = (error: Error, errorInfo: ErrorInfo) => {
    const errorData = {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      context: 'POS_OPERATIONS',
      sessionLost: this.state.sessionLost,
      timestamp: new Date().toISOString(),
      url: window.location.href,
    };

    if (process.env.NODE_ENV === 'production') {
      console.error('POS Error reported to monitoring service:', errorData);
      // TODO: Send to error monitoring service with POS context
    } else {
      console.error('POS Error Details:', errorData);
    }
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, sessionLost: false });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  handleGoHome = () => {
    if (this.props.onGoHome) {
      this.props.onGoHome();
    } else {
      window.location.href = '/';
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            p: 3,
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 4,
              maxWidth: 600,
              textAlign: 'center',
              borderRadius: 2,
              border: '2px solid',
              borderColor: this.state.sessionLost ? 'warning.main' : 'error.main',
            }}
          >
            <PosIcon
              sx={{
                fontSize: 64,
                color: this.state.sessionLost ? 'warning.main' : 'error.main',
                mb: 2,
              }}
            />
            
            <Typography variant="h5" gutterBottom color={this.state.sessionLost ? 'warning.main' : 'error.main'}>
              {this.state.sessionLost ? 'Session Lost' : 'POS System Error'}
            </Typography>
            
            <Typography variant="body1" color="text.secondary" paragraph>
              {this.state.sessionLost 
                ? 'Your cashier session has expired or been lost. Please log in again to continue using the POS system.'
                : 'An error occurred in the POS system. This might affect invoice processing, payments, or other cashier operations.'
              }
            </Typography>

            {this.state.sessionLost && (
              <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
                <Typography variant="body2">
                  Don't worry - your transaction data is safe. Any pending operations will be restored after re-login.
                </Typography>
              </Alert>
            )}

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Alert severity="error" sx={{ mt: 2, textAlign: 'left' }}>
                <Typography variant="subtitle2" gutterBottom>
                  POS Error Details (Development Mode):
                </Typography>
                <Typography variant="body2" component="pre" sx={{ fontSize: '0.75rem' }}>
                  {this.state.error.message}
                </Typography>
              </Alert>
            )}

            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              {this.state.sessionLost ? (
                <Button
                  variant="contained"
                  onClick={() => window.location.href = '/cashier-login'}
                  color="warning"
                  size="large"
                >
                  Re-login to POS
                </Button>
              ) : (
                <>
                  <Button
                    variant="contained"
                    startIcon={<RefreshIcon />}
                    onClick={this.handleRetry}
                    color="primary"
                  >
                    Retry Operation
                  </Button>
                  
                  <Button
                    variant="outlined"
                    startIcon={<HomeIcon />}
                    onClick={this.handleGoHome}
                    color="primary"
                  >
                    Go to Dashboard
                  </Button>
                </>
              )}
              
              <Button
                variant="outlined"
                onClick={() => window.location.reload()}
                color="primary"
              >
                Refresh Page
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default PosErrorBoundary;