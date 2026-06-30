import React, { useState } from 'react';
import type { MilestoneAttachment, WorkspaceSettings } from '../../types';
import MilestoneFormModal from './modals/MilestoneFormModal';

export interface NewSubtaskDraft {
  title: string;
  description: string;
  dueDate: string;
  links: string[];
  attachments: MilestoneAttachment[];
}

export interface NewTaskForm {
  title: string;
  desc: string;
  assigneeId: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tag: string;
  due: string;
  images: string[];
  referenceLinks: string[];
  milestones: NewSubtaskDraft[];
}

interface CreateTaskViewProps {
  members: any[];
  settings: WorkspaceSettings;
  taskForm: NewTaskForm;
  onFormChange: (form: NewTaskForm) => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const CreateTaskView: React.FC<CreateTaskViewProps> = ({
  members, settings, taskForm, onFormChange, onFileUpload, onRemoveImage, onSubmit, onCancel,
}) => {
  const [refLinkInput, setRefLinkInput] = useState('');
  const [subtaskModalOpen, setSubtaskModalOpen] = useState(false);

  const addRefLink = () => {
    const v = refLinkInput.trim();
    if (!v) return;
    onFormChange({ ...taskForm, referenceLinks: [...taskForm.referenceLinks, v] });
    setRefLinkInput('');
  };
  const removeRefLink = (i: number) =>
    onFormChange({ ...taskForm, referenceLinks: taskForm.referenceLinks.filter((_, idx) => idx !== i) });

  const handleSubtaskCreate = async (form: {
    title: string; description: string; dueDate?: string;
    links: string[]; attachments: MilestoneAttachment[];
  }) => {
    onFormChange({
      ...taskForm,
      milestones: [...taskForm.milestones, {
        title: form.title,
        description: form.description,
        dueDate: form.dueDate || '',
        links: form.links,
        attachments: form.attachments,
      }],
    });
    return { ok: true };
  };

  const removeSubtask = (idx: number) =>
    onFormChange({ ...taskForm, milestones: taskForm.milestones.filter((_, i) => i !== idx) });

  return (
    <div style={{ maxWidth: '780px' }}>
      <form onSubmit={onSubmit} style={{ background: '#fff', border: '1px solid #ececf1', borderRadius: '16px', padding: '28px' }}>
        <div style={{ fontSize: '17px', fontWeight: 800, marginBottom: '4px' }}>Create a new ticket</div>
        <div style={{ fontSize: '13px', color: '#8a8a94', marginBottom: '22px' }}>
          Assign it to a team member with a deadline, attachments, and optional sub-tasks.
        </div>

        {/* Title */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>Title</label>
          <input value={taskForm.title} onChange={e => onFormChange({ ...taskForm, title: e.target.value })}
            placeholder="e.g. Build responsive navbar"
            style={inputStyle} required />
        </div>

        {/* Description */}
        <div style={{ marginBottom: '16px' }}>
          <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>Description</label>
          <textarea value={taskForm.desc} onChange={e => onFormChange({ ...taskForm, desc: e.target.value })}
            placeholder="Describe the task, acceptance criteria..."
            style={{ ...inputStyle, minHeight: '96px', resize: 'vertical' }} />
        </div>

        {/* Assignee & Priority */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
          <div>
            <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>Assign to</label>
            <select value={taskForm.assigneeId} onChange={e => onFormChange({ ...taskForm, assigneeId: e.target.value })}
              style={{ ...inputStyle, background: '#fff' }}>
              {members.map(o => (
                <option key={o.id} value={o.id}>{o.name} · {o.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>Priority</label>
            <select value={taskForm.priority} onChange={e => onFormChange({ ...taskForm, priority: e.target.value as any })}
              style={{ ...inputStyle, background: '#fff' }}>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>
        </div>

        {/* Project & Deadline */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '18px' }}>
          <div>
            <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>Project</label>
            <select value={taskForm.tag} onChange={e => onFormChange({ ...taskForm, tag: e.target.value })}
              style={{ ...inputStyle, background: '#fff' }}>
              <option value="Web Portal">Web Portal</option>
              <option value="Mobile App">Mobile App</option>
              <option value="Backend API">Backend API</option>
              <option value="DevOps">DevOps</option>
              <option value="QA">QA</option>
              <option value="AI Creative">AI Creative</option>
              <option value="AI Automation">AI Automation</option>
              <option value="Digital Strategy">Digital Strategy</option>
              <option value="AI Labs">AI Labs</option>
              <option value="Events & Experiences">Events & Experiences</option>
            </select>
          </div>
          <div>
            <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>Deadline</label>
            <input type="datetime-local" value={taskForm.due}
              onChange={e => onFormChange({ ...taskForm, due: e.target.value })}
              style={{ ...inputStyle, background: '#fff' }} required />
          </div>
        </div>

        {/* Reference Links */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>Reference links</label>
          <div style={{ display: 'flex', gap: 8, marginTop: 7 }}>
            <input type="url" value={refLinkInput} onChange={e => setRefLinkInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addRefLink(); } }}
              placeholder="https://github.com/... or https://figma.com/..."
              style={{ flex: 1, padding: '10px 13px', border: '1px solid #e1e1e8', borderRadius: 10, fontSize: 13.5 }} />
            <button type="button" onClick={addRefLink} style={{ padding: '10px 16px', border: '1px solid #e1e1e8', background: '#f6f7f9', borderRadius: 10, cursor: 'pointer', fontSize: 12.5, fontWeight: 700 }}>Add</button>
          </div>
          {taskForm.referenceLinks.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
              {taskForm.referenceLinks.map((l, i) => (
                <div key={i} style={chipStyle}>
                  <span style={{ flex: 1, fontSize: 12.5, color: '#4f46e5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l}</span>
                  <button type="button" onClick={() => removeRefLink(i)} style={removeBtn}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Attachments */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>Attachments</label>
          <label style={dropZone} className="btn-hover">
            <span style={{ fontSize: '20px', color: '#8a8a94' }}>☁</span>
            <span style={{ fontSize: '13px', fontWeight: 700 }}>Click to upload file</span>
            <span style={{ fontSize: '11.5px', color: '#a0a0aa' }}>Images, documents up to 10MB</span>
            <input type="file" multiple onChange={onFileUpload} style={{ display: 'none' }} />
          </label>

          {taskForm.images.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '12px' }}>
              {taskForm.images.map((src, i) => (
                <div key={i} style={{ position: 'relative', width: 84, height: 84, borderRadius: 10, overflow: 'hidden', border: '1px solid #e6e6ec' }}>
                  <img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} alt="" />
                  <button type="button" onClick={() => onRemoveImage(i)}
                    style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: 6, border: 'none', background: 'rgba(0,0,0,.6)', color: '#fff', cursor: 'pointer', fontSize: 12 }}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sub-tasks */}
        <div style={{ marginBottom: 22, padding: 16, border: '1px dashed #e1e1e8', borderRadius: 12, background: '#fafafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#16161a' }}>
              Sub-tasks <span style={{ color: '#8a8a94', fontWeight: 500 }}>(optional)</span>
            </div>
            <button
              type="button"
              onClick={() => setSubtaskModalOpen(true)}
              style={{
                marginLeft: 'auto',
                padding: '7px 14px',
                border: '1px solid #c7d2fe',
                background: '#eef2ff',
                color: '#4f46e5',
                borderRadius: 8, cursor: 'pointer',
                fontSize: 12.5, fontWeight: 700,
              }}
            >
              + Add Sub-task
            </button>
          </div>
          <div style={{ fontSize: 11.5, color: '#8a8a94', marginBottom: 12 }}>
            Break the task into reviewable deliverables. Each one progresses independently and contributes to the task's progress bar.
          </div>

          {taskForm.milestones.length === 0 ? (
            <div style={{ padding: 14, background: '#fff', border: '1px dashed #e6e6ec', borderRadius: 10, fontSize: 12.5, color: '#9a9aa4', textAlign: 'center' }}>
              No sub-tasks added. Skip this — the assignee will be able to submit the task as a single deliverable.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {taskForm.milestones.map((s, i) => (
                <div key={i} style={{ background: '#fff', border: '1px solid #ececf1', borderRadius: 10, padding: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{i + 1}. {s.title}</div>
                      {s.description && <div style={{ fontSize: 12, color: '#55555e', marginTop: 4, whiteSpace: 'pre-wrap' }}>{s.description}</div>}
                      {s.dueDate && <div style={{ fontSize: 11, color: '#8a8a94', marginTop: 4 }}>due {new Date(s.dueDate).toLocaleString()}</div>}
                      {(s.links.length > 0 || s.attachments.length > 0) && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 6 }}>
                          {s.links.map((l, li) => (
                            <span key={li} style={{ fontSize: 11, color: '#4f46e5' }}>🔗 {l}</span>
                          ))}
                          {s.attachments.map(a => (
                            <span key={a.id} style={{ fontSize: 11, color: '#4f46e5' }}>📎 {a.fileName}</span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button type="button" onClick={() => removeSubtask(i)} style={removeBtn}>×</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', borderTop: '1px solid #f2f2f5', paddingTop: '20px' }}>
          <button type="button" onClick={onCancel}
            style={{ padding: '11px 20px', border: '1px solid #e1e1e8', borderRadius: 10, background: '#fff', fontWeight: 700, fontSize: 13.5, cursor: 'pointer' }}>
            Cancel
          </button>
          <button type="submit"
            style={{ padding: '11px 24px', border: 'none', borderRadius: 10, background: settings.accent, color: '#fff', fontWeight: 700, fontSize: 13.5, cursor: 'pointer' }}>
            Create ticket
          </button>
        </div>
      </form>

      {subtaskModalOpen && (
        <MilestoneFormModal
          settings={settings}
          onClose={() => setSubtaskModalOpen(false)}
          onSubmit={handleSubtaskCreate}
        />
      )}
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  marginTop: '7px',
  padding: '11px 13px',
  border: '1px solid #e1e1e8',
  borderRadius: '10px',
  fontSize: '14px',
  boxSizing: 'border-box',
};

const dropZone: React.CSSProperties = {
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
};

const chipStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8,
  padding: '6px 10px', background: '#f6f7f9', borderRadius: 8,
};

const removeBtn: React.CSSProperties = {
  border: 'none', background: 'transparent', color: '#dc2626',
  cursor: 'pointer', fontSize: 14, width: 22, height: 22,
};

export default CreateTaskView;
