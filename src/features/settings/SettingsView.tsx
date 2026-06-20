import React from 'react';
import type { WorkspaceSettings } from '../../types';

interface SettingsViewProps {
  settings: WorkspaceSettings;
  onSave: (field: string, val: string | boolean) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ settings, onSave }) => {
  return (
    <div style={{ maxWidth: '640px' }}>
      <div
        style={{ background: '#fff', border: '1px solid #ececf1', borderRadius: '16px', padding: '28px' }}
      >
        <div style={{ fontSize: '16px', fontWeight: 800, marginBottom: '22px' }}>Workspace customization</div>

        {/* Company Name */}
        <div style={{ marginBottom: '22px' }}>
          <label style={{ fontSize: '13px', fontWeight: 700, color: '#44444e' }}>Company name</label>
          <input
            value={settings.companyName}
            onChange={e => onSave('companyName', e.target.value)}
            style={{
              width: '100%',
              marginTop: '7px',
              padding: '11px 13px',
              border: '1px solid #e1e1e8',
              borderRadius: '10px',
              fontSize: '14px',
            }}
          />
        </div>

        {/* Accent Color */}
        <div style={{ marginBottom: '22px' }}>
          <label style={{ fontSize: '13px', fontWeight: 700, color: '#44444e' }}>Accent color</label>
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            {['#4f46e5', '#2563eb', '#0d9488', '#7c3aed', '#db2777'].map(c => (
              <button
                key={c}
                onClick={() => onSave('accent', c)}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: c,
                  cursor: 'pointer',
                  border: `3px solid ${settings.accent === c ? '#16161a' : 'transparent'}`,
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
              onClick={() => onSave('sidebarTheme', 'light')}
              style={{
                padding: '11px 22px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                border: `1px solid ${settings.sidebarTheme === 'light' ? settings.accent : '#e1e1e8'}`,
                background:
                  settings.sidebarTheme === 'light'
                    ? `color-mix(in srgb, ${settings.accent} 8%, #fff)`
                    : '#fff',
                color: settings.sidebarTheme === 'light' ? settings.accent : '#6b6b76',
              }}
            >
              Light
            </button>
            <button
              onClick={() => onSave('sidebarTheme', 'dark')}
              style={{
                padding: '11px 22px',
                borderRadius: '10px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                border: `1px solid ${settings.sidebarTheme === 'dark' ? settings.accent : '#e1e1e8'}`,
                background:
                  settings.sidebarTheme === 'dark'
                    ? `color-mix(in srgb, ${settings.accent} 8%, #fff)`
                    : '#fff',
                color: settings.sidebarTheme === 'dark' ? settings.accent : '#6b6b76',
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
              checked={!!settings.emailEnabled}
              onChange={e => onSave('emailEnabled', e.target.checked)}
              style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: settings.accent }}
            />
            <label
              htmlFor="emailEnabled"
              style={{ fontSize: '13px', fontWeight: 700, color: '#44444e', cursor: 'pointer' }}
            >
              Enable Email Notifications
            </label>
          </div>

          {settings.emailEnabled && (
            <>
              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#6b6b76' }}>SMTP Host</label>
                <input
                  value={settings.smtpHost || ''}
                  onChange={e => onSave('smtpHost', e.target.value)}
                  placeholder="e.g. smtp.gmail.com"
                  style={{
                    width: '100%',
                    marginTop: '6px',
                    padding: '10px 12px',
                    border: '1px solid #e1e1e8',
                    borderRadius: '10px',
                    fontSize: '13.5px',
                  }}
                />
              </div>

              <div
                style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}
              >
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#6b6b76' }}>SMTP Port</label>
                  <input
                    value={settings.smtpPort || ''}
                    onChange={e => onSave('smtpPort', e.target.value)}
                    placeholder="e.g. 587"
                    style={{
                      width: '100%',
                      marginTop: '6px',
                      padding: '10px 12px',
                      border: '1px solid #e1e1e8',
                      borderRadius: '10px',
                      fontSize: '13.5px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#6b6b76' }}>
                    Sender Email (From)
                  </label>
                  <input
                    value={settings.smtpFrom || ''}
                    onChange={e => onSave('smtpFrom', e.target.value)}
                    placeholder="e.g. noreply@morango.ai"
                    style={{
                      width: '100%',
                      marginTop: '6px',
                      padding: '10px 12px',
                      border: '1px solid #e1e1e8',
                      borderRadius: '10px',
                      fontSize: '13.5px',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#6b6b76' }}>
                  SMTP User (Username)
                </label>
                <input
                  value={settings.smtpUser || ''}
                  onChange={e => onSave('smtpUser', e.target.value)}
                  placeholder="e.g. user@gmail.com"
                  style={{
                    width: '100%',
                    marginTop: '6px',
                    padding: '10px 12px',
                    border: '1px solid #e1e1e8',
                    borderRadius: '10px',
                    fontSize: '13.5px',
                  }}
                />
              </div>

              <div style={{ marginBottom: '8px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#6b6b76' }}>SMTP Password</label>
                <input
                  type="password"
                  value={settings.smtpPassword || ''}
                  onChange={e => onSave('smtpPassword', e.target.value)}
                  placeholder="••••••••"
                  style={{
                    width: '100%',
                    marginTop: '6px',
                    padding: '10px 12px',
                    border: '1px solid #e1e1e8',
                    borderRadius: '10px',
                    fontSize: '13.5px',
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsView;
