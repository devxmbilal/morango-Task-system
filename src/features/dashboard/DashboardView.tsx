import React from 'react';
import type { PendingReview, Task, WorkspaceSettings } from '../../types';
import { getInitials, getStatusMeta, getDaysLeft } from '../../lib/utils';
import PendingReviewsPanel from './PendingReviewsPanel';

interface DashboardViewProps {
  tasks: Task[];
  filteredTasks: Task[];
  members: any[];
  settings: WorkspaceSettings;
  stats: Array<{ label: string; value: number; color: string; sub: string; subColor: string }>;
  pendingReviews: PendingReview[];
  onSelectTask: (id: string) => void;
}

const DashboardView: React.FC<DashboardViewProps> = ({
  tasks,
  filteredTasks,
  members,
  settings,
  stats,
  pendingReviews,
  onSelectTask,
}) => {
  const getUserById = (id: string) => members.find(m => m.id === id);
  const overdueList = tasks.filter(t => getDaysLeft(t.due) < 0 && t.status !== 'done');

  return (
    <>
      {/* Stats Cards */}
      <div className="dashboard-stats-grid" style={{ display: 'grid', gap: '16px' }}>
        {stats.map(st => (
          <div
            key={st.label}
            style={{ background: '#fff', border: '1px solid #ececf1', borderRadius: '14px', padding: '18px' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '12.5px', color: '#8a8a94', fontWeight: 600 }}>{st.label}</div>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: st.color }} />
            </div>
            <div style={{ fontSize: '30px', fontWeight: 800, marginTop: '10px', letterSpacing: '-0.02em' }}>
              {st.value}
            </div>
            <div style={{ fontSize: '12px', color: st.subColor, marginTop: '4px', fontWeight: 600 }}>{st.sub}</div>
          </div>
        ))}
      </div>

      <PendingReviewsPanel pendingReviews={pendingReviews} onSelectTask={onSelectTask} />

      {/* Charts Grid */}
      <div className="dashboard-charts-grid" style={{ display: 'grid', gap: '18px', marginTop: '18px' }}>
        {/* Left Column Stack */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Recent Tickets */}
          <div style={{ background: '#fff', border: '1px solid #ececf1', borderRadius: '14px', padding: '20px' }}>
            <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px' }}>Recent tickets</div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {filteredTasks.slice(0, 6).map(item => {
                const assignee = getUserById(item.assigneeId);
                const sm = getStatusMeta(item.status);
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
                    className="btn-hover recent-ticket-item"
                  >
                    <span
                      className="recent-ticket-id"
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: '11.5px',
                        color: '#9a9aa4',
                        width: '72px',
                        flex: 'none',
                      }}
                    >
                      {item.id}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }} className="recent-ticket-title-container">
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
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 600,
                            color: '#7a7a86',
                            background: '#f1f1f5',
                            padding: '1px 7px',
                            borderRadius: '5px',
                            display: 'inline-block',
                          }}
                        >
                          {item.tag}
                        </span>
                      </div>
                      <div
                        className="recent-ticket-mobile-meta"
                        style={{ display: 'none', gap: '8px', alignItems: 'center', marginTop: '4px' }}
                      >
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 700,
                            color: sm.color,
                            background: `color-mix(in srgb, ${sm.color} 12%, #fff)`,
                            padding: '2px 6px',
                            borderRadius: '4px',
                          }}
                        >
                          {sm.label}
                        </span>
                        <span
                          style={{
                            fontSize: '10.5px',
                            color:
                              item.status === 'done' ? '#059669' : dl < 0 ? '#dc2626' : '#8a8a94',
                            fontWeight: 600,
                          }}
                        >
                          {item.status === 'done'
                            ? 'Done'
                            : dl < 0
                            ? `${-dl}d overdue`
                            : dl === 0
                            ? 'Today'
                            : `${dl}d left`}
                        </span>
                      </div>
                    </div>
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '8px',
                        background: assignee?.color || '#94a3b8',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '10.5px',
                        flex: 'none',
                      }}
                    >
                      {getInitials(assignee?.name || '?')}
                    </div>
                    <span
                      className="recent-ticket-desktop-status"
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: sm.color,
                        background: `color-mix(in srgb, ${sm.color} 12%, #fff)`,
                        padding: '3px 9px',
                        borderRadius: '20px',
                        flex: 'none',
                        width: '90px',
                        textAlign: 'center',
                      }}
                    >
                      {sm.label}
                    </span>
                    <span
                      className="recent-ticket-desktop-due"
                      style={{
                        fontSize: '12px',
                        color:
                          item.status === 'done' ? '#059669' : dl < 0 ? '#dc2626' : '#8a8a94',
                        width: '74px',
                        textAlign: 'right',
                        flex: 'none',
                        fontWeight: 600,
                      }}
                    >
                      {item.status === 'done'
                        ? 'Done'
                        : dl < 0
                        ? `${-dl}d overdue`
                        : dl === 0
                        ? 'Due today'
                        : `${dl}d left`}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Overdue Tickets (Shown only if there are any) */}
          {overdueList.length > 0 && (
            <div style={{ background: '#fff', border: '1px solid #fee2e2', borderRadius: '14px', padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <span style={{ fontSize: '15px' }}>⚠️</span>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#991b1b' }}>Overdue tickets ({overdueList.length})</div>
              </div>
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
                      className="btn-hover recent-ticket-item"
                    >
                      <span
                        style={{
                          fontFamily: "'IBM Plex Mono', monospace",
                          fontSize: '11.5px',
                          color: '#ef4444',
                          width: '72px',
                          flex: 'none',
                          fontWeight: 600,
                        }}
                      >
                        {item.id}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}>
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 600,
                              color: '#7a7a86',
                              background: '#f1f1f5',
                              padding: '1px 7px',
                              borderRadius: '5px',
                              display: 'inline-block',
                            }}
                          >
                            {item.tag}
                          </span>
                        </div>
                      </div>
                      <div
                        style={{
                          width: '26px',
                          height: '26px',
                          borderRadius: '8px',
                          background: assignee?.color || '#94a3b8',
                          color: '#fff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 700,
                          fontSize: '10.5px',
                          flex: 'none',
                        }}
                      >
                        {getInitials(assignee?.name || '?')}
                      </div>
                      <span
                        style={{
                          fontSize: '11.5px',
                          fontWeight: 700,
                          color: '#ef4444',
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
            </div>
          )}
        </div>

        {/* Team Workload */}
        <div style={{ background: '#fff', border: '1px solid #ececf1', borderRadius: '14px', padding: '20px' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>Team workload</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {members.map(m => (
              <div key={m.id}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '6px' }}>
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '7px',
                      background: m.color,
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '10px',
                    }}
                  >
                    {m.initials}
                  </div>
                  <span style={{ fontSize: '12.5px', fontWeight: 600, flex: 1 }}>{m.name}</span>
                  <span style={{ fontSize: '11.5px', color: '#9a9aa4', fontWeight: 600 }}>
                    {m.active} active
                  </span>
                </div>
                <div style={{ height: '7px', background: '#eef0f3', borderRadius: '6px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(100, m.active * 34)}%`,
                      background: settings.accent,
                      borderRadius: '6px',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardView;
