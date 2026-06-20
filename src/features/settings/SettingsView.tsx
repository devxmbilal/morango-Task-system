import React, { useState, useEffect } from 'react';
import type { WorkspaceSettings } from '../../types';

interface SettingsViewProps {
  settings: WorkspaceSettings;
  onSave: (settings: WorkspaceSettings) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ settings, onSave }) => {
  const [localSettings, setLocalSettings] = useState<WorkspaceSettings>({ ...settings });

  // Update local settings if global settings change (e.g. initial load)
  useEffect(() => {
    setLocalSettings({ ...settings });
  }, [settings]);

  const handleChange = (field: keyof WorkspaceSettings, val: any) => {
    setLocalSettings(prev => ({ ...prev, [field]: val }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localSettings);
  };

  return (
    <div style={{ maxWidth: '640px' }}>
      <form
        onSubmit={handleSubmit}
        style={{ background: '#fff', border: '1px solid #ececf1', borderRadius: '16px', padding: '28px' }}
      >
        <div style={{ fontSize: '16px', fontWeight: 800, marginBottom: '22px' }}>Workspace customization</div>

        {/* Company Name */}
        <div style={{ marginBottom: '22px' }}>
          <label style={{ fontSize: '13px', fontWeight: 700, color: '#44444e' }}>Company name</label>
          <input
            value={localSettings.companyName}
            onChange={e => handleChange('companyName', e.target.value)}
            style={{
              width: '100%',
              marginTop: '7px',
              padding: '11px 13px',
              border: '1px solid #e1e1e8',
              borderRadius: '10px',
              fontSize: '14px',
            }}
            required
          />
        </div>

        {/* Accent Color */}
        <div style={{ marginBottom: '22px' }}>
          <label style={{ fontSize: '13px', fontWeight: 700, color: '#44444e' }}>Accent color (Selected: {localSettings.accent})</label>
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            {['#4f46e5', '#2563eb', '#0d9488', '#7c3aed', '#db2777'].map(c => (
              <button
                type="button"
                key={c}
                onClick={() => handleChange('accent', c)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: c,
                  cursor: 'pointer',
                  border: `3px solid ${localSettings.accent === c ? '#16161a' : 'transparent'}`,
                }}
              />
            ))}
          </div>
        </div>

        {/* Sidebar Theme */}
        <div style={{ marginBottom: '22px' }}>
          <label style={{ fontSize: '13px', fontWeight: 700, color: '#44444e' }}>Sidebar theme</label>
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button
              type="button"
              onClick={() => handleChange('sidebarTheme', 'light')}
              style={{
                padding: '11px 22px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                border: `1px solid ${localSettings.sidebarTheme === 'light' ? localSettings.accent : '#e1e1e8'}`,
                background:
                  localSettings.sidebarTheme === 'light'
                    ? `color-mix(in srgb, ${localSettings.accent} 8%, #fff)`
                    : '#fff',
                color: localSettings.sidebarTheme === 'light' ? localSettings.accent : '#6b6b76',
              }}
            >
              Light
            </button>
            <button
              type="button"
              onClick={() => handleChange('sidebarTheme', 'dark')}
              style={{
                padding: '11px 22px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                border: `1px solid ${localSettings.sidebarTheme === 'dark' ? localSettings.accent : '#e1e1e8'}`,
                background:
                  localSettings.sidebarTheme === 'dark'
                    ? `color-mix(in srgb, ${localSettings.accent} 8%, #fff)`
                    : '#fff',
                color: localSettings.sidebarTheme === 'dark' ? localSettings.accent : '#6b6b76',
              }}
            >
              Dark
            </button>
          </div>
        </div>

        {/* SMTP / Email Setup */}
        <div style={{ marginTop: '28px', borderTop: '1px solid #ececf1', paddingTop: '22px' }}>
          <div style={{ fontSize: '15px', fontWeight: 800, marginBottom: '18px' }}>Email Setup (SMTP)</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <input
              type="checkbox"
              id="emailEnabled"
              checked={!!localSettings.emailEnabled}
              onChange={e => handleChange('emailEnabled', e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: localSettings.accent }}
            />
            <label
              htmlFor="emailEnabled"
              style={{ fontSize: '13px', fontWeight: 700, color: '#44444e', cursor: 'pointer' }}
            >
              Enable Email Notifications
            </label>
          </div>

          {localSettings.emailEnabled && (
            <>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#6b6b76' }}>SMTP Host</label>
                <input
                  value={localSettings.smtpHost || ''}
                  onChange={e => handleChange('smtpHost', e.target.value)}
                  placeholder="e.g. smtp.gmail.com"
                  style={{
                    width: '100%',
                    marginTop: '6px',
                    padding: '10px 12px',
                    border: '1px solid #e1e1e8',
                    borderRadius: '10px',
                    fontSize: '13.5px',
                  }}
                  required={localSettings.emailEnabled}
                />
              </div>

              <div
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}
              >
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#6b6b76' }}>SMTP Port</label>
                  <input
                    value={localSettings.smtpPort || ''}
                    onChange={e => handleChange('smtpPort', e.target.value)}
                    placeholder="e.g. 587"
                    style={{
                      width: '100%',
                      marginTop: '6px',
                      padding: '10px 12px',
                      border: '1px solid #e1e1e8',
                      borderRadius: '10px',
                      fontSize: '13.5px',
                    }}
                    required={localSettings.emailEnabled}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#6b6b76' }}>
                    Sender Email (From)
                  </label>
                  <input
                    value={localSettings.smtpFrom || ''}
                    onChange={e => handleChange('smtpFrom', e.target.value)}
                    placeholder="e.g. noreply@morango.ai"
                    style={{
                      width: '100%',
                      marginTop: '6px',
                      padding: '10px 12px',
                      border: '1px solid #e1e1e8',
                      borderRadius: '10px',
                      fontSize: '13.5px',
                    }}
                    required={localSettings.emailEnabled}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#6b6b76' }}>
                  SMTP User (Username)
                </label>
                <input
                  value={localSettings.smtpUser || ''}
                  onChange={e => handleChange('smtpUser', e.target.value)}
                  placeholder="e.g. user@gmail.com"
                  style={{
                    width: '100%',
                    marginTop: '6px',
                    padding: '10px 12px',
                    border: '1px solid #e1e1e8',
                    borderRadius: '10px',
                    fontSize: '13.5px',
                  }}
                  required={localSettings.emailEnabled}
                />
              </div>

              <div style={{ marginBottom: '8px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#6b6b76' }}>SMTP Password</label>
                <input
                  type="password"
                  value={localSettings.smtpPassword || ''}
                  onChange={e => handleChange('smtpPassword', e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    marginTop: '6px',
                    padding: '10px 12px',
                    border: '1px solid #e1e1e8',
                    borderRadius: '10px',
                    fontSize: '13.5px',
                  }}
                  required={localSettings.emailEnabled}
                />
              </div>
            </>
          )}
        </div>

        {/* Save Settings Submit Button */}
        <div
          style={{
            display: 'flex',
            gap: '10px',
            justifyContent: 'flex-end',
            borderTop: '1px solid #f2f2f5',
            paddingTop: '20px',
            marginTop: '28px',
          }}
        >
          <button
            type="submit"
            style={{
              padding: '11px 24px',
              border: 'none',
              borderRadius: '10px',
              background: localSettings.accent,
              color: '#fff',
              fontWeight: 700,
              fontSize: '13.5px',
              cursor: 'pointer',
              transition: 'background 0.2s ease',
            }}
          >
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default SettingsView;
