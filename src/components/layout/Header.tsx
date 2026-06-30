import React from 'react';
import type { User, WorkspaceSettings, AppNotification } from '../../types';
import { getInitials } from '../../lib/utils';

interface HeaderProps {
  user: User;
  settings: WorkspaceSettings;
  view: string;
  notifications: AppNotification[];
  showNotifications: boolean;
  showProfileMenu: boolean;
  onToggleNotifications: () => void;
  onToggleProfileMenu: () => void;
  onMarkAllRead: () => void;
  onNotificationClick: (n: AppNotification) => void;
  onNavigate: (v: string) => void;
  onCreateTask: () => void;
  onLogout: () => void;
  onOpenSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({
  user,
  settings,
  view,
  notifications,
  showNotifications,
  showProfileMenu,
  onToggleNotifications,
  onToggleProfileMenu,
  onMarkAllRead,
  onNotificationClick,
  onNavigate,
  onCreateTask,
  onLogout,
  onOpenSidebar,
}) => {
  const unreadCount = notifications.filter(n => !n.read).length;

  const viewTitle =
    view === 'create'
      ? 'Create Task'
      : view === 'mytasks'
      ? 'My Tasks'
      : view.charAt(0).toUpperCase() + view.slice(1);

  return (
    <header
      className="workspace-header"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        borderBottom: '1px solid #ececf1',
        background: '#fff',
        position: 'sticky',
        top: 0,
        zIndex: 5,
      }}
    >
      {/* Mobile hamburger toggle */}
      <button
        onClick={onOpenSidebar}
        className="mobile-menu-toggle"
        style={{
          display: 'none',
          border: '1px solid #eaeaef',
          background: '#fff',
          borderRadius: '10px',
          width: '38px',
          height: '38px',
          fontSize: '18px',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: '#6b6b76',
        }}
      >
        ☰
      </button>

      {/* Page Title */}
      <div>
        <div style={{ fontSize: '19px', fontWeight: 800, letterSpacing: '-0.01em' }}>{viewTitle}</div>
        <div className="workspace-header-subtitle" style={{ fontSize: '12.5px', color: '#8a8a94' }}>
          Manage workspace operations and data.
        </div>
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Bell Icon & Notification Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={onToggleNotifications}
            style={{
              position: 'relative',
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              border: '1px solid #eaeaef',
              background: '#fff',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#6b6b76',
            }}
            className="btn-hover"
          >
            🔔
            {unreadCount > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: '#ef4444',
                  color: '#fff',
                  fontSize: '10px',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              style={{
                position: 'absolute',
                top: '46px',
                right: 0,
                width: '320px',
                background: '#fff',
                border: '1px solid #eaeaef',
                borderRadius: '14px',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                zIndex: 10,
                padding: '14px 16px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid #f2f2f5',
                  paddingBottom: '10px',
                  marginBottom: '10px',
                }}
              >
                <span style={{ fontSize: '14px', fontWeight: 800 }}>Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllRead}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: settings.accent,
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div
                style={{
                  maxHeight: '240px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                {notifications.length === 0 ? (
                  <div style={{ fontSize: '12px', color: '#8a8a94', textAlign: 'center', padding: '16px 0' }}>
                    No notifications yet
                  </div>
                ) : (
                  notifications.map(n => {
                    const clickable = !!n.taskId;
                    return (
                      <div
                        key={n.id}
                        onClick={clickable ? () => onNotificationClick(n) : undefined}
                        style={{
                          padding: '8px 10px',
                          borderRadius: '8px',
                          background: n.read ? '#fff' : 'rgba(79, 70, 229, 0.05)',
                          border: '1px solid #f1f1f5',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px',
                          cursor: clickable ? 'pointer' : 'default',
                        }}
                      >
                        <div style={{ fontSize: '12px', fontWeight: 700, color: n.read ? '#16161a' : '#4f46e5' }}>
                          {n.title}
                        </div>
                        <div style={{ fontSize: '11.5px', color: '#4b5563', lineHeight: 1.3 }}>{n.message}</div>
                        {clickable && (
                          <div style={{ fontSize: '10.5px', color: '#4f46e5', fontWeight: 600, marginTop: 2 }}>
                            Open task →
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar & Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={onToggleProfileMenu}
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              border: '1px solid #eaeaef',
              background: user.color || '#4f46e5',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '13.5px',
              cursor: 'pointer',
            }}
            title="My Profile"
            className="btn-hover"
          >
            {getInitials(user.name)}
          </button>

          {showProfileMenu && (
            <div
              style={{
                position: 'absolute',
                top: '46px',
                right: 0,
                width: '220px',
                background: '#fff',
                border: '1px solid #eaeaef',
                borderRadius: '14px',
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                zIndex: 10,
                padding: '8px',
                animation: 'tf-pop 0.15s ease',
              }}
            >
              <div style={{ padding: '8px 12px', borderBottom: '1px solid #f2f2f5', marginBottom: '6px' }}>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: '#16161a',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {user.name}
                </div>
                <div style={{ fontSize: '11px', color: '#8a8a94' }}>{user.title}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <button
                  onClick={() => onNavigate('profile')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    textAlign: 'left',
                    border: 'none',
                    background: 'none',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#4b5563',
                    cursor: 'pointer',
                  }}
                  className="btn-hover-item"
                >
                  👤 My Profile
                </button>
                {user.perms?.permSettings && (
                  <button
                    onClick={() => onNavigate('settings')}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%',
                      textAlign: 'left',
                      border: 'none',
                      background: 'none',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#4b5563',
                      cursor: 'pointer',
                    }}
                    className="btn-hover-item"
                  >
                    ⚙️ Settings
                  </button>
                )}
                <hr style={{ border: 'none', borderTop: '1px solid #f2f2f5', margin: '4px 0' }} />
                <button
                  onClick={onLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    textAlign: 'left',
                    border: 'none',
                    background: 'none',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#ef4444',
                    cursor: 'pointer',
                  }}
                  className="btn-hover-item"
                >
                  🚪 Log Out
                </button>
              </div>
            </div>
          )}
        </div>

        {/* New Task CTA (Header) */}
        {user.perms?.permCreate && (
          <button
            onClick={onCreateTask}
            className="header-new-task-btn btn-hover"
            style={{
              border: 'none',
              borderRadius: '10px',
              background: settings.accent,
              color: '#fff',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span className="desktop-only">+ New Task</span>
            <span className="mobile-only" style={{ fontSize: '18px', fontWeight: 600 }}>
              +
            </span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
