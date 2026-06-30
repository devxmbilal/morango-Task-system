import React from 'react';
import type { Permission, WorkspaceSettings } from '../../../types';

interface RoleForm {
  name: string;
  color: string;
  perms: Permission;
}

interface AddRoleModalProps {
  settings: WorkspaceSettings;
  roleForm: RoleForm;
  onFormChange: (form: RoleForm) => void;
  onTogglePerm: (key: keyof Permission) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

const AddRoleModal: React.FC<AddRoleModalProps> = ({
  settings,
  roleForm,
  onFormChange,
  onTogglePerm,
  onSubmit,
  onClose,
}) => {
  const colorOptions = ['#7c3aed', '#0891b2', '#db2777', '#d97706', '#059669', '#2563eb'];
  const permLabels: Record<keyof Permission, string> = {
    allTasks: 'View all tasks',
    create: 'Create & assign tasks',
    team: 'Manage team',
    roles: 'Manage roles',
    reports: 'View reports',
    settings: 'Manage settings',
  };

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
          maxWidth: '480px',
          maxHeight: '88vh',
          overflowY: 'auto',
          background: '#fff',
          borderRadius: '18px',
          padding: '26px',
          animation: 'tf-pop .2s ease',
        }}
      >
        <div style={{ fontSize: '18px', fontWeight: 800 }}>Create role</div>
        <div style={{ fontSize: '13px', color: '#8a8a94', marginTop: '4px', marginBottom: '20px' }}>
          Pick what this role is allowed to do.
        </div>

        {/* Role Name */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>Role name</label>
          <input
            value={roleForm.name}
            onChange={e => onFormChange({ ...roleForm, name: e.target.value })}
            placeholder="e.g. Team Lead"
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

        {/* Color Picker */}
        <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e', marginTop: '16px', marginBottom: '9px' }}>
          Color
        </div>
        <div style={{ display: 'flex', gap: '9px', marginBottom: '16px' }}>
          {colorOptions.map(c => (
            <button
              type="button"
              key={c}
              onClick={() => onFormChange({ ...roleForm, color: c })}
              style={{
                width: '30px',
                height: '30px',
                borderRadius: '8px',
                background: c,
                cursor: 'pointer',
                border: `3px solid ${roleForm.color === c ? '#16161a' : 'transparent'}`,
              }}
            />
          ))}
        </div>

        {/* Permissions */}
        <div
          style={{
            fontSize: '12.5px',
            fontWeight: 700,
            color: '#44444e',
            marginTop: '18px',
            marginBottom: '10px',
          }}
        >
          Permissions
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {(Object.keys(roleForm.perms) as Array<keyof Permission>).map(key => {
            const on = roleForm.perms[key];
            return (
              <button
                type="button"
                key={key}
                onClick={() => onTogglePerm(key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  textAlign: 'left',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  border: `1px solid ${on ? settings.accent : '#e1e1e8'}`,
                  background: on ? `color-mix(in srgb, ${settings.accent} 8%, #fff)` : '#fff',
                  color: on ? '#16161a' : '#6b6b76',
                }}
              >
                <span
                  style={{
                    width: '17px',
                    height: '17px',
                    borderRadius: '5px',
                    border: `1.5px solid ${on ? settings.accent : '#cfcfd8'}`,
                    background: on ? settings.accent : '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '11px',
                    color: '#fff',
                    flex: 'none',
                  }}
                >
                  {on ? '✓' : ''}
                </span>
                {permLabels[key]}
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '22px' }}>
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
            Create role
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddRoleModal;
