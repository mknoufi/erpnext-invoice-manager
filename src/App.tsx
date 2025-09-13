import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { NotificationProvider } from './components/NotificationSystem';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  IconButton, 
  Tooltip, 
  CircularProgress,
  CssBaseline,
  ThemeProvider,
  createTheme
} from '@mui/material';
import { 
  Settings as SettingsIcon, 
  Home as HomeIcon, 
  Lock as LockIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';

// Contexts
import { SettingsProvider } from './contexts/SettingsContext';
import { SecurityProvider, useSecurity } from './contexts/SecurityContext';

// Components
import ErrorBoundary from './components/ErrorBoundary';
import InvoiceList from './components/InvoiceList';
import SettingsPage from './components/settings/SettingsPage';
import LoginPage from './pages/LoginPage';
import Verify2FAPage from './pages/Verify2FAPage';
import AuditLog from './components/security/AuditLog';
import UnauthorizedPage from './pages/UnauthorizedPage';
import TwoFactorAuthSetup from './components/security/TwoFactorAuthSetup';
import { CashierProvider } from './contexts/CashierContext';
import CashierLogin from './pages/CashierLogin';
import CashierDashboard from './pages/CashierDashboard';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import OfflineIndicator from './components/OfflineIndicator';
import AnalyticsDashboard from './components/analytics/AnalyticsDashboard';
import { pwaService } from './utils/pwaService';
import logger from './utils/logger';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

// Create a client
const queryClient = new QueryClient();

// Navigation component
const Navigation = () => {
  const location = useLocation();
  const { state, logout, hasPermission } = useSecurity();
  const [show2FASetup, setShow2FASetup] = useState(false);
  
  const isActive = (path: string) => location.pathname === path;
  const isAuthenticated = state.isAuthenticated && !state.is2FAPending;
  
  const handleLogout = () => {
    logout();
  };

  return (
    <AppBar position="static" color="default" elevation={1}>
      <Toolbar>
        <Typography 
          variant="h6" 
          component={Link} 
          to="/" 
          sx={{ 
            flexGrow: 1, 
            textDecoration: 'none',
            color: 'inherit',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <SecurityIcon />
          <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
            Invoice Manager
          </Box>
        </Typography>
        
        {isAuthenticated ? (
          <>
            <Button 
              color={isActive('/') ? 'primary' : 'inherit'}
              component={Link} 
              to="/" 
              startIcon={<HomeIcon />}
            >
              Home
            </Button>
            
            <Button
              color={isActive('/analytics') ? 'primary' : 'inherit'}
              component={Link}
              to="/analytics"
              startIcon={<AnalyticsIcon />}
            >
              Analytics
            </Button>
            
            {hasPermission('canViewAuditLogs') && (
              <Button
                color={isActive('/audit-logs') ? 'primary' : 'inherit'}
                component={Link}
                to="/audit-logs"
                startIcon={<SecurityIcon />}
              >
                Audit Logs
              </Button>
            )}
            
            <Button
              color={isActive('/settings') ? 'primary' : 'inherit'}
              component={Link}
              to="/settings"
              startIcon={<SettingsIcon />}
            >
              Settings
            </Button>
            
            <Tooltip title="Account">
              <IconButton 
                color="inherit" 
                component={Link} 
                to="/account" 
                sx={{ ml: 1 }}
              >
                <PersonIcon />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Logout">
              <IconButton 
                color="inherit" 
                onClick={handleLogout}
                sx={{ ml: 1 }}
              >
                <LogoutIcon />
              </IconButton>
            </Tooltip>
            
            {state.user?.is2FAEnabled === false && (
              <Button
                variant="outlined"
                color="warning"
                size="small"
                onClick={() => setShow2FASetup(true)}
                sx={{ ml: 2 }}
                startIcon={<LockIcon />}
              >
                Enable 2FA
              </Button>
            )}
            
            <TwoFactorAuthSetup 
              open={show2FASetup} 
              onClose={() => setShow2FASetup(false)} 
            />
          </>
        ) : (
          <Button 
            color="inherit" 
            component={Link} 
            to="/login" 
            startIcon={<LockIcon />}
          >
            Login
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

// Protected Layout Component
const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  const { state } = useSecurity();
  
  if (!state.isInitialized) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (state.is2FAPending) {
    return <Navigate to="/verify-2fa" replace />;
  }
  
  if (!state.isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Main App component
const AppContent = () => {
  return (
    <ErrorBoundary>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <Navigation />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/verify-2fa" element={<Verify2FAPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
            
            {/* Protected routes */}
            <Route path="/" element={
              <ProtectedLayout>
                <InvoiceList />
              </ProtectedLayout>
            } />
            <Route path="/settings" element={
              <ProtectedLayout>
                <SettingsPage />
              </ProtectedLayout>
            } />
            <Route path="/audit-logs" element={
              <ProtectedLayout>
                <AuditLog />
              </ProtectedLayout>
            } />
            <Route path="/analytics" element={
              <ProtectedLayout>
                <AnalyticsDashboard />
              </ProtectedLayout>
            } />
            <Route path="/account" element={
              <ProtectedLayout>
                <div>Account Settings</div>
              </ProtectedLayout>
            } />
            <Route path="/cashier-login" element={
              <CashierProvider>
                <CashierLogin />
              </CashierProvider>
            } />
            <Route path="/cashier" element={
              <CashierProvider>
                <CashierDashboard />
              </CashierProvider>
            } />
            
            {/* Catch-all route */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Box>
      </Box>
    </ErrorBoundary>
  );
};

// Main App component with providers
const App = () => {
  // Initialize PWA service
  React.useEffect(() => {
    const initializePWA = async () => {
      try {
        await pwaService.registerServiceWorker();
        await pwaService.requestNotificationPermission();
        logger.info('PWA initialized successfully');
      } catch (error) {
        console.error('PWA initialization failed:', error);
      }
    };

    initializePWA();
  }, []);

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <SettingsProvider>
              <SecurityProvider>
                <NotificationProvider>
                  <AppContent />
                  <PWAInstallPrompt />
                  <OfflineIndicator />
                </NotificationProvider>
              </SecurityProvider>
            </SettingsProvider>
          </LocalizationProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
