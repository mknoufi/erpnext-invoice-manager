import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  Snackbar,
  Alert,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  GetApp as InstallIcon,
  Close as CloseIcon,
  WifiOff as OfflineIcon,
  Wifi as OnlineIcon,
  Cached as SyncIcon,
  Notifications as NotificationIcon,
} from '@mui/icons-material';
import { pwaService } from '../utils/pwaService';

interface PWAInstallPromptProps {
  onInstall?: () => void;
  onDismiss?: () => void;
}

const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({
  onInstall,
  onDismiss,
}) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [cacheSize, setCacheSize] = useState(0);
  const [showUpdateNotification, setShowUpdateNotification] = useState(false);

  useEffect(() => {
    // Check if PWA is installable
    const checkInstallability = () => {
      const isInstallable = pwaService.isInstallable();
      const hasSeenPrompt = localStorage.getItem('pwa-install-prompt-dismissed');
      
      if (isInstallable && !hasSeenPrompt) {
        setShowPrompt(true);
      }
    };

    // Check online status
    const updateOnlineStatus = () => {
      setIsOnline(pwaService.getOnlineStatus());
    };

    // Check notification permission
    const checkNotificationPermission = () => {
      setNotificationPermission(Notification.permission);
    };

    // Get cache size
    const updateCacheSize = async () => {
      const size = await pwaService.getCacheSize();
      setCacheSize(size);
    };

    // Initial checks
    checkInstallability();
    updateOnlineStatus();
    checkNotificationPermission();
    updateCacheSize();

    // Set up event listeners
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Check for updates every 5 minutes
    const updateInterval = setInterval(updateCacheSize, 5 * 60 * 1000);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      clearInterval(updateInterval);
    };
  }, []);

  const handleInstall = async () => {
    setIsInstalling(true);
    try {
      const success = await pwaService.showInstallPrompt();
      if (success) {
        setShowPrompt(false);
        onInstall?.();
        localStorage.setItem('pwa-install-prompt-dismissed', 'true');
      }
    } catch (error) {
      console.error('Installation failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-prompt-dismissed', 'true');
    onDismiss?.();
  };

  const handleRequestNotifications = async () => {
    const granted = await pwaService.requestNotificationPermission();
    if (granted) {
      setNotificationPermission('granted');
      await pwaService.sendNotification('Notifications enabled!', {
        body: 'You will now receive important updates about your invoices.',
      });
    }
  };

  const formatCacheSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!showPrompt) {
    return null;
  }

  return (
    <>
      <Card
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          maxWidth: 400,
          zIndex: 1300,
          boxShadow: 4,
          borderRadius: 2,
        }}
      >
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <InstallIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Install App
            </Typography>
            <IconButton size="small" onClick={handleDismiss}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Install the Invoice Manager app for a better experience with offline access and notifications.
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Chip
              icon={isOnline ? <OnlineIcon /> : <OfflineIcon />}
              label={isOnline ? 'Online' : 'Offline'}
              color={isOnline ? 'success' : 'warning'}
              size="small"
            />
            <Chip
              icon={<NotificationIcon />}
              label={`Notifications: ${notificationPermission}`}
              color={notificationPermission === 'granted' ? 'success' : 'default'}
              size="small"
            />
            <Chip
              icon={<SyncIcon />}
              label={`Cache: ${formatCacheSize(cacheSize)}`}
              color="info"
              size="small"
            />
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              startIcon={<InstallIcon />}
              onClick={handleInstall}
              disabled={isInstalling}
              sx={{ flexGrow: 1 }}
            >
              {isInstalling ? (
                <>
                  <LinearProgress sx={{ width: 20, mr: 1 }} />
                  Installing...
                </>
              ) : (
                'Install'
              )}
            </Button>
            <Button
              variant="outlined"
              onClick={handleDismiss}
              disabled={isInstalling}
            >
              Later
            </Button>
          </Box>

          {notificationPermission !== 'granted' && (
            <Button
              variant="text"
              size="small"
              onClick={handleRequestNotifications}
              sx={{ mt: 1, width: '100%' }}
            >
              Enable Notifications
            </Button>
          )}
        </CardContent>
      </Card>

      <Snackbar
        open={showUpdateNotification}
        autoHideDuration={6000}
        onClose={() => setShowUpdateNotification(false)}
      >
        <Alert
          onClose={() => setShowUpdateNotification(false)}
          severity="info"
          sx={{ width: '100%' }}
        >
          App update available! Refresh to get the latest features.
        </Alert>
      </Snackbar>
    </>
  );
};

export default PWAInstallPrompt;
