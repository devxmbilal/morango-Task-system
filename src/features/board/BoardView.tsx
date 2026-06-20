import React from 'react';
import type { Task, WorkspaceSettings } from '../../types';
import { getInitials, getPriorityMeta, getDaysLeft } from '../../lib/utils';

interface BoardViewProps {
  columns: Array<{
    key: string;
    label: string;
    color: string;
    count: number;
    tasks: Task[];
    empty: boolean;
  }>;
  members: any[];
  settings: WorkspaceSettings;
  dragId: string | null;
  onDragStart: (id: string) => void;
  onDrop: (status: string) => void;
  onSelectTask: (id: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const BoardView: React.FC<BoardViewProps> = ({
  columns,
  members,
  settings,
  onDragStart,
  onDrop,
  onSelectTask,
  searchQuery,
  onSearchChange,
}) => {
  const getUserById = (id: string) => members.find(m => m.id === id);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%', width: '100%' }}>
      {/* Board Search Bar */}
      <div style={{ display: 'flex', alignItems: 'center', background: '#fff', border: '1px solid #ececf1', borderRadius: '12px', padding: '10px 14px', maxWidth: '360px', width: '100%' }}>
        <span style={{ marginRight: '8px', fontSize: '15px', color: '#8a8a94' }}>🔍</span>
        <input
          type="text"
          placeholder="Search board tickets..."
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          style={{
            border: 'none',
            outline: 'none',
            fontSize: '13.5px',
            width: '100%',
            background: 'transparent',
          }}
        />
      </div>

      <div className="board-container" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', width: '100%' }}>
      {columns.map(col => (
        <div
          key={col.key}
          onDragOver={e => e.preventDefault()}
          onDrop={() => onDrop(col.key)}
          style={{
            flex: 1,
            minWidth: '280px',
            background: '#eef0f3',
            borderRadius: '14px',
            padding: '12px',
          }}
        >
          {/* Column Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 6px 12px' }}>
            <span style={{ width: '9px', height: '9px', borderRadius: '3px', background: col.color }} />
            <span style={{ fontSize: '13.5px', fontWeight: 700 }}>{col.label}</span>
            <span
              style={{
                fontSize: '11.5px',
                fontWeight: 700,
                color: '#8a8a94',
                background: '#fff',
                padding: '1px 8px',
                borderRadius: '20px',
              }}
            >
              {col.count}
            </span>
          </div>

          {/* Task Cards */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {col.tasks.map(item => {
              const assignee = getUserById(item.assigneeId);
              const pri = getPriorityMeta(item.priority);
              const dl = getDaysLeft(item.due);
              return (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => onDragStart(item.id)}
                  onClick={() => onSelectTask(item.id)}
                  style={{
                    background: '#fff',
                    border: '1px solid #ececf1',
                    borderRadius: '12px',
                    padding: '13px',
                    marginBottom: '10px',
                    cursor: 'pointer',
                    boxShadow: '0 1px 2px rgba(16,16,26,.05)',
                  }}
                  className="card-hover"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '9px' }}>
                    <span
                      style={{
                        fontSize: '10.5px',
                        fontWeight: 700,
                        color: settings.accent,
                        background: `color-mix(in srgb, ${settings.accent} 10%, #fff)`,
                        padding: '2px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      #{item.id.replace('TASK-', '')}
                    </span>
                    <span
                      style={{
                        fontSize: '10.5px',
                        fontWeight: 600,
                        color: '#7a7a86',
                        background: '#f1f1f5',
                        padding: '2px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      {item.tag}
                    </span>
                    <span
                      style={{
                        fontSize: '10.5px',
                        fontWeight: 700,
                        color: pri.color,
                        background: pri.bg,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        marginLeft: 'auto',
                      }}
                    >
                      {pri.label}
                    </span>
                  </div>
                  <div style={{ fontSize: '13.5px', fontWeight: 600, lineHeight: 1.35, marginBottom: '11px' }}>
                    {item.title}
                  </div>
                  {item.images.length > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '11px',
                        color: '#8a8a94',
                        marginBottom: '10px',
                      }}
                    >
                      <span
                        style={{
                          width: '13px',
                          height: '13px',
                          border: '1.4px solid #b8b8c0',
                          borderRadius: '3px',
                          display: 'inline-block',
                        }}
                      />
                      {item.images.length} attachment(s)
                    </div>
                  )}
                  <div
                    style={{
                      height: '6px',
                      background: '#eef0f3',
                      borderRadius: '6px',
                      overflow: 'hidden',
                      marginBottom: '11px',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${item.progress}%`,
                        background: settings.accent,
                        borderRadius: '6px',
                      }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
                      }}
                    >
                      {getInitials(assignee?.name || '?')}
                    </div>
                    <span
                      style={{
                        fontSize: '11.5px',
                        color: '#8a8a94',
                        flex: 1,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {assignee?.name || 'Unassigned'}
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
                  </div>
                </div>
              );
            })}
            {col.empty && (
              <div
                style={{
                  textAlign: 'center',
                  padding: '18px 8px',
                  color: '#a8a8b0',
                  fontSize: '12px',
                  border: '1.5px dashed #d8d8e0',
                  borderRadius: '11px',
                }}
              >
                Drop tickets here
              </div>
            )}
          </div>
        </div>
      ))}
      </div>
    </div>
  );
};

export default BoardView;
