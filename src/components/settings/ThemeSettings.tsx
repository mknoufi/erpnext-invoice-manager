import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Divider, 
  Paper, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  SelectChangeEvent, 
  InputAdornment
} from '@mui/material';
import GridContainer from '../common/GridContainer';
import GridItem from '../common/GridItem';
import { ColorLens, Brightness4, Brightness7, Save, Refresh } from '@mui/icons-material';
import { ChromePicker, ColorResult } from 'react-color';
import { useSettings } from '../../contexts/SettingsContext';

const fontOptions = [
  { label: 'Roboto', value: '"Roboto", "Helvetica", "Arial", sans-serif' },
  { label: 'Open Sans', value: '"Open Sans", sans-serif' },
  { label: 'Lato', value: '"Lato", sans-serif' },
  { label: 'Montserrat', value: '"Montserrat", sans-serif' },
  { label: 'Poppins', value: '"Poppins", sans-serif' },
  { label: 'Nunito', value: '"Nunito", sans-serif' },
];

const ThemeSettings: React.FC = () => {
  const { settings, saveSettings } = useSettings();
  const [showPrimaryPicker, setShowPrimaryPicker] = useState(false);
  const [showSecondaryPicker, setShowSecondaryPicker] = useState(false);
  const [localTheme, setLocalTheme] = useState(settings.theme);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocalTheme(prev => ({
      ...prev,
      [name]: name === 'borderRadius' || name === 'spacing' ? Number(value) : value,
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setLocalTheme(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleColorChange = (color: ColorResult, field: 'primaryColor' | 'secondaryColor') => {
    setLocalTheme(prev => ({
      ...prev,
      [field]: color.hex,
    }));
  };

  const toggleThemeMode = () => {
    setLocalTheme(prev => ({
      ...prev,
      mode: prev.mode === 'light' ? 'dark' : 'light',
    }));
  };

  const handleSave = () => {
    saveSettings({
      theme: localTheme,
    });
  };

  const resetToDefault = () => {
    setLocalTheme(settings.theme);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Theme Settings
      </Typography>
      <Typography variant="body2" color="textSecondary" paragraph>
        Customize the appearance of the application
      </Typography>
      <Divider sx={{ my: 2 }} />

      <GridContainer spacing={3}>
        <GridItem xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Typography variant="subtitle1" gutterBottom>
              Color Scheme
            </Typography>
            
            <Box display="flex" alignItems="center" mb={2}>
              <Typography variant="body2" sx={{ minWidth: 120 }}>
                Theme Mode:
              </Typography>
              <Button
                variant="outlined"
                onClick={toggleThemeMode}
                startIcon={localTheme.mode === 'dark' ? <Brightness7 /> : <Brightness4 />}
                sx={{ ml: 2 }}
              >
                {localTheme.mode === 'dark' ? 'Dark' : 'Light'} Mode
              </Button>
            </Box>

            <Box mb={2}>
              <Typography variant="body2" gutterBottom>
                Primary Color:
              </Typography>
              <Box display="flex" alignItems="center">
                <Box
                  onClick={() => setShowPrimaryPicker(!showPrimaryPicker)}
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '4px',
                    backgroundColor: localTheme.primaryColor,
                    border: '1px solid',
                    borderColor: 'divider',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                  }}
                >
                  <ColorLens sx={{ color: 'white' }} />
                </Box>
                <TextField
                  size="small"
                  value={localTheme.primaryColor}
                  onChange={handleChange}
                  name="primaryColor"
                  sx={{ flexGrow: 1 }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">#</InputAdornment>,
                  }}
                />
              </Box>
              {showPrimaryPicker && (
                <Box mt={1} mb={2}>
                  <ChromePicker
                    color={localTheme.primaryColor}
                    onChangeComplete={(color) => handleColorChange(color, 'primaryColor')}
                  />
                </Box>
              )}
            </Box>

            <Box>
              <Typography variant="body2" gutterBottom>
                Secondary Color:
              </Typography>
              <Box display="flex" alignItems="center">
                <Box
                  onClick={() => setShowSecondaryPicker(!showSecondaryPicker)}
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '4px',
                    backgroundColor: localTheme.secondaryColor,
                    border: '1px solid',
                    borderColor: 'divider',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 2,
                  }}
                >
                  <ColorLens sx={{ color: 'white' }} />
                </Box>
                <TextField
                  size="small"
                  value={localTheme.secondaryColor}
                  onChange={handleChange}
                  name="secondaryColor"
                  sx={{ flexGrow: 1 }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">#</InputAdornment>,
                  }}
                />
              </Box>
              {showSecondaryPicker && (
                <Box mt={1}>
                  <ChromePicker
                    color={localTheme.secondaryColor}
                    onChangeComplete={(color) => handleColorChange(color, 'secondaryColor')}
                  />
                </Box>
              )}
            </Box>
          </Paper>
        </GridItem>

        <GridItem xs={12} md={6}>
          <Paper variant="outlined" sx={{ p: 2, mb: 3, height: '100%' }}>
            <Typography variant="subtitle1" gutterBottom>
              Typography & Spacing
            </Typography>

            <FormControl fullWidth margin="normal" size="small">
              <InputLabel>Font Family</InputLabel>
              <Select
                name="fontFamily"
                value={localTheme.fontFamily}
                onChange={handleSelectChange}
                label="Font Family"
              >
                {fontOptions.map((font) => (
                  <MenuItem key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                    {font.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              fullWidth
              margin="normal"
              label="Border Radius (px)"
              name="borderRadius"
              type="number"
              value={localTheme.borderRadius}
              onChange={handleChange}
              size="small"
              inputProps={{ min: 0, max: 24 }}
            />

            <TextField
              fullWidth
              margin="normal"
              label="Spacing Unit (px)"
              name="spacing"
              type="number"
              value={localTheme.spacing}
              onChange={handleChange}
              size="small"
              inputProps={{ min: 4, max: 12, step: 1 }}
            />
          </Paper>
        </GridItem>

        <GridItem xs={12}>
          <Box display="flex" justifyContent="space-between" mt={2}>
            <Button
              variant="outlined"
              onClick={resetToDefault}
              startIcon={<Refresh />}
            >
              Reset to Default
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
              startIcon={<Save />}
            >
              Save Theme
            </Button>
          </Box>
        </GridItem>
      </GridContainer>
    </Box>
  );
};

export default ThemeSettings;
