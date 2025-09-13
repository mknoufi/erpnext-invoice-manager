import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate, Outlet } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
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
  Security as SecurityIcon
} from '@mui/icons-material';

// Contexts
import { SettingsProvider } from './contexts/SettingsContext';
import { SecurityProvider, useSecurity } from './contexts/SecurityContext';

// Components
import InvoiceList from './components/InvoiceList';
import SettingsPage from './components/settings/SettingsPage';
import LoginPage from './pages/LoginPage';
import Verify2FAPage from './pages/Verify2FAPage';
import AuditLog from './components/security/AuditLog';
import UnauthorizedPage from './pages/UnauthorizedPage';
import TwoFactorAuthSetup from './components/security/TwoFactorAuthSetup';

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
    <>
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
            <Route element={
              <ProtectedLayout>
                <Routes>
                  <Route path="/" element={<InvoiceList />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/audit-logs" element={<AuditLog />} />
                  <Route path="/account" element={<div>Account Settings</div>} />
                  
                  {/* Catch-all route for protected paths */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </ProtectedLayout>
            } />
            
            {/* Catch-all route for public paths */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Box>
      </Box>
    </>
  );
};

// Main App component with providers
const App = () => {
  return (
    <Router>
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <SettingsProvider>
              <SecurityProvider>
                <SnackbarProvider 
                  maxSnack={3}
                  anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                >
                  <AppContent />
                </SnackbarProvider>
              </SecurityProvider>
            </SettingsProvider>
          </LocalizationProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
