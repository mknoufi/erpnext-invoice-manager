import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Divider, 
  Paper, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  SelectChangeEvent, 
  Switch, 
  FormControlLabel, 
  Button, 
  TextField, 
  Grid as MuiGrid 
} from '@mui/material';
import GridContainer from '../common/GridContainer';
import GridItem from '../common/GridItem';
import { Save, ViewList, Notifications, Style } from '@mui/icons-material';
import { useSettings } from '../../contexts/SettingsContext';
import { UISettings as UISettingsType } from '../../types/settings';

const UISettings: React.FC = () => {
  const { settings, saveSettings } = useSettings();
  const [uiSettings, setUiSettings] = useState<UISettingsType>(settings.ui);

  useEffect(() => {
    setUiSettings(settings.ui);
  }, [settings.ui]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setUiSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setUiSettings((prev: UISettingsType) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    saveSettings({
      ui: uiSettings,
    });
  };

  const resetToDefault = () => {
    setUiSettings(settings.ui);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        UI Settings
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Customize the user interface and behavior
      </Typography>
      <Divider sx={{ my: 2 }} />

      <GridContainer spacing={3}>
        <GridItem xs={12} sm={6}>
          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <ViewList sx={{ mr: 1 }} />
              <Typography variant="subtitle1">Display</Typography>
            </Box>
            
            <FormControl fullWidth margin="normal" size="small">
              <InputLabel>Density</InputLabel>
              <Select
                name="density"
                value={uiSettings.density}
                onChange={handleSelectChange}
                label="Density"
              >
                <MenuItem value="comfortable">Comfortable</MenuItem>
                <MenuItem value="cozy">Cozy</MenuItem>
                <MenuItem value="compact">Compact</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              margin="normal"
              label="Items per page"
              name="itemsPerPage"
              type="number"
              value={uiSettings.itemsPerPage}
              onChange={handleChange}
              size="small"
              inputProps={{ min: 5, max: 100 }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={uiSettings.showRecentItems}
                  onChange={handleChange}
                  name="showRecentItems"
                  color="primary"
                />
              }
              label="Show recent items"
              sx={{ mt: 1, display: 'block' }}
            />
          </Paper>
        </GridItem>

        <GridItem xs={12} sm={6}>
          <Paper variant="outlined" sx={{ p: 2, mb: 3, height: '100%' }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Notifications sx={{ mr: 1 }} />
              <Typography variant="subtitle1">Notifications</Typography>
            </Box>

            <FormControlLabel
              control={
                <Switch
                  checked={uiSettings.showNotifications}
                  onChange={handleChange}
                  name="showNotifications"
                  color="primary"
                />
              }
              label="Enable notifications"
              sx={{ mt: 1, display: 'block' }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={uiSettings.showNotifications}
                  onChange={handleChange}
                  name="showNotifications"
                  color="primary"
                  disabled={!uiSettings.showNotifications}
                />
              }
              label="Sound on notification"
              sx={{ mt: 1, display: 'block' }}
            />
          </Paper>

          <Paper variant="outlined" sx={{ p: 2 }}>
            <Box display="flex" alignItems="center" mb={2}>
              <Style sx={{ mr: 1 }} />
              <Typography variant="subtitle1">Preview</Typography>
            </Box>
            
            <Box 
              sx={{ 
                p: 2, 
                border: '1px solid', 
                borderColor: 'divider',
                borderRadius: 1,
                bgcolor: 'background.paper',
              }}
            >
              <Typography variant="body1" gutterBottom>
                This is a preview of how your UI will look with the current settings.
              </Typography>
              <Button variant="contained" color="primary" size="small" sx={{ mr: 1 }}>
                Primary Button
              </Button>
              <Button variant="outlined" color="primary" size="small">
                Secondary Button
              </Button>
            </Box>
          </Paper>
        </GridItem>

        <GridItem xs={12}>
          <Box display="flex" justifyContent="space-between" mt={2}>
            <Button
              variant="outlined"
              onClick={resetToDefault}
            >
              Reset to Default
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              startIcon={<Save />}
            >
              Save Settings
            </Button>
          </Box>
        </GridItem>
      </GridContainer>
    </Box>
  );
};

export default UISettings;
