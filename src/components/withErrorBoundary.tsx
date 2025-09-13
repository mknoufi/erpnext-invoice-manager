import React, { ComponentType } from 'react';
import ErrorBoundary from './ErrorBoundary';
import ApiErrorBoundary from './ApiErrorBoundary';
import PosErrorBoundary from './PosErrorBoundary';

export type ErrorBoundaryType = 'default' | 'api' | 'pos';

interface WithErrorBoundaryOptions {
  type?: ErrorBoundaryType;
  componentName?: string;
  onRetry?: () => void;
  fallback?: React.ReactNode;
}

// Higher-order component for adding error boundaries
export function withErrorBoundary<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithErrorBoundaryOptions = {}
) {
  const { type = 'default', componentName, onRetry, fallback } = options;

  const WithErrorBoundaryComponent = (props: P) => {
    const displayName = componentName || WrappedComponent.displayName || WrappedComponent.name || 'Component';

    switch (type) {
      case 'api':
        return (
          <ApiErrorBoundary
            componentName={displayName}
            onRetry={onRetry}
            fallback={fallback}
          >
            <WrappedComponent {...props} />
          </ApiErrorBoundary>
        );
      
      case 'pos':
        return (
          <PosErrorBoundary onRetry={onRetry}>
            <WrappedComponent {...props} />
          </PosErrorBoundary>
        );
      
      default:
        return (
          <ErrorBoundary fallback={fallback}>
            <WrappedComponent {...props} />
          </ErrorBoundary>
        );
    }
  };

  WithErrorBoundaryComponent.displayName = `withErrorBoundary(${componentName || WrappedComponent.displayName || WrappedComponent.name})`;

  return WithErrorBoundaryComponent;
}

// Hook for error boundary utilities
export function useErrorBoundary() {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = () => setError(null);
  
  const reportError = (error: Error, context?: string) => {
    console.error(`Manual error report${context ? ` in ${context}` : ''}:`, error);
    setError(error);
  };

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { reportError, resetError };
}

// Utility component for wrapping sections with error boundaries
interface ErrorBoundaryWrapperProps {
  children: React.ReactNode;
  type?: ErrorBoundaryType;
  title?: string;
  onRetry?: () => void;
  fallback?: React.ReactNode;
}

export const ErrorBoundaryWrapper: React.FC<ErrorBoundaryWrapperProps> = ({
  children,
  type = 'default',
  title,
  onRetry,
  fallback,
}) => {
  switch (type) {
    case 'api':
      return (
        <ApiErrorBoundary
          componentName={title}
          onRetry={onRetry}
          fallback={fallback}
        >
          {children}
        </ApiErrorBoundary>
      );
    
    case 'pos':
      return (
        <PosErrorBoundary onRetry={onRetry}>
          {children}
        </PosErrorBoundary>
      );
    
    default:
      return (
        <ErrorBoundary fallback={fallback}>
          {children}
        </ErrorBoundary>
      );
  }
};

export default withErrorBoundary;