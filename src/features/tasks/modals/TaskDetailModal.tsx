import React from 'react';
import type { Task, WorkspaceSettings } from '../../../types';
import { getInitials, getPriorityMeta, getDaysLeft, formatDate } from '../../../lib/utils';

interface TaskDetailModalProps {
  task: Task;
  members: any[];
  settings: WorkspaceSettings;
  commentDraft: string;
  onClose: () => void;
  onMoveTask: (id: string, status: string) => void;
  onSetProgress: (id: string, p: number) => void;
  onCommentChange: (v: string) => void;
  onPostComment: () => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  task,
  members,
  settings,
  commentDraft,
  onClose,
  onMoveTask,
  onSetProgress,
  onCommentChange,
  onPostComment,
}) => {
  const getUserById = (id: string) => members.find(m => m.id === id);
  const assigneeUser = getUserById(task.assigneeId);
  const taskPriorityMeta = getPriorityMeta(task.priority);

  const timelineData = [
    {
      label: 'Created',
      date: formatDate(task.created),
      dot: '#4f46e5',
      ring: '#dfdcff',
      fg: '#16161a',
    },
    {
      label: task.start ? 'Assigned' : 'Unassigned',
      date: task.start ? formatDate(task.start) : 'pending',
      dot: task.start ? '#f59e0b' : '#d4d4dd',
      ring: task.start ? '#fdebc8' : '#eee',
      fg: task.start ? '#16161a' : '#9a9aa4',
    },
    {
      label: task.status === 'done' ? 'Completed' : 'Due',
      date: formatDate(task.due),
      dot: task.status === 'done' ? '#10b981' : '#dc2626',
      ring: task.status === 'done' ? '#c8f0d8' : '#fdd',
      fg: '#16161a',
    },
  ];

  const daysLeft = getDaysLeft(task.due);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(16,16,26,.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px',
        zIndex: 50,
        animation: 'tf-overlay .15s ease',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '820px',
          maxHeight: '88vh',
          overflowY: 'auto',
          background: '#fff',
          borderRadius: '18px',
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'tf-pop .2s ease',
        }}
      >
        {/* Modal Header */}
        <header
          style={{
            padding: '22px 26px',
            borderBottom: '1px solid #f0f0f3',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            position: 'sticky',
            top: 0,
            background: '#fff',
            zIndex: 10,
            borderRadius: '18px 18px 0 0',
          }}
        >
          <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: '12px', color: '#9a9aa4', fontWeight: 600 }}>
            {task.id}
          </span>
          <span
            style={{
              fontSize: '10.5px',
              fontWeight: 600,
              color: '#7a7a86',
              background: '#f1f1f5',
              padding: '3px 9px',
              borderRadius: '6px',
            }}
          >
            {task.tag}
          </span>
          <span
            style={{
              fontSize: '10.5px',
              fontWeight: 700,
              color: taskPriorityMeta.color,
              background: taskPriorityMeta.bg,
              padding: '3px 9px',
              borderRadius: '6px',
            }}
          >
            {taskPriorityMeta.label}
          </span>
          <button
            onClick={onClose}
            style={{
              marginLeft: 'auto',
              width: '30px',
              height: '30px',
              borderRadius: '8px',
              border: 'none',
              background: '#f3f3f6',
              cursor: 'pointer',
              fontSize: '16px',
              color: '#6b6b76',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            ×
          </button>
        </header>

        {/* Modal Body Grid */}
        <div className="modal-content-grid" style={{ display: 'grid', gap: 0 }}>
          {/* Left Column */}
          <div className="modal-left-column" style={{ padding: '24px 26px' }}>
            <div
              style={{
                fontSize: '20px',
                fontWeight: 800,
                lineHeight: 1.25,
                letterSpacing: '-0.01em',
                marginBottom: '18px',
              }}
            >
              {task.title}
            </div>

            {/* Status Buttons */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '22px' }}>
              {(['todo', 'inprogress', 'done'] as const).map(s => {
                const active = task.status === s;
                const colors: Record<string, string> = {
                  todo: '#64748b',
                  inprogress: '#f59e0b',
                  done: '#10b981',
                };
                const labels: Record<string, string> = {
                  todo: 'To Do',
                  inprogress: 'In Progress',
                  done: 'Done',
                };
                return (
                  <button
                    key={s}
                    onClick={() => onMoveTask(task.id, s)}
                    style={{
                      flex: 1,
                      padding: '9px',
                      borderRadius: '9px',
                      cursor: 'pointer',
                      fontWeight: 700,
                      fontSize: '12px',
                      border: `1px solid ${active ? colors[s] : '#e1e1e8'}`,
                      background: active ? colors[s] : '#fff',
                      color: active ? '#fff' : '#6b6b76',
                    }}
                  >
                    {labels[s]}
                  </button>
                );
              })}
            </div>

            {/* Description */}
            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e', marginBottom: '7px' }}>
              Description
            </div>
            <div
              style={{
                fontSize: '13.5px',
                color: '#55555e',
                lineHeight: 1.65,
                marginBottom: '22px',
                whiteSpace: 'pre-wrap',
              }}
            >
              {task.desc}
            </div>

            {/* Progress Slider */}
            <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e', marginBottom: '10px' }}>
              Progress — {task.progress}%
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={task.progress}
              onChange={e => onSetProgress(task.id, parseInt(e.target.value, 10))}
              style={{
                width: '100%',
                cursor: 'pointer',
                accentColor: settings.accent,
                marginBottom: '22px',
              }}
            />

            {/* Attachments */}
            {task.images.length > 0 && (
              <>
                <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e', marginBottom: '10px' }}>
                  Attachments
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '22px' }}>
                  {task.images.map((src, i) => (
                    <a
                      key={i}
                      href={src}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'block',
                        width: '104px',
                        height: '104px',
                        borderRadius: '11px',
                        overflow: 'hidden',
                        border: '1px solid #e6e6ec',
                      }}
                    >
                      <img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" />
                    </a>
                  ))}
                </div>
              </>
            )}

            {/* Comments */}
            <div style={{ borderTop: '1px solid #f2f2f5', paddingTop: '22px' }}>
              <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e', marginBottom: '12px' }}>
                Comments ({task.comments.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                {task.comments.map(c => (
                  <div key={c.id} style={{ display: 'flex', gap: '10px' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        background: '#94a3b8',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: '10.5px',
                        flex: 'none',
                        marginTop: '2px',
                      }}
                    >
                      {getInitials(c.author)}
                    </div>
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                        <span style={{ fontSize: '12.5px', fontWeight: 700 }}>{c.author}</span>
                        <span style={{ fontSize: '11px', color: '#a0a0aa' }}>{c.time}</span>
                      </div>
                      <div style={{ fontSize: '13px', color: '#55555e', lineHeight: 1.45 }}>{c.text}</div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Comment Input */}
              <div style={{ display: 'flex', gap: '9px', marginTop: '4px' }}>
                <input
                  value={commentDraft}
                  onChange={e => onCommentChange(e.target.value)}
                  placeholder="Add a comment…"
                  style={{
                    flex: 1,
                    padding: '9px 12px',
                    border: '1px solid #e1e1e8',
                    borderRadius: '9px',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
                <button
                  onClick={onPostComment}
                  style={{
                    padding: '9px 15px',
                    border: 'none',
                    borderRadius: '9px',
                    background: settings.accent,
                    color: '#fff',
                    fontWeight: 700,
                    fontSize: '12.5px',
                    cursor: 'pointer',
                  }}
                >
                  Post
                </button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div
            className="modal-right-column"
            style={{
              padding: '24px 24px',
              background: '#fbfbfc',
              display: 'flex',
              flexDirection: 'column',
              gap: '22px',
            }}
          >
            {/* Assignee */}
            <div>
              <div
                style={{
                  fontSize: '11.5px',
                  fontWeight: 700,
                  color: '#8a8a94',
                  textTransform: 'uppercase',
                  letterSpacing: '.04em',
                  marginBottom: '8px',
                }}
              >
                Assignee
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '10px',
                    background: assigneeUser?.color || '#94a3b8',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '12px',
                  }}
                >
                  {getInitials(assigneeUser?.name || '?')}
                </div>
                <div>
                  <div style={{ fontSize: '13.5px', fontWeight: 700 }}>{assigneeUser?.name || 'Unassigned'}</div>
                  <div style={{ fontSize: '11.5px', color: '#8a8a94' }}>{assigneeUser?.title || ''}</div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div>
              <div
                style={{
                  fontSize: '11.5px',
                  fontWeight: 700,
                  color: '#8a8a94',
                  textTransform: 'uppercase',
                  letterSpacing: '.04em',
                  marginBottom: '12px',
                }}
              >
                Timeline
              </div>
              <div style={{ position: 'relative', paddingLeft: '6px' }}>
                {timelineData.map((tl, i) => (
                  <div key={i} style={{ display: 'flex', gap: '12px', paddingBottom: '16px', position: 'relative' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: tl.dot,
                          border: `2px solid ${tl.ring}`,
                          flex: 'none',
                          zIndex: 1,
                        }}
                      />
                      {i < timelineData.length - 1 && (
                        <div
                          style={{
                            width: '2px',
                            flex: 1,
                            background: '#e6e6ec',
                            minHeight: '16px',
                          }}
                        />
                      )}
                    </div>
                    <div style={{ marginTop: '-2px' }}>
                      <div style={{ fontSize: '12.5px', fontWeight: 700, color: tl.fg }}>{tl.label}</div>
                      <div style={{ fontSize: '11.5px', color: '#9a9aa4' }}>{tl.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Deadline & Complete */}
            <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
              <div
                style={{
                  flex: 1,
                  background: '#fff',
                  border: '1px solid #ececf1',
                  borderRadius: '10px',
                  padding: '11px',
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: '16px',
                    fontWeight: 800,
                    color:
                      task.status === 'done'
                        ? '#059669'
                        : daysLeft < 0
                        ? '#dc2626'
                        : '#8a8a94',
                  }}
                >
                  {task.status === 'done'
                    ? 'Done'
                    : daysLeft < 0
                    ? `${-daysLeft}d overdue`
                    : daysLeft === 0
                    ? 'Today'
                    : `${daysLeft}d left`}
                </div>
                <div style={{ fontSize: '10.5px', color: '#9a9aa4', fontWeight: 600 }}>Deadline</div>
              </div>
              <div
                style={{
                  flex: 1,
                  background: '#fff',
                  border: '1px solid #ececf1',
                  borderRadius: '10px',
                  padding: '11px',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '16px', fontWeight: 800 }}>{task.progress}%</div>
                <div style={{ fontSize: '10.5px', color: '#9a9aa4', fontWeight: 600 }}>Complete</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetailModal;
