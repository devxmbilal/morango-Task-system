import React, { useState } from 'react';
import type { Milestone, WorkspaceSettings } from '../../../types';
import { toLocalDatetimeString } from '../../../lib/utils';

interface Props {
  existing?: Milestone | null;
  settings: WorkspaceSettings;
  onClose: () => void;
  onSubmit: (form: { title: string; description: string; dueDate?: string }) => Promise<{ ok: boolean }>;
}

const MilestoneFormModal: React.FC<Props> = ({ existing, settings, onClose, onSubmit }) => {
  const [title, setTitle] = useState(existing?.title || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [dueDate, setDueDate] = useState(existing?.dueDate ? toLocalDatetimeString(existing.dueDate) : '');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setBusy(true);
    const res = await onSubmit({
      title: title.trim(),
      description: description.trim(),
      dueDate: dueDate || undefined,
    });
    setBusy(false);
    if (res.ok) onClose();
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(16,16,26,.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 32, zIndex: 60, animation: 'tf-overlay .15s ease',
      }}
    >
      <form
        onSubmit={submit}
        style={{
          width: '100%', maxWidth: 520, background: '#fff', borderRadius: 18,
          boxShadow: '0 10px 40px rgba(0,0,0,.2)', padding: '24px 26px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
          <div style={{ fontSize: 17, fontWeight: 800 }}>{existing ? 'Edit Milestone' : 'New Milestone'}</div>
          <button type="button" onClick={onClose} style={{ marginLeft: 'auto', width: 30, height: 30, border: 'none', background: '#f3f3f6', borderRadius: 8, cursor: 'pointer', fontSize: 16 }}>×</button>
        </div>

        <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#44444e', marginBottom: 6 }}>Title <span style={{ color: '#dc2626' }}>*</span></label>
        <input value={title} onChange={e => setTitle(e.target.value)} required placeholder="e.g. UI mockups complete"
          style={{ width: '100%', padding: '9px 12px', border: '1px solid #e1e1e8', borderRadius: 9, fontSize: 13.5, outline: 'none', marginBottom: 14, boxSizing: 'border-box' }} />

        <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#44444e', marginBottom: 6 }}>Description</label>
        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="What needs to be delivered for this milestone…"
          style={{ width: '100%', padding: '9px 12px', border: '1px solid #e1e1e8', borderRadius: 9, fontSize: 13.5, outline: 'none', resize: 'vertical', fontFamily: 'inherit', marginBottom: 14, boxSizing: 'border-box' }} />

        <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#44444e', marginBottom: 6 }}>Due date</label>
        <input type="datetime-local" value={dueDate} onChange={e => setDueDate(e.target.value)}
          style={{ width: '100%', padding: '9px 12px', border: '1px solid #e1e1e8', borderRadius: 9, fontSize: 13.5, outline: 'none', marginBottom: 18, boxSizing: 'border-box' }} />

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose} style={{ padding: '10px 18px', border: '1px solid #e1e1e8', background: '#fff', borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#55555e' }}>Cancel</button>
          <button type="submit" disabled={busy || !title.trim()} style={{ padding: '10px 22px', border: 'none', background: settings.accent || '#4f46e5', color: '#fff', borderRadius: 9, cursor: busy ? 'wait' : 'pointer', fontSize: 13, fontWeight: 700, opacity: busy || !title.trim() ? 0.6 : 1 }}>
            {busy ? 'Saving…' : (existing ? 'Save' : 'Add Milestone')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MilestoneFormModal;
