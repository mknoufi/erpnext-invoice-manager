import React, { useState, useEffect } from 'react';
import {
  Box,
  Alert,
  Snackbar,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  WifiOff as OfflineIcon,
  Wifi as OnlineIcon,
  Sync as SyncIcon,
  Cached as CachedIcon,
} from '@mui/icons-material';
import { pwaService } from '../utils/pwaService';

const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineAlert, setShowOfflineAlert] = useState(false);
  const [showOnlineAlert, setShowOnlineAlert] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [cacheSize, setCacheSize] = useState(0);

  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = pwaService.getOnlineStatus();
      setIsOnline(online);

      if (!online && !showOfflineAlert) {
        setShowOfflineAlert(true);
        setShowOnlineAlert(false);
      } else if (online && !showOnlineAlert) {
        setShowOnlineAlert(true);
        setShowOfflineAlert(false);
        // Auto-sync when back online
        handleSync();
      }
    };

    const updateCacheSize = async () => {
      const size = await pwaService.getCacheSize();
      setCacheSize(size);
    };

    // Initial status
    updateOnlineStatus();
    updateCacheSize();

    // Set up event listeners
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Update cache size periodically
    const interval = setInterval(updateCacheSize, 30000); // Every 30 seconds

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      clearInterval(interval);
    };
  }, [showOfflineAlert, showOnlineAlert]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await pwaService.syncWhenOnline();
      // Simulate sync time
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error('Sync failed:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  const formatCacheSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <>
      {/* Offline Alert */}
      <Snackbar
        open={showOfflineAlert}
        autoHideDuration={6000}
        onClose={() => setShowOfflineAlert(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity="warning"
          icon={<OfflineIcon />}
          onClose={() => setShowOfflineAlert(false)}
          sx={{ width: '100%' }}
        >
          You are offline. Some features may be limited. Data will sync when back online.
        </Alert>
      </Snackbar>

      {/* Online Alert */}
      <Snackbar
        open={showOnlineAlert}
        autoHideDuration={3000}
        onClose={() => setShowOnlineAlert(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity="success"
          icon={<OnlineIcon />}
          onClose={() => setShowOnlineAlert(false)}
          sx={{ width: '100%' }}
        >
          You are back online! Data is being synchronized.
        </Alert>
      </Snackbar>

      {/* Status Indicator */}
      <Box
        sx={{
          position: 'fixed',
          top: 16,
          right: 16,
          zIndex: 1200,
          display: 'flex',
          gap: 1,
          alignItems: 'center',
        }}
      >
        {/* Online/Offline Status */}
        <Chip
          icon={isOnline ? <OnlineIcon /> : <OfflineIcon />}
          label={isOnline ? 'Online' : 'Offline'}
          color={isOnline ? 'success' : 'warning'}
          size="small"
          variant="outlined"
        />

        {/* Cache Size Indicator */}
        <Chip
          icon={<CachedIcon />}
          label={formatCacheSize(cacheSize)}
          color="info"
          size="small"
          variant="outlined"
        />

        {/* Sync Button */}
        {isOnline && (
          <Tooltip title="Sync data">
            <IconButton
              size="small"
              onClick={handleSync}
              disabled={isSyncing}
              sx={{
                bgcolor: 'primary.main',
                color: 'white',
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
                '&:disabled': {
                  bgcolor: 'grey.300',
                },
              }}
            >
              {isSyncing ? (
                <LinearProgress
                  sx={{
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                  }}
                />
              ) : (
                <SyncIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </>
  );
};

export default OfflineIndicator;
