import React from 'react';
import type { PendingReview } from '../../types';

interface Props {
  pendingReviews: PendingReview[];
  onSelectTask: (taskId: string) => void;
}

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  return `${d}d ago`;
}

const PendingReviewsPanel: React.FC<Props> = ({ pendingReviews, onSelectTask }) => {
  return (
    <div style={{ background: '#fff', border: '1px solid #fde68a', borderRadius: 14, padding: 20, marginTop: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 15 }}>📝</span>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#92400e' }}>
          Pending reviews ({pendingReviews.length})
        </div>
      </div>

      {pendingReviews.length === 0 ? (
        <div style={{ fontSize: 12.5, color: '#8a8a94', textAlign: 'center', padding: '12px 0' }}>
          All caught up — no submissions waiting for review.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {pendingReviews.map(r => (
            <div
              key={r.id}
              onClick={() => onSelectTask(r.taskId)}
              className="btn-hover"
              style={{
                display: 'flex', alignItems: 'flex-start', gap: 12,
                padding: '11px 8px', borderRadius: 9, cursor: 'pointer',
              }}
            >
              <span style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: 11.5, color: '#9a9aa4', width: 72, flex: 'none', paddingTop: 2,
              }}>
                {r.taskId}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontSize: 13.5, fontWeight: 600,
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {r.milestoneTitle}
                </div>
                <div style={{ fontSize: 11.5, color: '#6b6b76', marginTop: 3 }}>
                  <span style={{ fontWeight: 600 }}>{r.userName}</span>
                  <span style={{ margin: '0 6px', color: '#cccccc' }}>·</span>
                  <span style={{
                    overflow: 'hidden', textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap', display: 'inline-block', maxWidth: 320, verticalAlign: 'bottom',
                  }}>
                    {r.taskTitle}
                  </span>
                </div>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700, color: '#92400e',
                background: '#fef3c7', padding: '3px 9px', borderRadius: 20, flex: 'none',
              }}>
                {timeAgo(r.createdAt)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingReviewsPanel;
