
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught error:', error);
    console.error('Error info:', errorInfo);
    console.error('Error stack:', error.stack);
  }

  public render() {
    if (this.state.hasError) {
      console.error('ErrorBoundary rendering error state:', this.state.error);
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#1e293b',
          color: 'white',
          padding: '2rem'
        }}>
          <div style={{ textAlign: 'center', maxWidth: '600px' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>
              Something went wrong
            </h1>
            <p style={{ marginBottom: '1rem', color: '#cbd5e1' }}>
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <pre style={{
              background: '#0f172a',
              padding: '1rem',
              borderRadius: '0.5rem',
              textAlign: 'left',
              overflow: 'auto',
              marginBottom: '1rem',
              fontSize: '0.875rem'
            }}>
              {this.state.error?.stack}
            </pre>
            <button
              style={{
                background: '#8b5cf6',
                color: 'white',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
              onClick={() => {
                console.log('Resetting error boundary');
                this.setState({ hasError: false, error: undefined });
              }}
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    console.log('ErrorBoundary rendering children');
    return this.props.children;
  }
}

// Default export for compatibility
export default ErrorBoundary;
