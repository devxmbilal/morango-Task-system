import React from 'react';
import type { User, WorkspaceSettings } from '../../types';
import { getInitials } from '../../lib/utils';

interface SidebarProps {
  user: User;
  settings: WorkspaceSettings;
  view: string;
  isSidebarOpen: boolean;
  tasks: any[];
  navItems: Array<{
    key: string;
    label: string;
    count?: number;
    showCount: boolean;
    onClick: () => void;
    bg: string;
    fg: string;
    dot: string;
    countBg: string;
  }>;
  onClose: () => void;
  onCreateTask: () => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  user,
  settings,
  isSidebarOpen,
  navItems,
  onClose,
  onCreateTask,
  onLogout,
}) => {
  return (
    <aside
      className={`workspace-sidebar ${isSidebarOpen ? 'open' : ''}`}
      style={{
        background: 'var(--side-bg,#fff)',
        borderRight: '1px solid var(--side-border,#ececf1)',
        display: 'flex',
        flexDirection: 'column',
        padding: '20px 14px',
        position: 'sticky',
        top: 0,
        height: '100vh',
      }}
    >
      {/* Logo & Company Name */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontWeight: 800,
          fontSize: '17px',
          color: 'var(--side-fg,#16161a)',
          padding: '4px 8px 18px',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            background: settings.accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M16 2.5C16 2.5 25.5 8 25.5 15.5C25.5 21 21.5 26.5 16 29.5C10.5 26.5 6.5 21 6.5 15.5C6.5 8 16 2.5 16 2.5Z" fill="#ffffff" />
            <circle cx="16" cy="10" r="1.8" fill={settings.accent} />
            <circle cx="11" cy="16.5" r="1.8" fill={settings.accent} />
            <circle cx="21" cy="16.5" r="1.8" fill={settings.accent} />
            <circle cx="16" cy="23" r="1.8" fill={settings.accent} />
          </svg>
        </div>
        {settings.companyName}

        {/* Close Button on Mobile Sidebar */}
        <button
          onClick={onClose}
          className="mobile-menu-close"
          style={{
            position: 'absolute',
            right: '8px',
            top: '4px',
            display: 'none',
            border: 'none',
            background: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: '#6b6b76',
          }}
        >
          ×
        </button>
      </div>

      {/* Navigation Items */}
      <nav style={{ display: 'flex', flexDirection: 'column' }}>
        {navItems.map(nav => (
          <button
            key={nav.key}
            onClick={() => {
              nav.onClick();
              onClose();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '11px',
              width: '100%',
              textAlign: 'left',
              border: 'none',
              cursor: 'pointer',
              fontSize: '13.5px',
              fontWeight: 600,
              padding: '10px 12px',
              borderRadius: '9px',
              marginBottom: '2px',
              background: nav.bg,
              color: nav.fg,
            }}
          >
            <span style={{ width: '7px', height: '7px', borderRadius: '2px', background: nav.dot }} />
            {nav.label}
            {nav.showCount && (
              <span
                style={{
                  marginLeft: 'auto',
                  fontSize: '11px',
                  fontWeight: 700,
                  background: nav.countBg,
                  color: nav.fg,
                  padding: '1px 7px',
                  borderRadius: '20px',
                }}
              >
                {nav.count}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* New Task Button */}
      {user.perms?.permCreate && (
        <button
          onClick={() => {
            onCreateTask();
            onClose();
          }}
          style={{
            marginTop: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '7px',
            width: '100%',
            padding: '10px',
            border: 'none',
            borderRadius: '9px',
            background: settings.accent,
            color: '#fff',
            fontWeight: 700,
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          + New Task
        </button>
      )}

      {/* User Info & Logout */}
      <div
        style={{
          marginTop: 'auto',
          borderTop: '1px solid var(--side-border,#ececf1)',
          paddingTop: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <div
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '10px',
            background: user.color,
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '13px',
            flex: 'none',
          }}
        >
          {getInitials(user.name)}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--side-fg,#16161a)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {user.name}
          </div>
          <div style={{ fontSize: '11.5px', color: 'var(--side-muted,#8a8a94)' }}>{user.title}</div>
        </div>
        <button
          onClick={() => {
            onLogout();
            onClose();
          }}
          title="Log out"
          style={{
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: 'var(--side-muted,#8a8a94)',
            fontSize: '16px',
            padding: '4px',
          }}
        >
          ⏻
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
