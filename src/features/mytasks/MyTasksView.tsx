import React from 'react';
import type { Task, User, WorkspaceSettings } from '../../types';
import { getPriorityMeta, getStatusMeta, getDaysLeft } from '../../lib/utils';

interface MyTasksViewProps {
  user: User;
  filteredTasks: Task[];
  settings: WorkspaceSettings;
  myStats: Array<{ label: string; value: number; color: string }>;
  onSelectTask: (id: string) => void;
}

const MyTasksView: React.FC<MyTasksViewProps> = ({
  user,
  filteredTasks,
  settings,
  myStats,
  onSelectTask,
}) => {
  const myFiltered = filteredTasks.filter(t => t.assigneeId === user?.id);
  const awaitingAcceptance = myFiltered.filter(t => !t.acceptedAt);

  return (
    <>
      {/* Awaiting acceptance — new tasks the user hasn't acknowledged yet */}
      {awaitingAcceptance.length > 0 && (
        <div style={{ background: '#fff', border: '1px solid #bfdbfe', borderRadius: 14, padding: 20, marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            <span style={{ fontSize: 15 }}>🔔</span>
            <div style={{ fontSize: 15, fontWeight: 700, color: '#1e40af' }}>
              New — awaiting your acceptance ({awaitingAcceptance.length})
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {awaitingAcceptance.map(t => {
              const pri = getPriorityMeta(t.priority);
              const dl = getDaysLeft(t.due);
              return (
                <div
                  key={t.id}
                  onClick={() => onSelectTask(t.id)}
                  className="btn-hover"
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '11px 8px', borderRadius: 9, cursor: 'pointer',
                  }}
                >
                  <span style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: 11.5, color: '#9a9aa4', width: 72, flex: 'none',
                  }}>
                    {t.id}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {t.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: '#7a7a86', background: '#f1f1f5', padding: '1px 7px', borderRadius: 5 }}>
                        {t.tag}
                      </span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: pri.color, background: pri.bg, padding: '1px 7px', borderRadius: 5 }}>
                        {pri.label}
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: dl < 0 ? '#dc2626' : '#8a8a94', fontWeight: 600, flex: 'none' }}>
                    {dl < 0 ? `${-dl}d overdue` : dl === 0 ? 'Due today' : `${dl}d left`}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#1e40af', background: '#dbeafe', padding: '4px 12px', borderRadius: 20, flex: 'none' }}>
                    Open to accept →
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="mytasks-stats-grid" style={{ display: 'grid', gap: '16px', marginBottom: '20px' }}>
        {myStats.map(st => (
          <div
            key={st.label}
            style={{ background: '#fff', border: '1px solid #ececf1', borderRadius: '14px', padding: '18px' }}
          >
            <div style={{ fontSize: '12.5px', color: '#8a8a94', fontWeight: 600 }}>{st.label}</div>
            <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '8px', color: st.color }}>{st.value}</div>
          </div>
        ))}
      </div>

      {/* Tasks List */}
      <div style={{ background: '#fff', border: '1px solid #ececf1', borderRadius: '14px', padding: '8px' }}>
        {myFiltered.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#8a8a94', fontSize: '14px' }}>
            No tasks assigned to you yet.
          </div>
        ) : (
          myFiltered.map(item => {
            const sm = getStatusMeta(item.status);
            const pri = getPriorityMeta(item.priority);
            const dl = getDaysLeft(item.due);
            return (
              <div
                key={item.id}
                onClick={() => onSelectTask(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px',
                  borderBottom: '1px solid #f2f2f5',
                  cursor: 'pointer',
                }}
                className="btn-hover mytasks-list-item"
              >
                <span
                  className="mytasks-list-item-status-dot"
                  style={{ width: '9px', height: '9px', borderRadius: '50%', background: sm.color, flex: 'none' }}
                />
                <div style={{ flex: 1, minWidth: 0 }} className="mytasks-list-item-title-container">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: '11px',
                        color: '#a0a0aa',
                      }}
                    >
                      {item.id}
                    </span>
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
                  <div style={{ fontSize: '14px', fontWeight: 600, marginTop: '3px' }}>{item.title}</div>

                  {/* Mobile-only metadata */}
                  <div
                    className="mytasks-mobile-meta"
                    style={{ display: 'none', gap: '10px', alignItems: 'center', marginTop: '6px', flexWrap: 'wrap' }}
                  >
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        color: pri.color,
                        background: pri.bg,
                        padding: '2px 6px',
                        borderRadius: '4px',
                      }}
                    >
                      {pri.label}
                    </span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: item.status === 'done' ? '#059669' : dl < 0 ? '#dc2626' : '#8a8a94',
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
                    <div style={{ width: '80px', display: 'inline-block' }}>
                      <div
                        style={{ height: '5px', background: '#eef0f3', borderRadius: '4px', overflow: 'hidden' }}
                      >
                        <div
                          style={{ height: '100%', width: `${item.progress}%`, background: settings.accent }}
                        />
                      </div>
                    </div>
                    <span style={{ fontSize: '10px', color: '#8a8a94', fontWeight: 600 }}>{item.progress}%</span>
                  </div>
                </div>

                {/* Desktop-only metadata */}
                <span
                  className="mytasks-desktop-meta-priority"
                  style={{
                    fontSize: '10.5px',
                    fontWeight: 700,
                    color: pri.color,
                    background: pri.bg,
                    padding: '3px 9px',
                    borderRadius: '6px',
                    flex: 'none',
                  }}
                >
                  {pri.label}
                </span>
                <div className="mytasks-desktop-meta-progress" style={{ width: '130px', flex: 'none' }}>
                  <div style={{ height: '6px', background: '#eef0f3', borderRadius: '6px', overflow: 'hidden' }}>
                    <div
                      style={{ height: '100%', width: `${item.progress}%`, background: settings.accent }}
                    />
                  </div>
                </div>
                <span
                  className="mytasks-desktop-meta-due"
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: item.status === 'done' ? '#059669' : dl < 0 ? '#dc2626' : '#8a8a94',
                    width: '84px',
                    textAlign: 'right',
                    flex: 'none',
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
            );
          })
        )}
      </div>
    </>
  );
};

export default MyTasksView;
