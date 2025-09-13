import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Switch, 
  FormGroup, 
  FormControlLabel, 
  Paper, 
  Button, 
  Divider, 
  Alert, 
  Snackbar,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Card,
  CardHeader,
  CardContent,
  CircularProgress
} from '@mui/material';
import { useSettings } from '../../contexts/SettingsContext';
import { Security as SecurityIcon, Update as UpdateIcon } from '@mui/icons-material';

const FeatureSettings: React.FC = () => {
  const { 
    settings, 
    toggleFeature, 
    getAvailableFeatures,
    upgradeSettings
  } = useSettings();
  
  const [availableFeatures, setAvailableFeatures] = useState<string[]>([]);
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [upgradeStatus, setUpgradeStatus] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error' | 'info' | 'warning';
  }>({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    setAvailableFeatures(getAvailableFeatures());
  }, [getAvailableFeatures]);

  const handleToggleFeature = (feature: string, enabled: boolean) => {
    toggleFeature(feature, enabled);
  };

  const handleUpgradeSettings = async () => {
    setIsUpgrading(true);
    try {
      const upgraded = await upgradeSettings();
      if (upgraded) {
        setUpgradeStatus({
          open: true,
          message: 'Settings upgraded successfully!',
          severity: 'success'
        });
        // Refresh available features after upgrade
        setAvailableFeatures(getAvailableFeatures());
      } else {
        setUpgradeStatus({
          open: true,
          message: 'Settings are already up to date.',
          severity: 'info'
        });
      }
    } catch (error) {
      console.error('Upgrade failed:', error);
      setUpgradeStatus({
        open: true,
        message: 'Failed to upgrade settings. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleCloseSnackbar = () => {
    setUpgradeStatus(prev => ({ ...prev, open: false }));
  };

  const formatFeatureName = (feature: string) => {
    return feature
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim();
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Card>
        <CardHeader 
          title="Feature Management" 
          subheader="Enable or disable application features"
          avatar={<SecurityIcon color="primary" />}
        />
        <Divider />
        <CardContent>
          <Typography variant="body1" paragraph>
            Current version: <strong>{settings.version}</strong>
            {settings.lastUpgraded && (
              <Typography variant="caption" display="block" color="text.secondary">
                Last updated: {new Date(settings.lastUpgraded).toLocaleString()}
              </Typography>
            )}
          </Typography>

          <Button
            variant="contained"
            color="primary"
            startIcon={isUpgrading ? <CircularProgress size={20} /> : <UpdateIcon />}
            onClick={handleUpgradeSettings}
            disabled={isUpgrading}
            sx={{ mb: 3 }}
          >
            {isUpgrading ? 'Upgrading...' : 'Check for Updates'}
          </Button>

          <Typography variant="h6" gutterBottom>
            Available Features
          </Typography>
          
          <Paper variant="outlined" sx={{ mb: 3 }}>
            <List>
              {availableFeatures.map((feature) => (
                <React.Fragment key={feature}>
                  <ListItem>
                    <ListItemText 
                      primary={formatFeatureName(feature)}
                      secondary={settings.features?.[feature] ? 'Enabled' : 'Disabled'}
                    />
                    <ListItemSecondaryAction>
                      <FormGroup>
                        <FormControlLabel
                          control={
                            <Switch
                              edge="end"
                              checked={!!(settings.features && settings.features[feature])}
                              onChange={(e) => handleToggleFeature(feature, e.target.checked)}
                            />
                          }
                          label=""
                        />
                      </FormGroup>
                    </ListItemSecondaryAction>
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          </Paper>

          <Typography variant="body2" color="text.secondary">
            Note: Some features may require a page refresh to take effect.
          </Typography>
        </CardContent>
      </Card>

      <Snackbar
        open={upgradeStatus.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={upgradeStatus.severity}
          sx={{ width: '100%' }}
        >
          {upgradeStatus.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FeatureSettings;
