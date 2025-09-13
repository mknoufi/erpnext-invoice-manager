import React, { Component, ReactNode, ErrorInfo } from 'react';
import { Box, Typography, Button, Paper, Alert, Chip } from '@mui/material';
import { Error as ErrorIcon, Refresh as RefreshIcon, Settings as SettingsIcon } from '@mui/icons-material';
import { ApiError } from '../api/client';
import { InvoiceServiceError } from '../api/invoiceService';
import { PosServiceError } from '../api/posService';

interface Props {
  children: ReactNode;
  onRetry?: () => void;
  fallback?: ReactNode;
  componentName?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorType?: 'api' | 'network' | 'permission' | 'validation' | 'unknown';
  isRetryable?: boolean;
}

export class ApiErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    let errorType: State['errorType'] = 'unknown';
    let isRetryable = false;

    // Determine error type and retry capability
    if (error instanceof ApiError) {
      if (error.status === 0 || error.code === 'NETWORK_ERROR') {
        errorType = 'network';
        isRetryable = true;
      } else if (error.status === 401 || error.status === 403) {
        errorType = 'permission';
        isRetryable = false;
      } else if (error.status >= 400 && error.status < 500) {
        errorType = 'validation';
        isRetryable = false;
      } else if (error.status >= 500) {
        errorType = 'api';
        isRetryable = true;
      }
    } else if (error instanceof InvoiceServiceError || error instanceof PosServiceError) {
      errorType = 'api';
      isRetryable = true;
    }

    return { hasError: true, error, errorType, isRetryable };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`ApiErrorBoundary in ${this.props.componentName || 'Unknown Component'}:`, error, errorInfo);
    
    // Enhanced error reporting with context
    this.reportError(error, errorInfo);
  }

  reportError = (error: Error, errorInfo: ErrorInfo) => {
    const errorData = {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      componentName: this.props.componentName,
      errorType: this.state.errorType,
      isRetryable: this.state.isRetryable,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    // In production, send to error monitoring service
    if (process.env.NODE_ENV === 'production') {
      console.error('API Error reported to monitoring service:', errorData);
      // TODO: Integrate with error monitoring service (Sentry, LogRocket, etc.)
    } else {
      console.error('API Error Details:', errorData);
    }
  };

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorType: undefined, isRetryable: undefined });
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  getErrorMessage = (): string => {
    const { error, errorType } = this.state;
    
    switch (errorType) {
      case 'network':
        return 'Network connection failed. Please check your internet connection and try again.';
      case 'permission':
        return 'Access denied. Please check your permissions or log in again.';
      case 'validation':
        return 'Invalid request. Please check your input and try again.';
      case 'api':
        return 'Server error. Please try again in a moment.';
      default:
        return error?.message || 'An unexpected error occurred. Please try again.';
    }
  };

  getErrorColor = (): 'error' | 'warning' | 'info' => {
    switch (this.state.errorType) {
      case 'network':
        return 'warning';
      case 'permission':
        return 'error';
      case 'validation':
        return 'info';
      default:
        return 'error';
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '300px',
            p: 3,
          }}
        >
          <Paper
            elevation={2}
            sx={{
              p: 3,
              maxWidth: 500,
              textAlign: 'center',
              borderRadius: 2,
            }}
          >
            <ErrorIcon
              sx={{
                fontSize: 48,
                color: `${this.getErrorColor()}.main`,
                mb: 2,
              }}
            />
            
            <Typography variant="h6" gutterBottom color={this.getErrorColor()}>
              {this.props.componentName ? `${this.props.componentName} Error` : 'API Error'}
            </Typography>
            
            <Typography variant="body1" color="text.secondary" paragraph>
              {this.getErrorMessage()}
            </Typography>

            {this.state.errorType && (
              <Chip
                label={this.state.errorType.toUpperCase()}
                color={this.getErrorColor()}
                size="small"
                sx={{ mb: 2 }}
              />
            )}

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Alert severity="error" sx={{ mt: 2, textAlign: 'left' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Debug Information:
                </Typography>
                <Typography variant="body2" component="pre" sx={{ fontSize: '0.75rem' }}>
                  {this.state.error.message}
                </Typography>
              </Alert>
            )}

            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              {this.state.isRetryable && (
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={this.handleRetry}
                  color="primary"
                >
                  Retry
                </Button>
              )}
              
              {this.state.errorType === 'permission' && (
                <Button
                  variant="outlined"
                  startIcon={<SettingsIcon />}
                  onClick={() => window.location.href = '/login'}
                  color="primary"
                >
                  Re-login
                </Button>
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

export default ApiErrorBoundary;