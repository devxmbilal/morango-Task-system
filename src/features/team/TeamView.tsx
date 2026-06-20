import React from 'react';
import type { User, WorkspaceSettings } from '../../types';

interface TeamMember {
  id: string;
  name: string;
  initials: string;
  color: string;
  title: string;
  email: string;
  total: number;
  active: number;
  done: number;
  pct: number;
  roleLabel: string;
  roleColor: string;
  roleBg: string;
  roleId: string;
  isActive: boolean;
}

interface TeamViewProps {
  user: User;
  filteredMembers: TeamMember[];
  teamMembers: TeamMember[];
  settings: WorkspaceSettings;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onAddMember: () => void;
  onEditMember: (m: any) => void;
  onDeleteMember: (id: string) => void;
}

const TeamView: React.FC<TeamViewProps> = ({
  user,
  filteredMembers,
  teamMembers,
  settings,
  searchQuery,
  onSearchChange,
  onAddMember,
  onEditMember,
  onDeleteMember,
}) => {
  return (
    <>
      {/* Header row */}
      <div
        className="team-header-row"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', gap: '16px' }}
      >
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}
          className="team-header-search-container"
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#fff',
              border: '1px solid #eaeaef',
              borderRadius: '10px',
              padding: '8px 12px',
              width: '260px',
              color: '#9a9aa4',
              fontSize: '13px',
            }}
            className="team-search-input"
          >
            <span style={{ fontSize: '13px' }}>⌕</span>
            <input
              type="text"
              placeholder="Search members..."
              value={searchQuery}
              onChange={e => onSearchChange(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                width: '100%',
                fontSize: '13px',
                outline: 'none',
                color: '#16161a',
              }}
            />
          </div>
          <span style={{ fontSize: '13.5px', color: '#8a8a94', fontWeight: 600 }} className="team-search-count">
            {searchQuery
              ? `${filteredMembers.length} of ${teamMembers.length} members`
              : `${teamMembers.length} members`}
          </span>
        </div>
        {user.perms?.permTeam && (
          <button
            onClick={onAddMember}
            style={{
              padding: '9px 16px',
              border: 'none',
              borderRadius: '9px',
              background: settings.accent,
              color: '#fff',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
            }}
            className="team-add-btn"
          >
            + Add member
          </button>
        )}
      </div>

      {/* Members Grid */}
      <div className="team-members-grid" style={{ display: 'grid', gap: '16px' }}>
        {filteredMembers.length === 0 ? (
          <div
            className="team-grid-empty"
            style={{
              background: '#fff',
              border: '1px solid #ececf1',
              borderRadius: '14px',
              padding: '48px',
              textAlign: 'center',
              color: '#8a8a94',
              fontWeight: 600,
            }}
          >
            No members found matching your search.
          </div>
        ) : (
          filteredMembers.map(m => (
            <div
              key={m.id}
              style={{ background: '#fff', border: '1px solid #ececf1', borderRadius: '14px', padding: '20px' }}
            >
              {/* Member Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '13px',
                    background: m.color,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '16px',
                    flex: 'none',
                  }}
                >
                  {m.initials}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '15px', fontWeight: 700 }}>{m.name}</span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        color: m.roleColor,
                        background: m.roleBg,
                        padding: '2px 7px',
                        borderRadius: '5px',
                      }}
                    >
                      {m.roleLabel}
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        color: m.isActive ? '#059669' : '#dc2626',
                        background: m.isActive ? '#e6f4ea' : '#fce8e6',
                        padding: '2px 7px',
                        borderRadius: '5px',
                      }}
                    >
                      {m.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#8a8a94' }}>{m.title}</div>
                </div>
              </div>
              <div style={{ fontSize: '12px', color: '#9a9aa4', marginTop: '12px' }}>{m.email}</div>

              {/* Task Stats */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <div
                  style={{
                    flex: 1,
                    background: '#f7f7fa',
                    borderRadius: '9px',
                    padding: '10px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '18px', fontWeight: 800 }}>{m.total}</div>
                  <div style={{ fontSize: '10.5px', color: '#8a8a94', fontWeight: 600 }}>Total</div>
                </div>
                <div
                  style={{
                    flex: 1,
                    background: '#f7f7fa',
                    borderRadius: '9px',
                    padding: '10px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#d97706' }}>{m.active}</div>
                  <div style={{ fontSize: '10.5px', color: '#8a8a94', fontWeight: 600 }}>Active</div>
                </div>
                <div
                  style={{
                    flex: 1,
                    background: '#f7f7fa',
                    borderRadius: '9px',
                    padding: '10px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#059669' }}>{m.done}</div>
                  <div style={{ fontSize: '10.5px', color: '#8a8a94', fontWeight: 600 }}>Done</div>
                </div>
              </div>

              {/* Completion Bar */}
              <div style={{ marginTop: '14px' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '11.5px',
                    color: '#8a8a94',
                    marginBottom: '5px',
                  }}
                >
                  <span>Completion</span>
                  <span style={{ fontWeight: 700, color: '#16161a' }}>{m.pct}%</span>
                </div>
                <div style={{ height: '7px', background: '#eef0f3', borderRadius: '6px', overflow: 'hidden' }}>
                  <div
                    style={{ height: '100%', width: `${m.pct}%`, background: settings.accent }}
                  />
                </div>
              </div>

              {/* Edit/Delete Actions */}
              {user.perms?.permTeam && (
                <div
                  style={{
                    display: 'flex',
                    gap: '8px',
                    marginTop: '16px',
                    borderTop: '1px solid #ececf1',
                    paddingTop: '14px',
                    justifyContent: 'flex-end',
                  }}
                >
                  <button
                    onClick={() => onEditMember(m)}
                    style={{
                      padding: '6px 12px',
                      border: '1px solid #e1e1e8',
                      borderRadius: '6px',
                      background: '#fff',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      color: '#44444e',
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDeleteMember(m.id)}
                    style={{
                      padding: '6px 12px',
                      border: '1px solid #fee2e2',
                      borderRadius: '6px',
                      background: '#fff',
                      fontSize: '12px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      color: '#dc2626',
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </>
  );
};

export default TeamView;
