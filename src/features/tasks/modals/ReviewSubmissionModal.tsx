import React, { useState } from 'react';
import type { Submission, SubmissionAttachment, WorkspaceSettings } from '../../../types';
import { api } from '../../../lib/api';
import { toastError, toastSuccess } from '../../../lib/toast';

interface Props {
  submission: Submission;
  milestoneTitle: string;
  settings?: WorkspaceSettings;
  onClose: () => void;
  onReview: (
    action: 'approve' | 'reject',
    comment: string,
    reviewAttachments: SubmissionAttachment[]
  ) => Promise<{ ok: boolean }>;
}

const ReviewSubmissionModal: React.FC<Props> = ({ submission, milestoneTitle, onClose, onReview }) => {
  const [comment, setComment] = useState('');
  const [reviewAttachments, setReviewAttachments] = useState<SubmissionAttachment[]>([]);
  const [busy, setBusy] = useState(false);
  const [uploadingCount, setUploadingCount] = useState(0);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files);
    e.target.value = '';
    setUploadingCount(c => c + files.length);
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      try {
        const data = await api.upload('/upload', formData);
        setReviewAttachments(prev => [...prev, { id: Date.now() + Math.random(), fileUrl: data.fileUrl, fileName: file.name }]);
        toastSuccess(`${file.name} uploaded`);
      } catch (err: any) {
        toastError(err.message || 'Upload failed');
      } finally {
        setUploadingCount(c => c - 1);
      }
    }
  };

  const removeReviewAttachment = (id: number) =>
    setReviewAttachments(prev => prev.filter(a => a.id !== id));

  const handle = async (action: 'approve' | 'reject') => {
    if (action === 'reject' && !comment.trim()) {
      alert('Please add a comment explaining the rejection.');
      return;
    }
    setBusy(true);
    const res = await onReview(action, comment.trim(), reviewAttachments);
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
      <div
        style={{
          width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto',
          background: '#fff', borderRadius: '18px', boxShadow: '0 10px 40px rgba(0,0,0,.2)',
          padding: '24px 26px', animation: 'tf-pop .2s ease',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#8a8a94', textTransform: 'uppercase' }}>Review Submission</div>
            <div style={{ fontSize: 18, fontWeight: 800, marginTop: 4 }}>{milestoneTitle}</div>
          </div>
          <button type="button" onClick={onClose} style={{ marginLeft: 'auto', width: 30, height: 30, border: 'none', background: '#f3f3f6', borderRadius: 8, cursor: 'pointer', fontSize: 16 }}>×</button>
        </div>

        <div style={{ background: '#f6f7f9', borderRadius: 12, padding: 16, marginBottom: 18 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700 }}>{submission.userName}</span>
            <span style={{ fontSize: 11.5, color: '#9a9aa4' }}>{submission.createdTime}</span>
          </div>
          <div style={{ fontSize: 13.5, color: '#44444e', whiteSpace: 'pre-wrap', lineHeight: 1.55, marginBottom: 12 }}>
            {submission.description}
          </div>

          {submission.links.length > 0 && (
            <>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: '#8a8a94', textTransform: 'uppercase', marginBottom: 6 }}>Links</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
                {submission.links.map((l, i) => (
                  <a key={i} href={l} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12.5, color: '#4f46e5', wordBreak: 'break-all' }}>{l}</a>
                ))}
              </div>
            </>
          )}

          {submission.attachments.length > 0 && (
            <>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: '#8a8a94', textTransform: 'uppercase', marginBottom: 6 }}>Attachments</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {submission.attachments.map(a => (
                  <a key={a.id} href={a.fileUrl} target="_blank" rel="noopener noreferrer" style={{ padding: '6px 12px', background: '#fff', border: '1px solid #e1e1e8', borderRadius: 8, fontSize: 12, color: '#4f46e5', textDecoration: 'none', fontWeight: 600 }}>
                    📎 {a.fileName || 'file'}
                  </a>
                ))}
              </div>
            </>
          )}
        </div>

        <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#44444e', marginBottom: 6 }}>
          Comment <span style={{ color: '#9a9aa4', fontWeight: 500 }}>(required when rejecting)</span>
        </label>
        <textarea
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Add feedback for the developer…"
          rows={4}
          style={{ width: '100%', padding: '10px 12px', border: '1px solid #e1e1e8', borderRadius: 9, fontSize: 13.5, outline: 'none', resize: 'vertical', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 14 }}
        />

        <label style={{ display: 'block', fontSize: 12.5, fontWeight: 700, color: '#44444e', marginBottom: 6 }}>
          Attach review files <span style={{ color: '#9a9aa4', fontWeight: 500 }}>(annotated screenshots, references, etc.)</span>
        </label>
        <input type="file" multiple onChange={handleFileUpload} disabled={uploadingCount > 0} style={{ marginBottom: 8, fontSize: 12.5 }} />
        {uploadingCount > 0 && (
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 8, padding: '7px 12px', background: '#eef2ff', color: '#4f46e5', border: '1px solid #c7d2fe', borderRadius: 8, fontSize: 12.5, fontWeight: 700 }}>
            <span className="upload-spinner" />
            Uploading {uploadingCount} file{uploadingCount === 1 ? '' : 's'}…
          </div>
        )}
        {reviewAttachments.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
            {reviewAttachments.map(a => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#f6f7f9', borderRadius: 8 }}>
                <span style={{ flex: 1, fontSize: 12.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.fileName || a.fileUrl}</span>
                <a href={a.fileUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11.5, color: '#4f46e5', fontWeight: 700 }}>view</a>
                <button type="button" onClick={() => removeReviewAttachment(a.id)} style={{ border: 'none', background: 'transparent', color: '#dc2626', cursor: 'pointer', fontSize: 14 }}>×</button>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', borderTop: '1px solid #f2f2f5', paddingTop: 18, marginTop: 6 }}>
          <button type="button" onClick={onClose} disabled={busy} style={{ padding: '10px 18px', border: '1px solid #e1e1e8', background: '#fff', borderRadius: 9, cursor: 'pointer', fontSize: 13, fontWeight: 700, color: '#55555e' }}>Cancel</button>
          <button type="button" onClick={() => handle('reject')} disabled={busy || uploadingCount > 0} style={{ padding: '10px 18px', border: 'none', background: '#ef4444', color: '#fff', borderRadius: 9, cursor: busy || uploadingCount > 0 ? 'wait' : 'pointer', fontSize: 13, fontWeight: 700, opacity: busy || uploadingCount > 0 ? 0.6 : 1 }}>
            {uploadingCount > 0 ? 'Uploading…' : 'Reject'}
          </button>
          <button type="button" onClick={() => handle('approve')} disabled={busy || uploadingCount > 0} style={{ padding: '10px 22px', border: 'none', background: '#10b981', color: '#fff', borderRadius: 9, cursor: busy || uploadingCount > 0 ? 'wait' : 'pointer', fontSize: 13, fontWeight: 700, opacity: busy || uploadingCount > 0 ? 0.6 : 1 }}>
            {uploadingCount > 0 ? 'Uploading…' : 'Approve'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewSubmissionModal;
