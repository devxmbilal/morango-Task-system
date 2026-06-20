import React from 'react';
import type { WorkspaceSettings } from '../../types';

interface ProfileViewProps {
  settings: WorkspaceSettings;
  profileForm: { name: string; email: string; password: string };
  onFormChange: (form: any) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({
  settings,
  profileForm,
  onFormChange,
  onSubmit,
}) => {
  return (
    <div style={{ maxWidth: '640px' }}>
      <form
        onSubmit={onSubmit}
        style={{ background: '#fff', border: '1px solid #ececf1', borderRadius: '16px', padding: '28px' }}
      >
        <div style={{ fontSize: '17px', fontWeight: 800, marginBottom: '4px' }}>My Profile Settings</div>
        <div style={{ fontSize: '13px', color: '#8a8a94', marginBottom: '22px' }}>
          Update your personal workspace settings and credentials.
        </div>

        {/* Full Name */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>Full Name</label>
          <input
            value={profileForm.name}
            onChange={e => onFormChange({ ...profileForm, name: e.target.value })}
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

        {/* Email */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>Email Address</label>
          <input
            type="email"
            value={profileForm.email}
            onChange={e => onFormChange({ ...profileForm, email: e.target.value })}
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

        {/* New Password */}
        <div style={{ marginBottom: '22px' }}>
          <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>
            New Password (leave empty to keep current)
          </label>
          <input
            type="password"
            value={profileForm.password}
            onChange={e => onFormChange({ ...profileForm, password: e.target.value })}
            placeholder="••••••••"
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

        {/* Save Button */}
        <div
          style={{
            display: 'flex',
            gap: '10px',
            justifyContent: 'flex-end',
            borderTop: '1px solid #f2f2f5',
            paddingTop: '20px',
          }}
        >
          <button
            type="submit"
            style={{
              padding: '11px 24px',
              border: 'none',
              borderRadius: '10px',
              background: settings.accent,
              color: '#fff',
              fontWeight: 700,
              fontSize: '13.5px',
              cursor: 'pointer',
            }}
          >
            Save Profile
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileView;
