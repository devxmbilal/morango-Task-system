import React from 'react';
import type { Role, User } from '../../types';

interface RolesViewProps {
  roles: Role[];
  user: User;
  accent: string;
  onAddRole: () => void;
}

const RolesView: React.FC<RolesViewProps> = ({ roles, user, accent, onAddRole }) => {
  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '18px' }}>
        <div style={{ fontSize: '13.5px', color: '#8a8a94', fontWeight: 600 }}>
          {roles.length} Roles available
        </div>
        {user.perms?.permRoles && (
          <button
            onClick={onAddRole}
            style={{
              marginLeft: 'auto',
              padding: '9px 16px',
              border: 'none',
              borderRadius: '9px',
              background: accent,
              color: '#fff',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            + Add role
          </button>
        )}
      </div>

      <div className="roles-grid" style={{ display: 'grid', gap: '16px' }}>
        {roles.map(r => (
          <div
            key={r.id}
            style={{ background: '#fff', border: '1px solid #ececf1', borderRadius: '14px', padding: '20px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '4px', background: r.color }} />
              <span style={{ fontSize: '16px', fontWeight: 700 }}>{r.name}</span>
              {r.system && (
                <span
                  style={{
                    fontSize: '10px',
                    color: '#8a8a94',
                    background: '#f1f1f5',
                    padding: '1px 6px',
                    borderRadius: '4px',
                    fontWeight: 600,
                  }}
                >
                  SYSTEM
                </span>
              )}
              <span style={{ marginLeft: 'auto', fontSize: '12px', color: '#8a8a94' }}>
                {r.memberCount} user(s)
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                borderTop: '1px solid #ececf1',
                paddingTop: '12px',
              }}
            >
              {[
                { label: 'View all tasks', val: r.perms.allTasks },
                { label: 'Create tasks', val: r.perms.create },
                { label: 'Manage team', val: r.perms.team },
                { label: 'Manage roles', val: r.perms.roles },
                { label: 'View reports', val: r.perms.reports },
                { label: 'Manage settings', val: r.perms.settings },
              ].map(({ label, val }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span>{label}</span>
                  <span style={{ color: val ? r.color : '#cbd5e1', fontWeight: 'bold' }}>{val ? 'Yes' : 'No'}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default RolesView;
