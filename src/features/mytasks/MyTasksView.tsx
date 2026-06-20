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

  return (
    <>
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
