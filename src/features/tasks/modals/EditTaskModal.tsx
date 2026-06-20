import React from 'react';
import type { Task, WorkspaceSettings } from '../../../types';

interface EditTaskModalProps {
  task: Task;
  members: any[];
  settings: WorkspaceSettings;
  editTaskForm: {
    title: string;
    desc: string;
    assigneeId: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    tag: string;
    due: string;
  };
  onFormChange: (form: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({
  members,
  settings,
  editTaskForm,
  onFormChange,
  onSubmit,
  onClose,
}) => {
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
        zIndex: 60,
        animation: 'tf-overlay .15s ease',
      }}
    >
      <form
        onSubmit={onSubmit}
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '580px',
          background: '#fff',
          borderRadius: '18px',
          padding: '26px',
          animation: 'tf-pop .2s ease',
        }}
      >
        <div style={{ fontSize: '18px', fontWeight: 800 }}>Edit Task</div>
        <div style={{ fontSize: '13px', color: '#8a8a94', marginTop: '4px', marginBottom: '20px' }}>
          Modify the task details below.
        </div>

        {/* Title */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>Title</label>
          <input
            value={editTaskForm.title}
            onChange={e => onFormChange({ ...editTaskForm, title: e.target.value })}
            style={{
              width: '100%',
              marginTop: '7px',
              padding: '11px 13px',
              border: '1px solid #e1e1e8',
              borderRadius: '10px',
              fontSize: '14px',
            }}
            required
          />
        </div>

        {/* Description */}
        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>Description</label>
          <textarea
            value={editTaskForm.desc}
            onChange={e => onFormChange({ ...editTaskForm, desc: e.target.value })}
            style={{
              width: '100%',
              marginTop: '7px',
              padding: '11px 13px',
              border: '1px solid #e1e1e8',
              borderRadius: '10px',
              fontSize: '14px',
              minHeight: '96px',
              resize: 'vertical',
            }}
          />
        </div>

        {/* Assignee & Priority */}
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}
        >
          <div>
            <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>Assign to</label>
            <select
              value={editTaskForm.assigneeId}
              onChange={e => onFormChange({ ...editTaskForm, assigneeId: e.target.value })}
              style={{
                width: '100%',
                marginTop: '7px',
                padding: '11px 13px',
                border: '1px solid #e1e1e8',
                borderRadius: '10px',
                fontSize: '14px',
                background: '#fff',
              }}
            >
              <option value="">Unassigned</option>
              {members.map(o => (
                <option key={o.id} value={o.id}>
                  {o.name} · {o.title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>Priority</label>
            <select
              value={editTaskForm.priority}
              onChange={e => onFormChange({ ...editTaskForm, priority: e.target.value as any })}
              style={{
                width: '100%',
                marginTop: '7px',
                padding: '11px 13px',
                border: '1px solid #e1e1e8',
                borderRadius: '10px',
                fontSize: '14px',
                background: '#fff',
              }}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* Project & Deadline */}
        <div
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '22px' }}
        >
          <div>
            <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>Project</label>
            <select
              value={editTaskForm.tag}
              onChange={e => onFormChange({ ...editTaskForm, tag: e.target.value })}
              style={{
                width: '100%',
                marginTop: '7px',
                padding: '11px 13px',
                border: '1px solid #e1e1e8',
                borderRadius: '10px',
                fontSize: '14px',
                background: '#fff',
              }}
            >
              <option value="Web Portal">Web Portal</option>
              <option value="Mobile App">Mobile App</option>
              <option value="Backend API">Backend API</option>
              <option value="DevOps">DevOps</option>
              <option value="QA">QA</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>Deadline</label>
            <input
              type="datetime-local"
              value={editTaskForm.due}
              onChange={e => onFormChange({ ...editTaskForm, due: e.target.value })}
              style={{
                width: '100%',
                marginTop: '7px',
                padding: '10px 13px',
                border: '1px solid #e1e1e8',
                borderRadius: '10px',
                fontSize: '14px',
                background: '#fff',
              }}
              required
            />
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '11px 18px',
              border: '1px solid #e1e1e8',
              borderRadius: '10px',
              background: '#fff',
              fontWeight: 700,
              fontSize: '13.5px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            type="submit"
            style={{
              padding: '11px 22px',
              border: 'none',
              borderRadius: '10px',
              background: settings.accent,
              color: '#fff',
              fontWeight: 700,
              fontSize: '13.5px',
              cursor: 'pointer',
            }}
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditTaskModal;
