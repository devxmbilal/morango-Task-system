import React, { useEffect, useState } from 'react';
import type { Milestone, MilestoneStatus, Submission, User, WorkspaceSettings } from '../../../types';
import { SUBMISSION_EDIT_WINDOW_MS } from '../../../types';
import { formatDate } from '../../../lib/utils';

interface Props {
  milestones: Milestone[];
  user: User;
  taskAssigneeId: string;
  settings: WorkspaceSettings;
  onAddMilestone: () => void;
  onEditMilestone: (m: Milestone) => void;
  onDeleteMilestone: (m: Milestone) => void;
  onSubmitWork: (m: Milestone) => void;
  onEditSubmission: (s: Submission, m: Milestone) => void;
  onReviewSubmission: (s: Submission, m: Milestone) => void;
}

function formatRemaining(ms: number): string {
  if (ms <= 0) return 'expired';
  const totalSec = Math.floor(ms / 1000);
  const mm = Math.floor(totalSec / 60);
  const ss = totalSec % 60;
  return `${mm}:${ss.toString().padStart(2, '0')} left to edit`;
}

const STATUS_META: Record<MilestoneStatus, { label: string; color: string; bg: string }> = {
  pending:   { label: 'Assigned',        color: '#1e40af', bg: '#eff6ff' },
  submitted: { label: 'Awaiting Review', color: '#d97706', bg: '#fffbeb' },
  approved:  { label: 'Approved',        color: '#059669', bg: '#ecfdf5' },
  rejected:  { label: 'Rejected',        color: '#dc2626', bg: '#fef2f2' },
};

const SUB_STATUS_COLOR: Record<string, string> = {
  pending: '#d97706',
  approved: '#059669',
  rejected: '#dc2626',
};

const MilestonesSection: React.FC<Props> = ({
  milestones, user, taskAssigneeId, onAddMilestone,
  onEditMilestone, onDeleteMilestone, onSubmitWork, onEditSubmission, onReviewSubmission,
}) => {
  const [expandedHistory, setExpandedHistory] = useState<Record<number, boolean>>({});
  const [now, setNow] = useState<number>(Date.now());
  const isAdmin = !!user.perms?.permAllTasks;
  const isAssignee = user.id === taskAssigneeId;

  // Tick every 30s so edit-window countdown stays current
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30 * 1000);
    return () => clearInterval(t);
  }, []);

  const toggleHistory = (id: number) =>
    setExpandedHistory(p => ({ ...p, [id]: !p[id] }));

  return (
    <div style={{ borderTop: '1px solid #f2f2f5', paddingTop: 22, marginTop: 22 }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: '#44444e' }}>
          Sub-tasks ({milestones.length})
        </div>
        {isAdmin && (
          <button
            type="button"
            onClick={onAddMilestone}
            style={{ marginLeft: 'auto', padding: '6px 12px', fontSize: 11.5, fontWeight: 700, border: '1px solid #e1e1e8', background: '#fff', borderRadius: 8, cursor: 'pointer', color: '#4f46e5' }}
          >
            + Add Sub-task
          </button>
        )}
      </div>

      {milestones.length === 0 && (
        <div style={{ padding: 16, background: '#f9f9fb', borderRadius: 10, fontSize: 12.5, color: '#8a8a94', textAlign: 'center' }}>
          No sub-tasks yet.{isAdmin ? ' Click "Add Sub-task" to break this task into reviewable deliverables.' : ''}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {milestones.map(m => {
          const meta = STATUS_META[m.status];
          const latest = m.submissions[0]; // submissions are sorted desc by createdAt
          const history = m.submissions.slice(1);
          const canSubmit = isAssignee && m.status !== 'approved';
          const pendingForReview = isAdmin && latest && latest.status === 'pending';

          // Edit-window: owner + still pending + within 15 min of latest submission
          let canEditLatest = false;
          let editRemainingMs = 0;
          if (latest && latest.status === 'pending' && latest.userId === user.id) {
            editRemainingMs = SUBMISSION_EDIT_WINDOW_MS - (now - new Date(latest.createdAt).getTime());
            canEditLatest = editRemainingMs > 0;
          }

          return (
            <div key={m.id} style={{ border: '1px solid #ececf1', borderRadius: 12, padding: 14, background: '#fff' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: '#16161a' }}>{m.title}</span>
                    <span style={{ fontSize: 10.5, fontWeight: 700, color: meta.color, background: meta.bg, padding: '3px 9px', borderRadius: 6 }}>
                      {meta.label}
                    </span>
                    {m.dueDate && (
                      <span style={{ fontSize: 11, color: '#8a8a94' }}>due {formatDate(m.dueDate)}</span>
                    )}
                  </div>
                  {m.description && (
                    <div style={{ fontSize: 12.5, color: '#55555e', marginTop: 6, lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                      {m.description}
                    </div>
                  )}
                  {(m.links.length > 0 || m.attachments.length > 0) && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 8 }}>
                      {m.links.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          {m.links.map((l, i) => (
                            <a key={i} href={l} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11.5, color: '#4f46e5', wordBreak: 'break-all' }}>🔗 {l}</a>
                          ))}
                        </div>
                      )}
                      {m.attachments.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {m.attachments.map(a => (
                            <a key={a.id} href={a.fileUrl} target="_blank" rel="noopener noreferrer" style={{ padding: '4px 10px', background: '#f6f7f9', border: '1px solid #e1e1e8', borderRadius: 6, fontSize: 11.5, color: '#4f46e5', textDecoration: 'none', fontWeight: 600 }}>
                              📎 {a.fileName || 'file'}
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {isAdmin && (
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button type="button" onClick={() => onEditMilestone(m)} style={iconBtnStyle} title="Edit">✎</button>
                    <button type="button" onClick={() => onDeleteMilestone(m)} style={{ ...iconBtnStyle, color: '#dc2626' }} title="Delete">×</button>
                  </div>
                )}
              </div>

              {latest && <SubmissionCard s={latest} highlight={pendingForReview} />}

              <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                {/* New-submission button — hide while a submission is still awaiting review */}
                {canSubmit && (!latest || latest.status !== 'pending') && (
                  <button type="button" onClick={() => onSubmitWork(m)} style={primaryBtnStyle}>
                    {m.status === 'rejected' ? 'Resubmit' : (m.status === 'pending' ? 'Submit Work' : 'Submit Again')}
                  </button>
                )}
                {canEditLatest && latest && (
                  <>
                    <button type="button" onClick={() => onEditSubmission(latest, m)} style={{ ...primaryBtnStyle, background: '#fff', color: '#4f46e5', border: '1px solid #c7d2fe' }}>
                      Edit Submission
                    </button>
                    <span style={{ fontSize: 11, color: '#9a9aa4' }}>{formatRemaining(editRemainingMs)}</span>
                  </>
                )}
                {pendingForReview && (
                  <button type="button" onClick={() => onReviewSubmission(latest!, m)} style={{ ...primaryBtnStyle, background: '#0891b2' }}>
                    Review Submission
                  </button>
                )}
                {history.length > 0 && (
                  <button type="button" onClick={() => toggleHistory(m.id)} style={ghostBtnStyle}>
                    {expandedHistory[m.id] ? 'Hide' : 'Show'} history ({history.length})
                  </button>
                )}
              </div>

              {expandedHistory[m.id] && history.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
                  {history.map(s => <SubmissionCard key={s.id} s={s} compact />)}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

interface CardProps { s: Submission; highlight?: boolean; compact?: boolean; }
const SubmissionCard: React.FC<CardProps> = ({ s, highlight, compact }) => {
  const color = SUB_STATUS_COLOR[s.status] || '#6b6b76';
  return (
    <div style={{
      marginTop: 10, padding: compact ? 10 : 12,
      background: highlight ? '#fffbeb' : '#fafafb',
      border: `1px solid ${highlight ? '#fde68a' : '#ececf1'}`,
      borderRadius: 10,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12.5, fontWeight: 700 }}>{s.userName}</span>
        <span style={{ fontSize: 10.5, fontWeight: 700, color, textTransform: 'uppercase' }}>{s.status}</span>
        <span style={{ fontSize: 11, color: '#9a9aa4' }}>{s.createdTime}</span>
      </div>
      <div style={{ fontSize: 12.5, color: '#44444e', whiteSpace: 'pre-wrap', lineHeight: 1.5 }}>{s.description}</div>

      {s.links.length > 0 && (
        <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {s.links.map((l, i) => (
            <a key={i} href={l} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#4f46e5', wordBreak: 'break-all' }}>{l}</a>
          ))}
        </div>
      )}

      {s.attachments.length > 0 && (
        <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {s.attachments.map(a => (
            <a key={a.id} href={a.fileUrl} target="_blank" rel="noopener noreferrer" style={{ padding: '4px 10px', background: '#fff', border: '1px solid #e1e1e8', borderRadius: 6, fontSize: 11.5, color: '#4f46e5', textDecoration: 'none', fontWeight: 600 }}>
              📎 {a.fileName || 'file'}
            </a>
          ))}
        </div>
      )}

      {(s.status === 'approved' || s.status === 'rejected') && (s.reviewComment || s.reviewAttachments.length > 0) && (
        <div style={{ marginTop: 10, paddingTop: 8, borderTop: '1px dashed #ececf1' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color, textTransform: 'uppercase', marginBottom: 4 }}>
            {s.status === 'approved' ? 'Approved' : 'Rejected'} by {s.reviewedByName}
          </div>
          {s.reviewComment && (
            <div style={{ fontSize: 12.5, color: '#44444e', whiteSpace: 'pre-wrap' }}>{s.reviewComment}</div>
          )}
          {s.reviewAttachments.length > 0 && (
            <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {s.reviewAttachments.map(a => (
                <a key={a.id} href={a.fileUrl} target="_blank" rel="noopener noreferrer" style={{ padding: '4px 10px', background: '#fff', border: '1px solid #e1e1e8', borderRadius: 6, fontSize: 11.5, color, textDecoration: 'none', fontWeight: 600 }}>
                  📎 {a.fileName || 'review file'}
                </a>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const iconBtnStyle: React.CSSProperties = {
  width: 26, height: 26, border: '1px solid #ececf1', background: '#fff',
  borderRadius: 6, cursor: 'pointer', fontSize: 12, color: '#6b6b76',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
};

const primaryBtnStyle: React.CSSProperties = {
  padding: '7px 14px', border: 'none', background: '#4f46e5', color: '#fff',
  borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer',
};

const ghostBtnStyle: React.CSSProperties = {
  padding: '7px 12px', border: '1px solid #e1e1e8', background: '#fff', color: '#6b6b76',
  borderRadius: 8, fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
};

export default MilestonesSection;
