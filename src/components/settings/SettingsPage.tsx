import React, { useState } from 'react';
import { 
  Box, 
  Tabs, 
  Tab, 
  Paper, 
  Typography, 
  Divider,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Settings as SettingsIcon, Cloud, Palette, Tune, Security, Extension, Payment, AccountBalance } from '@mui/icons-material';
import { useSettings } from '../../contexts/SettingsContext';
import ErpNextSettings from './ErpNextSettings';
import ThemeSettings from './ThemeSettings';
import UISettings from './UISettings';
import FeatureSettings from './FeatureSettings';
import PaymentSettings from '../payments/PaymentSettings';
import { CashCounterSettings as CashCounterSettingsComponent } from './CashCounterSettings';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`vertical-tabpanel-${index}`}
      aria-labelledby={`vertical-tab-${index}`}
      style={{
        width: '100%',
        padding: isMobile ? theme.spacing(2) : theme.spacing(4),
      }}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: isMobile ? 0 : 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `vertical-tab-${index}`,
    'aria-controls': `vertical-tabpanel-${index}`,
  };
}

const SettingsPage: React.FC = () => {
  const [value, setValue] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { settings } = useSettings();

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Paper 
      elevation={0} 
      sx={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        minHeight: 'calc(100vh - 64px)',
        borderRadius: 0,
      }}
    >
      <Tabs
        orientation={isMobile ? 'horizontal' : 'vertical'}
        variant="scrollable"
        value={value}
        onChange={handleChange}
        aria-label="Settings tabs"
        sx={{
          borderRight: isMobile ? 'none' : 1,
          borderBottom: isMobile ? 1 : 'none',
          borderColor: 'divider',
          minWidth: isMobile ? '100%' : 200,
          bgcolor: 'background.paper',
        }}
      >
        <Tab 
          icon={<SettingsIcon />} 
          iconPosition="start" 
          label="General" 
          {...a11yProps(0)} 
          sx={{ justifyContent: 'flex-start' }}
        />
        <Tab 
          icon={<Cloud />} 
          iconPosition="start" 
          label="ERPNext" 
          {...a11yProps(1)} 
          sx={{ justifyContent: 'flex-start' }}
        />
        <Tab 
          icon={<Palette />} 
          iconPosition="start" 
          label="Theme" 
          {...a11yProps(2)} 
          sx={{ justifyContent: 'flex-start' }}
        />
        <Tab 
          icon={<Tune />} 
          iconPosition="start" 
          label="UI" 
          {...a11yProps(3)} 
          sx={{ justifyContent: 'flex-start' }}
        />
        <Tab 
          icon={<Extension />} 
          iconPosition="start" 
          label="Features" 
          {...a11yProps(4)} 
          sx={{ justifyContent: 'flex-start' }}
        />
        <Tab 
          icon={<Payment />} 
          iconPosition="start" 
          label="Payments" 
          {...a11yProps(5)} 
          sx={{ justifyContent: 'flex-start' }}
        />
        <Tab 
          icon={<AccountBalance />} 
          iconPosition="start" 
          label="Cash Counter" 
          {...a11yProps(6)} 
          sx={{ justifyContent: 'flex-start' }}
        />
      </Tabs>

      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        <TabPanel value={value} index={0}>
          <Typography variant="h5" gutterBottom>
            General Settings
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body1">
            Application version: {settings.version}
          </Typography>
          {/* Add more general settings here */}
        </TabPanel>

        <TabPanel value={value} index={1}>
          <ErpNextSettings />
        </TabPanel>

        <TabPanel value={value} index={2}>
          <ThemeSettings />
        </TabPanel>

        <TabPanel value={value} index={3}>
          <UISettings />
        </TabPanel>
        
        <TabPanel value={value} index={4}>
          <FeatureSettings />
        </TabPanel>

        <TabPanel value={value} index={5}>
          <PaymentSettings onSave={(settings) => console.log('Payment settings saved:', settings)} />
        </TabPanel>

        <TabPanel value={value} index={6}>
          <CashCounterSettingsComponent />
        </TabPanel>
      </Box>
    </Paper>
  );
};

export default SettingsPage;
