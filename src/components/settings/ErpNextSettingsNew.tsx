import React, { useState, useEffect } from 'react';
import { 
  ErpNextSettings,
  SyncSchedule,
  WebhookConfig,
  ApiRateLimit,
  DataEncryption,
  PerformanceSettings,
  MonitoringSettings,
  FieldMapping
} from '../../types/erpnext-settings';

// Validation types
interface FormErrors {
  url?: string;
  apiKey?: string;
  apiSecret?: string;
  company?: string;
  [key: string]: string | undefined;
}

interface ErpNextSettingsFormProps {
  settings: ErpNextSettings;
  onSave: (settings: ErpNextSettings) => void;
  onCancel: () => void;
}

const ErpNextSettingsForm: React.FC<ErpNextSettingsFormProps> = ({
  settings,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState<ErpNextSettings>(settings);
  const [errors, setErrors] = useState<FormErrors>({});
  const [activeTab, setActiveTab] = useState('connection');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Connection validation
    if (!formData.url) {
      newErrors.url = 'URL is required';
    } else if (!/^https?:\/\//.test(formData.url)) {
      newErrors.url = 'URL must start with http:// or https://';
    }
    
    if (!formData.apiKey) {
      newErrors.apiKey = 'API Key is required';
    }
    
    if (!formData.company) {
      newErrors.company = 'Company name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof ErpNextSettings, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when field is edited
    if (errors[field as string]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };
  
  const handleNestedChange = (
    parent: keyof ErpNextSettings, 
    field: string, 
    value: any
  ) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...(prev[parent] as object),
        [field]: value
      }
    }));
  };

  const renderConnectionTab = () => (
    <div className="tab-content">
      <h3>Connection Settings</h3>
      <div className="form-group">
        <label>URL *</label>
        <input
          type="text"
          value={formData.url}
          onChange={(e) => handleChange('url', e.target.value)}
          placeholder="https://your-erpnext-instance.com"
          className={errors.url ? 'error' : ''}
        />
        {errors.url && <span className="error-message">{errors.url}</span>}
      </div>
      <div className="form-group">
        <label>API Key *</label>
        <input
          type="password"
          value={formData.apiKey}
          onChange={(e) => handleChange('apiKey', e.target.value)}
          placeholder="Your API Key"
          className={errors.apiKey ? 'error' : ''}
        />
        {errors.apiKey && <span className="error-message">{errors.apiKey}</span>}
      </div>
      <div className="form-group">
        <label>API Secret</label>
        <input
          type="password"
          value={formData.apiSecret}
          onChange={(e) => handleChange('apiSecret', e.target.value)}
          placeholder="Your API Secret"
        />
      </div>
      <div className="form-group">
        <label>Company *</label>
        <input
          type="text"
          value={formData.company}
          onChange={(e) => handleChange('company', e.target.value)}
          placeholder="Company Name"
          className={errors.company ? 'error' : ''}
        />
        {errors.company && <span className="error-message">{errors.company}</span>}
      </div>
      <div className="form-group">
        <label>Version</label>
        <select
          value={formData.version}
          onChange={(e) => handleChange('version', e.target.value)}
        >
          <option value="14.0.0">Version 14</option>
          <option value="13.0.0">Version 13</option>
          <option value="12.0.0">Version 12</option>
        </select>
      </div>
    </div>
  );

  const renderSyncTab = () => (
    <div className="tab-content">
      <h3>Sync Settings</h3>
      <div className="form-group">
        <label>Sync Direction</label>
        <select
          value={formData.syncDirection}
          onChange={(e) => handleChange('syncDirection', e.target.value as any)}
        >
          <option value="erpnext_to_app">ERPNext to App</option>
          <option value="app_to_erpnext">App to ERPNext</option>
          <option value="bidirectional">Bidirectional</option>
        </select>
      </div>
      
      <div className="form-group">
        <label>Sync Schedule</label>
        <div className="checkbox-group">
          <input
            type="checkbox"
            id="enableSync"
            checked={formData.syncSchedule.enabled}
            onChange={(e) => handleNestedChange('syncSchedule', 'enabled', e.target.checked)}
          />
          <label htmlFor="enableSync">Enable Scheduled Sync</label>
        </div>
      </div>
      
      {formData.syncSchedule.enabled && (
        <div className="nested-form">
          <div className="form-group">
            <label>Sync Interval (minutes)</label>
            <input
              type="number"
              min="1"
              value={formData.syncSchedule.interval}
              onChange={(e) => handleNestedChange('syncSchedule', 'interval', Number(e.target.value))}
            />
          </div>
          <div className="form-group">
            <label>Start Time</label>
            <input
              type="time"
              value={formData.syncSchedule.startTime}
              onChange={(e) => handleNestedChange('syncSchedule', 'startTime', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>End Time</label>
            <input
              type="time"
              value={formData.syncSchedule.endTime}
              onChange={(e) => handleNestedChange('syncSchedule', 'endTime', e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Timezone</label>
            <select
              value={formData.syncSchedule.timezone}
              onChange={(e) => handleNestedChange('syncSchedule', 'timezone', e.target.value)}
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern Time</option>
              <option value="America/Chicago">Central Time</option>
              <option value="America/Los_Angeles">Pacific Time</option>
            </select>
          </div>
        </div>
      )}
      
      <div className="form-group">
        <label>Conflict Resolution</label>
        <select
          value={formData.conflictResolution}
          onChange={(e) => handleChange('conflictResolution', e.target.value as any)}
        >
          <option value="source">Source Wins</option>
          <option value="target">Target Wins</option>
          <option value="manual">Manual Resolution</option>
          <option value="custom">Custom Logic</option>
        </select>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="tab-content">
      <h3>Security Settings</h3>
      <div className="form-group">
        <div className="checkbox-group">
          <input
            type="checkbox"
            id="verifySSL"
            checked={formData.security.verifySSL}
            onChange={(e) => handleNestedChange('security', 'verifySSL', e.target.checked)}
          />
          <label htmlFor="verifySSL">Verify SSL Certificate</label>
        </div>
      </div>
      
      <div className="form-group">
        <div className="checkbox-group">
          <input
            type="checkbox"
            id="enableCORS"
            checked={formData.security.enableCORS}
            onChange={(e) => handleNestedChange('security', 'enableCORS', e.target.checked)}
          />
          <label htmlFor="enableCORS">Enable CORS</label>
        </div>
      </div>
      
      {formData.security.enableCORS && (
        <div className="nested-form">
          <div className="form-group">
            <label>Allowed Origins</label>
            <input
              type="text"
              value={formData.security.allowedOrigins.join(', ')}
              onChange={(e) => handleNestedChange('security', 'allowedOrigins', e.target.value.split(',').map(s => s.trim()))}
              placeholder="http://example.com, http://localhost:3000"
            />
          </div>
        </div>
      )}
      
      <div className="form-group">
        <div className="checkbox-group">
          <input
            type="checkbox"
            id="dataEncryption"
            checked={formData.security.dataEncryption.enabled}
            onChange={(e) => handleNestedChange('security', 'dataEncryption', {
              ...formData.security.dataEncryption,
              enabled: e.target.checked
            })}
          />
          <label htmlFor="dataEncryption">Enable Data Encryption</label>
        </div>
      </div>
      
      {formData.security.dataEncryption.enabled && (
        <div className="nested-form">
          <div className="form-group">
            <label>Encryption Algorithm</label>
            <select
              value={formData.security.dataEncryption.algorithm}
              onChange={(e) => handleNestedChange('security', 'dataEncryption', {
                ...formData.security.dataEncryption,
                algorithm: e.target.value as any
              })}
            >
              <option value="aes-256-gcm">AES-256-GCM</option>
              <option value="aes-128-gcm">AES-128-GCM</option>
            </select>
          </div>
          <div className="form-group">
            <label>Key Rotation (days)</label>
            <input
              type="number"
              min="1"
              value={formData.security.dataEncryption.keyRotationDays}
              onChange={(e) => handleNestedChange('security', 'dataEncryption', {
                ...formData.security.dataEncryption,
                keyRotationDays: Number(e.target.value)
              })}
            />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="erpnext-settings">
      <h2>ERPNext Integration Settings</h2>
      
      <div className="settings-tabs">
        <div className="tab-buttons">
          <button 
            type="button" 
            className={activeTab === 'connection' ? 'active' : ''}
            onClick={() => setActiveTab('connection')}
          >
            Connection
          </button>
          <button 
            type="button"
            className={activeTab === 'sync' ? 'active' : ''}
            onClick={() => setActiveTab('sync')}
          >
            Sync Settings
          </button>
          <button 
            type="button"
            className={activeTab === 'security' ? 'active' : ''}
            onClick={() => setActiveTab('security')}
          >
            Security
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {activeTab === 'connection' && renderConnectionTab()}
          {activeTab === 'sync' && renderSyncTab()}
          {activeTab === 'security' && renderSecurityTab()}
          
          <div className="form-actions">
            <button 
              type="button" 
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ErpNextSettingsForm;
