import React from 'react';
import type { WorkspaceSettings } from '../../types';

interface CreateTaskViewProps {
  members: any[];
  settings: WorkspaceSettings;
  taskForm: {
    title: string;
    desc: string;
    assigneeId: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    tag: string;
    due: string;
    images: string[];
  };
  onFormChange: (form: any) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const CreateTaskView: React.FC<CreateTaskViewProps> = ({
  members,
  settings,
  taskForm,
  onFormChange,
  onFileUpload,
  onRemoveImage,
  onSubmit,
  onCancel,
}) => {
  return (
    <div style={{ maxWidth: '780px' }}>
      <form
        onSubmit={onSubmit}
        style={{ background: '#fff', border: '1px solid #ececf1', borderRadius: '16px', padding: '28px' }}
      >
        <div style={{ fontSize: '17px', fontWeight: 800, marginBottom: '4px' }}>Create a new ticket</div>
        <div style={{ fontSize: '13px', color: '#8a8a94', marginBottom: '22px' }}>
          Assign it to a team member with a deadline and attachments.
        </div>

        {/* Title */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>Title</label>
          <input
            value={taskForm.title}
            onChange={e => onFormChange({ ...taskForm, title: e.target.value })}
            placeholder="e.g. Build responsive navbar"
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
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>Description</label>
          <textarea
            value={taskForm.desc}
            onChange={e => onFormChange({ ...taskForm, desc: e.target.value })}
            placeholder="Describe the task, acceptance criteria..."
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
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}
        >
          <div>
            <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>Assign to</label>
            <select
              value={taskForm.assigneeId}
              onChange={e => onFormChange({ ...taskForm, assigneeId: e.target.value })}
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
              value={taskForm.priority}
              onChange={e => onFormChange({ ...taskForm, priority: e.target.value as any })}
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
          style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}
        >
          <div>
            <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>Project</label>
            <select
              value={taskForm.tag}
              onChange={e => onFormChange({ ...taskForm, tag: e.target.value })}
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
              value={taskForm.due}
              onChange={e => onFormChange({ ...taskForm, due: e.target.value })}
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

        {/* Attachments */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>Attachments</label>
          <label
            style={{
              marginTop: '7px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              border: '1.5px dashed #d4d4dd',
              borderRadius: '12px',
              padding: '24px',
              cursor: 'pointer',
              background: '#fafafc',
            }}
            className="btn-hover"
          >
            <span style={{ fontSize: '20px', color: '#8a8a94' }}>☁</span>
            <span style={{ fontSize: '13px', fontWeight: 700 }}>Click to upload file</span>
            <span style={{ fontSize: '11.5px', color: '#a0a0aa' }}>Images, documents up to 10MB</span>
            <input type="file" multiple onChange={onFileUpload} style={{ display: 'none' }} />
          </label>

          {taskForm.images.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '12px' }}>
              {taskForm.images.map((src, i) => (
                <div
                  key={i}
                  style={{
                    position: 'relative',
                    width: '84px',
                    height: '84px',
                    borderRadius: '10px',
                    overflow: 'hidden',
                    border: '1px solid #e6e6ec',
                  }}
                >
                  <img
                    src={src}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    alt=""
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveImage(i)}
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      width: '20px',
                      height: '20px',
                      borderRadius: '6px',
                      border: 'none',
                      background: 'rgba(0,0,0,.6)',
                      color: '#fff',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div
          style={{
            display: 'flex',
            gap: '10px',
            justifyContent: 'flex-end',
            borderTop: '1px solid #f2f2f5',
            paddingTop: '20px',
          }}
        >
          <button
            type="button"
            onClick={onCancel}
            style={{
              padding: '11px 20px',
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
              padding: '11px 24px',
              border: 'none',
              borderRadius: '10px',
              background: settings.accent,
              color: '#fff',
              fontWeight: 700,
              fontSize: '13.5px',
              cursor: 'pointer',
            }}
          >
            Create ticket
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTaskView;
