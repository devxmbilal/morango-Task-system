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
                      <div
                        className="recent-ticket-mobile-meta"
                        style={{ display: 'none', gap: '6px', alignItems: 'center', marginTop: '4px', flexWrap: 'wrap' }}
                      >
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 600,
                            color: '#7a7a86',
                            background: '#f1f1f5',
                            padding: '1px 7px',
                            borderRadius: '5px',
                          }}
                        >
                          {item.tag}
                        </span>
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
                        {item.status !== 'done' && (
                          <span
                            style={{
                              fontSize: '10.5px',
                              color: dl < 0 ? '#dc2626' : '#8a8a94',
                              fontWeight: 600,
                            }}
                          >
                            {dl < 0
                              ? `${-dl}d overdue`
                              : dl === 0
                              ? 'Today'
                              : `${dl}d left`}
                          </span>
                        )}
                      </div>
                      <div
                        className="recent-ticket-desktop-tag"
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '3px' }}
                      >
                        <span
                          style={{
                            fontSize: '10px',
                            fontWeight: 600,
                            color: '#7a7a86',
                            background: '#f1f1f5',
                            padding: '1px 7px',
                            borderRadius: '5px',
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
                        className="overdue-ticket-id"
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
                        className="overdue-ticket-desktop-due"
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
            {members.map(m => {
              const active = m.active ?? 0;
              const total = m.total ?? 0;
              const hasWork = total > 0;
              const widthPct = hasWork ? Math.round((active / total) * 100) : 0;
              return (
                <div key={m.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '6px' }}>
                    <div
                      style={{
                        width: '26px', height: '26px', borderRadius: 7,
                        background: m.color, color: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontWeight: 700, fontSize: 10, flex: 'none',
                      }}
                    >
                      {m.initials}
                    </div>
                    <span style={{
                      fontSize: 12.5, fontWeight: 600, flex: 1, minWidth: 0,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {m.name}
                    </span>
                    <span style={{
                      fontSize: 11, fontWeight: 700,
                      color: active > 0 ? settings.accent : '#8a8a94',
                      background: active > 0
                        ? `color-mix(in srgb, ${settings.accent} 12%, #fff)`
                        : '#f1f1f5',
                      padding: '3px 9px', borderRadius: 12,
                      flex: 'none', whiteSpace: 'nowrap',
                    }}>
                      {active}/{total} active
                    </span>
                  </div>
                  <div style={{ height: 5, background: '#eef0f3', borderRadius: 4, overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        width: `${widthPct}%`,
                        background: settings.accent,
                        borderRadius: 4,
                        transition: 'width .25s ease',
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardView;
