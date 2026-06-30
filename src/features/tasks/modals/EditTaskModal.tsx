import React, { useState } from 'react';
import type { Task, WorkspaceSettings } from '../../../types';
import { api } from '../../../lib/api';
import { toastError, toastSuccess } from '../../../lib/toast';

export interface EditTaskFormShape {
  title: string;
  desc: string;
  assigneeId: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  tag: string;
  due: string;
  referenceLinks: string[];
  images: string[];
}

interface EditTaskModalProps {
  task: Task;
  members: any[];
  settings: WorkspaceSettings;
  editTaskForm: EditTaskFormShape;
  onFormChange: (form: EditTaskFormShape) => void;
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
  const [refLinkInput, setRefLinkInput] = useState('');
  const [uploadingCount, setUploadingCount] = useState(0);

  const addRefLink = () => {
    const v = refLinkInput.trim();
    if (!v) return;
    onFormChange({ ...editTaskForm, referenceLinks: [...editTaskForm.referenceLinks, v] });
    setRefLinkInput('');
  };
  const removeRefLink = (i: number) =>
    onFormChange({ ...editTaskForm, referenceLinks: editTaskForm.referenceLinks.filter((_, idx) => idx !== i) });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    e.target.value = '';
    setUploadingCount(c => c + files.length);
    // Accumulate new URLs locally so sequential uploads don't overwrite each other
    // via stale closures over editTaskForm.
    const newlyUploaded: string[] = [];
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const data = await api.upload('/upload', formData);
        newlyUploaded.push(data.fileUrl);
        toastSuccess(`${file.name} uploaded`);
      } catch (err: any) {
        toastError(err.message || 'Upload failed');
      } finally {
        setUploadingCount(c => c - 1);
      }
    }
    if (newlyUploaded.length > 0) {
      onFormChange({ ...editTaskForm, images: [...editTaskForm.images, ...newlyUploaded] });
    }
  };

  const removeImage = (i: number) =>
    onFormChange({ ...editTaskForm, images: editTaskForm.images.filter((_, idx) => idx !== i) });

  const isImage = (url: string) => /\.(png|jpe?g|gif|webp|svg|bmp|avif)(\?|$)/i.test(url);

  return (
    <div
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
        style={{
          width: '100%',
          maxWidth: '580px',
          maxHeight: '90vh',
          overflowY: 'auto',
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
              <option value="AI Creative">AI Creative</option>
              <option value="AI Automation">AI Automation</option>
              <option value="Digital Strategy">Digital Strategy</option>
              <option value="AI Labs">AI Labs</option>
              <option value="Events & Experiences">Events & Experiences</option>
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

        {/* Attachments */}
        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>Attachments</label>
          <label
            style={{
              marginTop: 7, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 6,
              border: '1.5px dashed #d4d4dd', borderRadius: 12, padding: 18,
              cursor: uploadingCount > 0 ? 'wait' : 'pointer',
              background: '#fafafc', opacity: uploadingCount > 0 ? 0.7 : 1,
            }}
            className="btn-hover"
          >
            <span style={{ fontSize: 18, color: '#8a8a94' }}>☁</span>
            <span style={{ fontSize: 13, fontWeight: 700 }}>Click to upload file</span>
            <span style={{ fontSize: 11.5, color: '#a0a0aa' }}>Images, documents up to 25MB</span>
            <input type="file" multiple onChange={handleFileUpload} disabled={uploadingCount > 0} style={{ display: 'none' }} />
          </label>

          {uploadingCount > 0 && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 10, padding: '7px 12px', background: '#eef2ff', color: '#4f46e5', border: '1px solid #c7d2fe', borderRadius: 8, fontSize: 12.5, fontWeight: 700 }}>
              <span className="upload-spinner" />
              Uploading {uploadingCount} file{uploadingCount === 1 ? '' : 's'}…
            </div>
          )}

          {editTaskForm.images.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 12 }}>
              {editTaskForm.images.map((src, i) => (
                <div key={i} style={{ position: 'relative', width: 84, height: 84, borderRadius: 10, overflow: 'hidden', border: '1px solid #e6e6ec', background: '#fff' }}>
                  {isImage(src) ? (
                    <img src={src} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} alt="" />
                  ) : (
                    <a href={src} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', textDecoration: 'none', color: '#4f46e5', fontSize: 11, fontWeight: 700, padding: 6, textAlign: 'center', wordBreak: 'break-all' }}>
                      📎 file
                    </a>
                  )}
                  <button type="button" onClick={() => removeImage(i)}
                    style={{ position: 'absolute', top: 4, right: 4, width: 20, height: 20, borderRadius: 6, border: 'none', background: 'rgba(0,0,0,.6)', color: '#fff', cursor: 'pointer', fontSize: 12 }}>×</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Reference Links */}
        <div style={{ marginBottom: 22 }}>
          <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#44444e' }}>Reference links</label>
          <div style={{ display: 'flex', gap: 8, marginTop: 7 }}>
            <input
              type="url"
              value={refLinkInput}
              onChange={e => setRefLinkInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addRefLink(); } }}
              placeholder="https://github.com/... or https://figma.com/..."
              style={{ flex: 1, padding: '10px 13px', border: '1px solid #e1e1e8', borderRadius: 10, fontSize: 13.5 }}
            />
            <button
              type="button"
              onClick={addRefLink}
              style={{ padding: '10px 16px', border: '1px solid #e1e1e8', background: '#f6f7f9', borderRadius: 10, cursor: 'pointer', fontSize: 12.5, fontWeight: 700 }}
            >
              Add
            </button>
          </div>
          {editTaskForm.referenceLinks.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
              {editTaskForm.referenceLinks.map((l, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: '#f6f7f9', borderRadius: 8 }}>
                  <span style={{ flex: 1, fontSize: 12.5, color: '#4f46e5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l}</span>
                  <button
                    type="button"
                    onClick={() => removeRefLink(i)}
                    style={{ border: 'none', background: 'transparent', color: '#dc2626', cursor: 'pointer', fontSize: 14, width: 22, height: 22 }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
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
            disabled={uploadingCount > 0}
            style={{
              padding: '11px 22px',
              border: 'none',
              borderRadius: '10px',
              background: settings.accent,
              color: '#fff',
              fontWeight: 700,
              fontSize: '13.5px',
              cursor: uploadingCount > 0 ? 'wait' : 'pointer',
              opacity: uploadingCount > 0 ? 0.6 : 1,
            }}
          >
            {uploadingCount > 0 ? 'Uploading…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditTaskModal;
