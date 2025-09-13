import React, { useState, useEffect } from 'react';
import ErpNextSettingsForm from './ErpNextSettingsNew';
import { ErpNextSettings } from '../../types/erpnext-settings';
import './ErpNextSettings.css';
// Simple notification system
const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
};

// Default settings
const defaultSettings: ErpNextSettings = {
  // Connection
  url: '',
  apiKey: '',
  apiSecret: '',
  company: '',
  version: '14.0.0',
  
  // Authentication
  authMethod: 'api_key',
  
  // Sync settings
  syncDirection: 'bidirectional',
  syncSchedule: {
    enabled: true,
    interval: 60, // minutes
    startTime: '00:00',
    endTime: '23:59',
    timezone: 'UTC'
  },
  conflictResolution: 'source',
  fieldMappings: [],
  fieldGroups: [],
  
  // Webhook
  webhook: {
    enabled: false,
    url: '',
    events: []
  },
  
  // API Config
  apiConfig: {
    basePath: '/api/resource',
    version: '1.0',
    timeout: 30000,
    retryPolicy: {
      maxRetries: 3,
      retryDelay: 1000,
      backoffFactor: 2
    },
    rateLimiting: {
      enabled: true,
      requestsPerMinute: 300,
      throttleDelay: 1000
    },
    compression: true,
    keepAlive: true
  },
  
  // Security
  security: {
    verifySSL: true,
    enableCORS: true,
    allowedOrigins: ['*'],
    enableCSRF: true,
    dataEncryption: {
      enabled: true,
      algorithm: 'aes-256-gcm',
      keyRotationDays: 90
    },
    ipWhitelist: [],
    userAgentFiltering: false
  },
  
  // Performance
  performance: {
    enableQueryOptimization: true,
    enableCompression: true,
    maxConcurrentRequests: 100,
    requestTimeout: 30000,
    cacheStrategy: 'memory',
    batchProcessing: {
      enabled: true,
      size: 100,
      delay: 1000
    }
  },
  
  // Monitoring
  monitoring: {
    enableHealthChecks: true,
    healthCheckInterval: 300,
    enableMetrics: true,
    metricsEndpoint: '/metrics',
    enableAlerting: true,
    alertThresholds: {
      errorRate: 5,
      responseTime: 5000,
      queueSize: 1000
    }
  },
  
  // Logging
  logging: {
    level: 'info',
    enableRequestLogging: true,
    enableAuditLogging: true,
    logRetentionDays: 30,
    logFormat: 'json',
    logToConsole: true,
    logToFile: true,
    logFilePath: './logs/erpnext-integration.log'
  },
  
  // Caching
  caching: {
    enabled: true,
    provider: 'memory',
    ttl: 3600,
    namespaced: true,
    namespace: 'erpnext',
    encryption: true,
    compression: true
  },
  
  // Error handling
  errorHandling: {
    autoRetryFailed: true,
    maxRetryAttempts: 3,
    retryDelay: 5,
    notifyOnFailure: true,
    notificationChannels: ['email'],
    notificationEmail: 'admin@example.com'
  },
  
  // Advanced
  advanced: {
    enableDebugMode: false,
    enableProfiling: false,
    enableQueryLogging: false,
    enablePerformanceMetrics: true,
    customHeaders: {},
    customParameters: {},
    plugins: [],
    featureFlags: {}
  },
  
  // Metadata
  metadata: {
    createdAt: new Date(),
    updatedAt: new Date(),
    createdBy: 'system',
    updatedBy: 'system',
    version: '1.0.0',
    tags: ['erpnext', 'integration']
  }
};

const ErpNextSettingsWrapper: React.FC = () => {
  const [settings, setSettings] = useState<ErpNextSettings>(defaultSettings);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setIsLoading(true);
        // TODO: Replace with actual API call to fetch settings
        // const response = await fetch('/api/erpnext/settings');
        // const data = await response.json();
        // setSettings(data);
        
        // Simulate API call
        setTimeout(() => {
          // Try to load from localStorage for demo purposes
          const savedSettings = localStorage.getItem('erpnextSettings');
          if (savedSettings) {
            setSettings(JSON.parse(savedSettings));
          } else {
            setSettings(defaultSettings);
          }
          setIsLoading(false);
        }, 500);
      } catch (err) {
        console.error('Failed to load settings:', err);
        setError('Failed to load settings. Please try again.');
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleSave = async (updatedSettings: ErpNextSettings) => {
    try {
      setIsLoading(true);
      
      // TODO: Replace with actual API call to save settings
      // const response = await fetch('/api/erpnext/settings', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(updatedSettings)
      // });
      // if (!response.ok) throw new Error('Failed to save settings');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo, save to localStorage
      localStorage.setItem('erpnextSettings', JSON.stringify(updatedSettings));
      
      setSettings(updatedSettings);
      setIsEditing(false);
      showNotification('Settings saved successfully!', 'success');
    } catch (err) {
      console.error('Failed to save settings:', err);
      showNotification('Failed to save settings. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };
  
  const handleEdit = () => {
    setError(null);
    setIsEditing(true);
  };

  // Format date for display
  const formatDate = (date: Date | undefined) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleString();
  };

  if (isLoading && !isEditing) {
    return (
      <div className="erpnext-settings-wrapper">
        <div className="loading-spinner">Loading settings...</div>
      </div>
    );
  }

  if (error && !isEditing) {
    return (
      <div className="erpnext-settings-wrapper">
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="btn btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="erpnext-settings-wrapper">
      <div className="settings-header">
        <h1>ERPNext Integration Settings</h1>
        {!isEditing && (
          <button 
            onClick={handleEdit}
            className="btn btn-primary"
            disabled={isLoading}
          >
            {isLoading ? 'Loading...' : 'Edit Settings'}
          </button>
        )}
      </div>

      {isEditing ? (
        <ErpNextSettingsForm 
          settings={settings}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      ) : (
        <div className="settings-view">
          <div className="settings-section">
            <h3>Connection</h3>
            <div className="setting-row">
              <span className="setting-label">URL:</span>
              <span className="setting-value">{settings.url || 'Not set'}</span>
            </div>
            <div className="setting-row">
              <span className="setting-label">Company:</span>
              <span className="setting-value">{settings.company || 'Not set'}</span>
            </div>
            <div className="setting-row">
              <span className="setting-label">Version:</span>
              <span className="setting-value">{settings.version}</span>
            </div>
          </div>
          
          <div className="settings-section">
            <h3>Sync Settings</h3>
            <div className="setting-row">
              <span className="setting-label">Sync Direction:</span>
              <span className="setting-value">
                {settings.syncDirection === 'erpnext_to_app' ? 'ERPNext to App' :
                 settings.syncDirection === 'app_to_erpnext' ? 'App to ERPNext' :
                 'Bidirectional'}
              </span>
            </div>
            <div className="setting-row">
              <span className="setting-label">Sync Schedule:</span>
              <span className="setting-value">
                {settings.syncSchedule.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            {settings.syncSchedule.enabled && (
              <div className="nested-settings">
                <div className="setting-row">
                  <span className="setting-label">- Interval:</span>
                  <span className="setting-value">
                    Every {settings.syncSchedule.interval} minutes
                  </span>
                </div>
                <div className="setting-row">
                  <span className="setting-label">- Active Hours:</span>
                  <span className="setting-value">
                    {settings.syncSchedule.startTime} - {settings.syncSchedule.endTime} ({settings.syncSchedule.timezone})
                  </span>
                </div>
              </div>
            )}
            <div className="setting-row">
              <span className="setting-label">Conflict Resolution:</span>
              <span className="setting-value">
                {settings.conflictResolution === 'source' ? 'Source Wins' :
                 settings.conflictResolution === 'target' ? 'Target Wins' :
                 settings.conflictResolution === 'manual' ? 'Manual Resolution' : 'Custom Logic'}
              </span>
            </div>
          </div>
          
          <div className="settings-section">
            <h3>Status</h3>
            <div className="setting-row">
              <span className="setting-label">Last Sync:</span>
              <span className="setting-value">
                {formatDate(settings.syncSchedule.lastSync)}
              </span>
            </div>
            <div className="setting-row">
              <span className="setting-label">Status:</span>
              <span className="setting-value status-badge">
                {settings.syncSchedule.lastStatus || 'Unknown'}
              </span>
            </div>
          </div>
          
          <div className="settings-section">
            <h3>Security</h3>
            <div className="setting-row">
              <span className="setting-label">SSL Verification:</span>
              <span className="setting-value">
                {settings.security.verifySSL ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="setting-row">
              <span className="setting-label">CORS:</span>
              <span className="setting-value">
                {settings.security.enableCORS ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="setting-row">
              <span className="setting-label">Data Encryption:</span>
              <span className="setting-value">
                {settings.security.dataEncryption.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ErpNextSettingsWrapper;
