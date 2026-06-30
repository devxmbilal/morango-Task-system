import React, { useState } from 'react';
import type { Submission, SubmissionAttachment, WorkspaceSettings } from '../../../types';
import { api } from '../../../lib/api';
import { toastError, toastSuccess } from '../../../lib/toast';

interface Props {
  milestone: { title: string };          // minimal shape — accepts Milestone or a synthetic object
  existing?: Submission | null;          // when set, modal acts in edit-mode
  settings: WorkspaceSettings;
  onClose: () => void;
  onSubmit: (data: { description: string; links: string[]; attachments: SubmissionAttachment[] }) => Promise<{ ok: boolean }>;
}

const SubmitWorkModal: React.FC<Props> = ({ milestone, existing, settings, onClose, onSubmit }) => {
  const isEdit = !!existing;
  const [description, setDescription] = useState(existing?.description || '');
  const [linkInput, setLinkInput] = useState('');
  const [links, setLinks] = useState<string[]>(existing?.links ? [...existing.links] : []);
  const [attachments, setAttachments] = useState<SubmissionAttachment[]>(
    existing?.attachments ? existing.attachments.map(a => ({ ...a })) : []
  );
  const [busy, setBusy] = useState(false);

  const addLink = () => {
    const v = linkInput.trim();
    if (!v) return;
    setLinks(prev => [...prev, v]);
    setLinkInput('');
  };

  const removeLink = (i: number) => setLinks(prev => prev.filter((_, idx) => idx !== i));

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    for (const file of Array.from(e.target.files)) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const data = await api.upload('/upload', formData);
        setAttachments(prev => [...prev, { id: Date.now() + Math.random(), fileUrl: data.fileUrl, fileName: file.name }]);
        toastSuccess(`${file.name} uploaded`);
      } catch (err: any) {
        toastError(err.message || 'Upload failed');
      }
    }
    e.target.value = '';
  };

  const removeAttachment = (id: number) => setAttachments(prev => prev.filter(a => a.id !== id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    setBusy(true);
    const res = await onSubmit({ description: description.trim(), links, attachments });
    setBusy(false);
    if (res.ok) onClose();
  };

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(16,16,26,.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '32px', zIndex: 60, animation: 'tf-overlay .15s ease',
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto',
          background: '#fff', borderRadius: '18px', boxShadow: '0 10px 40px rgba(0,0,0,.2)',
          padding: '24px 26px', animation: 'tf-pop .2s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#8a8a94', textTransform: 'uppercase' }}>
              {isEdit ? 'Edit submission' : 'Submit work'}
            </div>
            <div style={{ fontSize: 18, fontWeight: 800, marginTop: 4 }}>{milestone.title}</div>
          </div>
          <button type="button" onClick={onClose} style={{ marginLeft: 'auto', width: 30, height: 30, border: 'none', background: '#f3f3f6', borderRadius: 8, cursor: 'pointer', fontSize: 16 }}>×</button>
        </div>

        {isEdit && (
          <div style={{ padding: '10px 12px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, fontSize: 12, color: '#92400e', marginBottom: 16 }}>
            You can edit this submission only while it's pending review and within 15 minutes of the original submission.
          </div>
        )}

        <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#44444e', marginBottom: 6 }}>
          Description / Notes <span style={{ color: '#dc2626' }}>*</span>
        </label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Briefly describe what you completed, any context for the reviewer, blockers, etc."
          required
          rows={5}
          style={{ width: '100%', padding: '10px 12px', border: '1px solid #e1e1e8', borderRadius: 9, fontSize: 13.5, outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 16 }}
        />

        <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#44444e', marginBottom: 6 }}>Links</label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input
            type="url"
            value={linkInput}
            onChange={e => setLinkInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addLink(); } }}
            placeholder="https://github.com/...   or   https://figma.com/..."
            style={{ flex: 1, padding: '9px 12px', border: '1px solid #e1e1e8', borderRadius: 9, fontSize: 13, outline: 'none' }}
          />
          <button type="button" onClick={addLink} style={{ padding: '9px 14px', border: '1px solid #e1e1e8', background: '#f6f7f9', borderRadius: 9, cursor: 'pointer', fontSize: 12.5, fontWeight: 700 }}>Add</button>
        </div>
        {links.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
            {links.map((l, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#f6f7f9', borderRadius: 8 }}>
                <span style={{ flex: 1, fontSize: 12.5, color: '#4f46e5', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l}</span>
                <button type="button" onClick={() => removeLink(i)} style={{ border: 'none', background: 'transparent', color: '#dc2626', cursor: 'pointer', fontSize: 14 }}>×</button>
              </div>
            ))}
          </div>
        )}

        <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#44444e', marginBottom: 6 }}>Attachments</label>
        <input
          type="file"
          multiple
          onChange={handleFileUpload}
          style={{ marginBottom: 8, fontSize: 12.5 }}
        />
        {attachments.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
            {attachments.map(a => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#f6f7f9', borderRadius: 8 }}>
                <span style={{ flex: 1, fontSize: 12.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.fileName || a.fileUrl}</span>
                <a href={a.fileUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11.5, color: '#4f46e5', fontWeight: 700 }}>view</a>
                <button type="button" onClick={() => removeAttachment(a.id)} style={{ border: 'none', background: 'transparent', color: '#dc2626', cursor: 'pointer', fontSize: 14 }}>×</button>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 22, borderTop: '1px solid #f2f2f5', paddingTop: 18 }}>
          <button type="button" onClick={onClose} style={{ padding: '10px 18px', border: '1px solid #e1e1e8', background: '#fff', borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#55555e' }}>Cancel</button>
          <button type="submit" disabled={busy || !description.trim()} style={{ padding: '10px 22px', border: 'none', background: settings.accent || '#4f46e5', color: '#fff', borderRadius: 9, cursor: busy ? 'wait' : 'pointer', fontSize: 13, fontWeight: 700, opacity: busy || !description.trim() ? 0.6 : 1 }}>
            {busy ? 'Saving…' : (isEdit ? 'Save Changes' : 'Submit for Review')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SubmitWorkModal;
