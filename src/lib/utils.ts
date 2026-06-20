// ============================================================
//  Shared Helper / Utility Functions
// ============================================================

/** Returns 1-2 uppercase initials from a name string. */
export const getInitials = (name: string): string =>
  (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

/** Formats an ISO date string to "Jun 19 10:30" or "Jun 19". */
export const formatDate = (iso: string): string => {
  if (!iso) return '—';
  const hasTime = iso.includes('T');
  const d = hasTime ? new Date(iso) : new Date(iso + 'T00:00:00');
  if (isNaN(d.getTime())) return '—';
  if (hasTime) {
    return (
      d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
      ' ' +
      d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    );
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/** Converts an ISO date string to a local datetime-local input value. */
export const toLocalDatetimeString = (iso: string): string => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

/** Returns days remaining until due date (negative = overdue). */
export const getDaysLeft = (iso: string): number => {
  if (!iso) return 0;
  const d = new Date(iso);
  const t = new Date('2026-06-19T00:00:00');
  return Math.round((d.getTime() - t.getTime()) / 86400000);
};

/** Returns label, color, and background for a given priority key. */
export const getPriorityMeta = (p: string): { label: string; color: string; bg: string } => {
  const meta: Record<string, { label: string; color: string; bg: string }> = {
    low: { label: 'Low', color: '#64748b', bg: '#f1f5f9' },
    medium: { label: 'Medium', color: '#0891b2', bg: '#ecfeff' },
    high: { label: 'High', color: '#d97706', bg: '#fffbeb' },
    urgent: { label: 'Urgent', color: '#dc2626', bg: '#fef2f2' },
  };
  return meta[p] || { label: p, color: '#64748b', bg: '#f1f5f9' };
};

/** Returns label and color for a given status key. */
export const getStatusMeta = (s: string): { label: string; color: string } => {
  const meta: Record<string, { label: string; color: string }> = {
    todo: { label: 'To Do', color: '#94a3b8' },
    inprogress: { label: 'In Progress', color: '#f59e0b' },
    done: { label: 'Done', color: '#10b981' },
  };
  return meta[s] || { label: s, color: '#94a3b8' };
};
