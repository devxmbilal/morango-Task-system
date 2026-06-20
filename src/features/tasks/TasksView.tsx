import React from 'react';
import type { Task, WorkspaceSettings } from '../../types';
import { getInitials, getPriorityMeta, getStatusMeta, formatDate, getDaysLeft } from '../../lib/utils';

interface TasksViewProps {
  filteredTasks: Task[];
  members: any[];
  settings: WorkspaceSettings;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectTask: (id: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

const TasksView: React.FC<TasksViewProps> = ({
  filteredTasks,
  members,
  settings,
  searchQuery,
  onSearchChange,
  onSelectTask,
  onEditTask,
  onDeleteTask,
}) => {
  const getUserById = (id: string) => members.find(m => m.id === id);

  return (
    <div style={{ background: '#fff', border: '1px solid #ececf1', borderRadius: '14px', padding: '20px' }}>
      <div
        className="tasks-header-row"
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', gap: '16px' }}
      >
        <div style={{ fontSize: '15px', fontWeight: 700 }}>
          All Workspace Tasks ({filteredTasks.length})
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#f3f3f6',
            border: '1px solid #eaeaef',
            borderRadius: '10px',
            padding: '8px 12px',
            width: '260px',
            color: '#9a9aa4',
            fontSize: '13px',
          }}
        >
          <span style={{ fontSize: '13px' }}>⌕</span>
          <input
            type="text"
            placeholder="Search tasks..."
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
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #eef0f3', color: '#8a8a94', fontWeight: 700 }}>
              <th style={{ padding: '12px 8px' }}>ID</th>
              <th style={{ padding: '12px 8px' }}>Title</th>
              <th style={{ padding: '12px 8px' }}>Project</th>
              <th style={{ padding: '12px 8px' }}>Priority</th>
              <th style={{ padding: '12px 8px' }}>Status</th>
              <th style={{ padding: '12px 8px' }}>Progress</th>
              <th style={{ padding: '12px 8px' }}>Assignee</th>
              <th style={{ padding: '12px 8px' }}>Due Date</th>
              <th style={{ padding: '12px 8px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={9} style={{ padding: '24px', textAlign: 'center', color: '#8a8a94' }}>
                  No tasks found matching your search.
                </td>
              </tr>
            ) : (
              filteredTasks.map(item => {
                const assignee = getUserById(item.assigneeId);
                const sm = getStatusMeta(item.status);
                const pri = getPriorityMeta(item.priority);
                const dl = getDaysLeft(item.due);
                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid #eef0f3' }}>
                    <td
                      style={{
                        padding: '14px 8px',
                        fontFamily: "'IBM Plex Mono', monospace",
                        fontSize: '12px',
                        color: '#9a9aa4',
                      }}
                    >
                      {item.id}
                    </td>
                    <td
                      onClick={() => onSelectTask(item.id)}
                      style={{
                        padding: '14px 8px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        color: settings.accent,
                      }}
                    >
                      <span style={{ textDecoration: 'underline' }}>{item.title}</span>
                    </td>
                    <td style={{ padding: '14px 8px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 600,
                          color: '#7a7a86',
                          background: '#f1f1f5',
                          padding: '2px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        {item.tag}
                      </span>
                    </td>
                    <td style={{ padding: '14px 8px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: pri.color,
                          background: pri.bg,
                          padding: '2px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        {pri.label}
                      </span>
                    </td>
                    <td style={{ padding: '14px 8px' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: sm.color,
                          background: `color-mix(in srgb, ${sm.color} 12%, #fff)`,
                          padding: '3px 9px',
                          borderRadius: '20px',
                        }}
                      >
                        {sm.label}
                      </span>
                    </td>
                    <td style={{ padding: '14px 8px', width: '120px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div
                          style={{
                            flex: 1,
                            height: '6px',
                            background: '#eef0f3',
                            borderRadius: '6px',
                            overflow: 'hidden',
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
                        <span style={{ fontSize: '11.5px', color: '#8a8a94', fontWeight: 600 }}>
                          {item.progress}%
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 8px' }}>
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
                        <span>{assignee?.name || 'Unassigned'}</span>
                      </div>
                    </td>
                    <td
                      style={{
                        padding: '14px 8px',
                        fontWeight: 600,
                        color: item.status === 'done' ? '#059669' : dl < 0 ? '#dc2626' : '#8a8a94',
                      }}
                    >
                      {formatDate(item.due)}
                    </td>
                    <td style={{ padding: '14px 8px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => onEditTask(item)}
                          style={{
                            padding: '4px 8px',
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
                          onClick={() => onDeleteTask(item.id)}
                          style={{
                            padding: '4px 8px',
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
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TasksView;
