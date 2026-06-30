import React from 'react';
import type { Role, WorkspaceSettings } from '../../../types';

interface AddMemberModalProps {
  roles: Role[];
  settings: WorkspaceSettings;
  memberForm: {
    name: string;
    email: string;
    title: string;
    role: string;
    password: string;
  };
  onFormChange: (form: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({
  roles,
  settings,
  memberForm,
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
        <div style={{ fontSize: '18px', fontWeight: 800 }}>Add team member</div>
        <div style={{ fontSize: '13px', color: '#8a8a94', marginTop: '4px', marginBottom: '20px' }}>
          Create a new account and add them to the workspace.
        </div>

        {/* Full Name */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>Full name</label>
          <input
            value={memberForm.name}
            onChange={e => onFormChange({ ...memberForm, name: e.target.value })}
            placeholder="e.g. Ali Hassan"
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
            value={memberForm.email}
            onChange={e => onFormChange({ ...memberForm, email: e.target.value })}
            placeholder="ali@morango.ai"
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

        {/* Password */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>Password</label>
          <input
            type="password"
            value={memberForm.password}
            onChange={e => onFormChange({ ...memberForm, password: e.target.value })}
            placeholder="••••••••"
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

        {/* Job Title & Role */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '22px' }}>
          <div>
            <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>Job title</label>
            <input
              value={memberForm.title}
              onChange={e => onFormChange({ ...memberForm, title: e.target.value })}
              placeholder="Frontend Engineer"
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
              value={memberForm.role}
              onChange={e => onFormChange({ ...memberForm, role: e.target.value })}
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
            Add member
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddMemberModal;
