import React from 'react';
import type { Task, WorkspaceSettings } from '../../types';
import { getInitials, getDaysLeft } from '../../lib/utils';

interface ReportsViewProps {
  tasks: Task[];
  members: any[];
  settings: WorkspaceSettings;
  statusDist: Array<{ label: string; count: number; color: string; pct: number }>;
  overdueN: number;
  overdueList: Task[];
  onSelectTask: (id: string) => void;
}

const ReportsView: React.FC<ReportsViewProps> = ({
  members,
  settings,
  statusDist,
  overdueN,
  overdueList,
  onSelectTask,
}) => {
  const getUserById = (id: string) => members.find(m => m.id === id);

  return (
    <>
      {/* Status & Completion Charts */}
      <div className="reports-grid" style={{ display: 'grid', gap: '18px' }}>
        {/* Status Distribution */}
        <div style={{ background: '#fff', border: '1px solid #ececf1', borderRadius: '14px', padding: '22px' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '18px' }}>Status distribution</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {statusDist.map(d => (
              <div key={d.label}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '13px',
                    marginBottom: '7px',
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{d.label}</span>
                  <span style={{ fontWeight: 700, color: '#8a8a94' }}>
                    {d.count} · {d.pct}%
                  </span>
                </div>
                <div style={{ height: '11px', background: '#eef0f3', borderRadius: '7px', overflow: 'hidden' }}>
                  <div
                    style={{ height: '100%', width: `${d.pct}%`, background: d.color, borderRadius: '7px' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Completion by Member */}
        <div style={{ background: '#fff', border: '1px solid #ececf1', borderRadius: '14px', padding: '22px' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '18px' }}>Completion by member</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {members.map(m => (
              <div key={m.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '6px' }}>
                  <div
                    style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '7px',
                      background: m.color,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '9.5px',
                    }}
                  >
                    {m.initials}
                  </div>
                  <span style={{ fontSize: '12.5px', fontWeight: 600, flex: 1 }}>{m.name}</span>
                  <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#16161a' }}>{m.pct}%</span>
                </div>
                <div style={{ height: '7px', background: '#eef0f3', borderRadius: '6px', overflow: 'hidden' }}>
                  <div
                    style={{ height: '100%', width: `${m.pct}%`, background: settings.accent }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Overdue & At-Risk */}
      <div
        style={{
          background: '#fff',
          border: '1px solid #ececf1',
          borderRadius: '14px',
          padding: '22px',
          marginTop: '18px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
          <div style={{ fontSize: '15px', fontWeight: 700 }}>Overdue &amp; at-risk</div>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: '#dc2626',
              background: '#fef2f2',
              padding: '2px 9px',
              borderRadius: '20px',
            }}
          >
            {overdueN}
          </span>
        </div>
        {overdueN > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {overdueList.map(item => {
              const assignee = getUserById(item.assigneeId);
              const dl = getDaysLeft(item.due);
              return (
                <div
                  key={item.id}
                  onClick={() => onSelectTask(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '11px 8px',
                    borderRadius: '9px',
                    cursor: 'pointer',
                  }}
                  className="btn-hover overdue-ticket-item"
                >
                  <span
                    className="overdue-ticket-id"
                    style={{
                      fontFamily: "'IBM Plex Mono', monospace",
                      fontSize: '11px',
                      color: '#a0a0aa',
                      width: '72px',
                      flex: 'none',
                    }}
                  >
                    {item.id}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }} className="overdue-ticket-title-container">
                    <span
                      style={{
                        fontSize: '13.5px',
                        fontWeight: 600,
                        display: 'block',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {item.title}
                    </span>
                    <div
                      className="overdue-ticket-mobile-meta"
                      style={{ display: 'none', fontSize: '10.5px', fontWeight: 700, color: '#dc2626', marginTop: '4px' }}
                    >
                      {-dl}d overdue
                    </div>
                  </div>
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '7px',
                      background: assignee?.color || '#94a3b8',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '10px',
                      flex: 'none',
                    }}
                  >
                    {getInitials(assignee?.name || '?')}
                  </div>
                  <span
                    className="overdue-ticket-desktop-due"
                    style={{
                      fontSize: '11.5px',
                      fontWeight: 700,
                      color: '#dc2626',
                      width: '90px',
                      textAlign: 'right',
                      flex: 'none',
                    }}
                  >
                    {-dl}d overdue
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ color: '#8a8a94', fontSize: '13px', padding: '6px' }}>Nothing overdue. Great work 🎉</div>
        )}
      </div>
    </>
  );
};

export default ReportsView;
