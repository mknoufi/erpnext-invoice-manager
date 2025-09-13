import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppSettings, ThemeSettings, FeatureFlags } from '../types/settings';

// Default feature flags
const defaultFeatureFlags: FeatureFlags = {
  advancedReporting: true,
  batchProcessing: true,
  apiAccess: true,
  auditLogs: true,
  notifications: true,
  darkMode: true,
  twoFactorAuth: true,
};

// Define available upgrades in order
const UPGRADE_PATHS: Record<string, (current: AppSettings) => AppSettings> = {
  '1.0.0': (current) => ({
    ...current,
    features: { ...defaultFeatureFlags, ...(current as any).features },
    version: '1.1.0',
    lastUpgraded: new Date().toISOString(),
  }),
  '1.1.0': (current) => current, // Add future upgrades here
};

// Default settings
const defaultSettings: AppSettings = {
  theme: {
    mode: 'light',
    primaryColor: '#1976d2',
    secondaryColor: '#dc004e',
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    borderRadius: 8,
    spacing: 4,
  },
  erpnext: {
    url: '',
    apiKey: '',
    apiSecret: '',
    company: '',
    defaultLedgers: [],
    syncInterval: 30000, // 30 seconds
  },
  ui: {
    density: 'comfortable',
    showNotifications: true,
    showRecentItems: true,
    itemsPerPage: 25,
  },
  features: { ...defaultFeatureFlags },
  version: '1.1.0',
  lastUpgraded: new Date().toISOString(),
};

// Load settings from localStorage
const loadSettings = (): AppSettings => {
  try {
    const savedSettings = localStorage.getItem('appSettings');
    const parsed = savedSettings ? JSON.parse(savedSettings) : defaultSettings;
    
    // Ensure features object exists
    if (!parsed.features) {
      parsed.features = { ...defaultFeatureFlags };
    }
    
    return parsed;
  } catch (error) {
    console.error('Failed to load settings:', error);
    return { ...defaultSettings };
  }
};

// Apply upgrades to settings
const applyUpgrades = (settings: AppSettings): AppSettings => {
  let current = { ...settings };
  const currentVersion = current.version || '1.0.0';
  let upgraded = false;
  
  // Sort versions and apply upgrades in order
  const versions = Object.keys(UPGRADE_PATHS)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  
  for (const version of versions) {
    if (currentVersion.localeCompare(version, undefined, { numeric: true }) < 0) {
      current = UPGRADE_PATHS[version](current);
      upgraded = true;
    }
  }
  
  if (upgraded) {
    current.lastUpgraded = new Date().toISOString();
  }
  
  return current;
};

// Context type
type SettingsContextType = {
  settings: AppSettings;
  saveSettings: (newSettings: Partial<AppSettings>) => void;
  resetSettings: () => void;
  upgradeSettings: (targetVersion?: string) => Promise<boolean>;
  toggleFeature: (feature: string, enabled: boolean) => boolean;
  isFeatureEnabled: (feature: string) => boolean;
  getAvailableFeatures: () => string[];
};

const SettingsContext = createContext<SettingsContextType>({
  settings: defaultSettings,
  saveSettings: () => {},
  resetSettings: () => {},
  upgradeSettings: async () => false,
  toggleFeature: () => false,
  isFeatureEnabled: () => false,
  getAvailableFeatures: () => [],
});

export const useSettings = () => useContext(SettingsContext);

type SettingsProviderProps = {
  children: ReactNode;
};

export const SettingsProvider: React.FC<SettingsProviderProps> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    const savedSettings = loadSettings();
    const mergedSettings = { ...defaultSettings, ...savedSettings };
    
    // Apply upgrades if needed
    if (savedSettings.version !== defaultSettings.version) {
      return applyUpgrades(mergedSettings);
    }
    
    return mergedSettings;
  });
  
  // Save settings to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('appSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, [settings]);
  
  const saveSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({
      ...prev,
      ...newSettings,
    }));
  }, []);
  
  const resetSettings = useCallback(() => {
    setSettings({ ...defaultSettings });
  }, []);
  
  const upgradeSettings = useCallback(async (targetVersion: string = defaultSettings.version): Promise<boolean> => {
    try {
      const upgradedSettings = applyUpgrades(settings);
      if (upgradedSettings.version !== settings.version) {
        saveSettings(upgradedSettings);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to upgrade settings:', error);
      return false;
    }
  }, [settings, saveSettings]);
  
  const toggleFeature = useCallback((feature: string, enabled: boolean): boolean => {
    if (settings.features && typeof settings.features[feature] !== 'undefined') {
      saveSettings({
        features: {
          ...settings.features,
          [feature]: enabled
        }
      });
      return true;
    }
    return false;
  }, [settings.features, saveSettings]);
  
  const isFeatureEnabled = useCallback((feature: string): boolean => {
    return !!(settings.features && settings.features[feature]);
  }, [settings.features]);
  
  const getAvailableFeatures = useCallback((): string[] => {
    return settings.features ? Object.keys(settings.features).sort() : [];
  }, [settings.features]);

  // Create theme based on settings
  const theme = createTheme({
    palette: {
      mode: settings.theme.mode === 'system' ? 'light' : settings.theme.mode,
      primary: {
        main: settings.theme.primaryColor,
      },
      secondary: {
        main: settings.theme.secondaryColor,
      },
      background: {
        default: settings.theme.mode === 'dark' ? '#121212' : '#f5f5f5',
        paper: settings.theme.mode === 'dark' ? '#1e1e1e' : '#ffffff',
      },
    },
    typography: {
      fontFamily: settings.theme.fontFamily,
    },
    shape: {
      borderRadius: settings.theme.borderRadius,
    },
    spacing: settings.theme.spacing,
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: settings.theme.borderRadius * 2,
          },
        },
      },
    },
  });

  return (
    <SettingsContext.Provider 
      value={{ 
        settings, 
        saveSettings, 
        resetSettings, 
        upgradeSettings,
        toggleFeature,
        isFeatureEnabled,
        getAvailableFeatures,
      }}
    >
      <MuiThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </SettingsContext.Provider>
  );
};

export default SettingsContext;
