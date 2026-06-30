import React from 'react';
import type { Role, WorkspaceSettings } from '../../../types';

interface EditMemberModalProps {
  roles: Role[];
  settings: WorkspaceSettings;
  editMemberForm: {
    name: string;
    email: string;
    title: string;
    roleId: string;
    isActive: boolean;
    password: string;
  };
  onFormChange: (form: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

const EditMemberModal: React.FC<EditMemberModalProps> = ({
  roles,
  settings,
  editMemberForm,
  onFormChange,
  onSubmit,
  onClose,
}) => {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(16,16,26,.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px',
        zIndex: 60,
        animation: 'tf-overlay .15s ease',
      }}
    >
      <form
        onSubmit={onSubmit}
        style={{
          width: '100%',
          maxWidth: '460px',
          background: '#fff',
          borderRadius: '18px',
          padding: '26px',
          animation: 'tf-pop .2s ease',
        }}
      >
        <div style={{ fontSize: '18px', fontWeight: 800 }}>Edit team member</div>
        <div style={{ fontSize: '13px', color: '#8a8a94', marginTop: '4px', marginBottom: '20px' }}>
          Update profile, role, and system status.
        </div>

        {/* Full Name */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>Full name</label>
          <input
            value={editMemberForm.name}
            onChange={e => onFormChange({ ...editMemberForm, name: e.target.value })}
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
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>Email</label>
          <input
            type="email"
            value={editMemberForm.email}
            onChange={e => onFormChange({ ...editMemberForm, email: e.target.value })}
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
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>
            New Password (leave empty to keep current)
          </label>
          <input
            type="password"
            value={editMemberForm.password}
            onChange={e => onFormChange({ ...editMemberForm, password: e.target.value })}
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

        {/* Job Title & Role */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '22px' }}>
          <div>
            <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>Job title</label>
            <input
              value={editMemberForm.title}
              onChange={e => onFormChange({ ...editMemberForm, title: e.target.value })}
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
          <div>
            <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>Role</label>
            <select
              value={editMemberForm.roleId}
              onChange={e => onFormChange({ ...editMemberForm, roleId: e.target.value })}
              style={{
                width: '100%',
                marginTop: '7px',
                padding: '11px 13px',
                border: '1px solid #e1e1e8',
                borderRadius: '10px',
                fontSize: '14px',
                background: '#fff',
              }}
            >
              {roles.map(o => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
          <input
            type="checkbox"
            id="isActive"
            checked={editMemberForm.isActive}
            onChange={e => onFormChange({ ...editMemberForm, isActive: e.target.checked })}
            style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: settings.accent }}
          />
          <label htmlFor="isActive" style={{ fontSize: '13px', fontWeight: 700, color: '#44444e', cursor: 'pointer' }}>
            Active Member (uncheck to deactivate)
          </label>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '11px 18px',
              border: '1px solid #e1e1e8',
              borderRadius: '10px',
              background: '#fff',
              fontWeight: 700,
              fontSize: '13.5px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{
              padding: '11px 22px',
              border: 'none',
              borderRadius: '10px',
              background: settings.accent,
              color: '#fff',
              fontWeight: 700,
              fontSize: '13.5px',
              cursor: 'pointer',
            }}
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditMemberModal;
