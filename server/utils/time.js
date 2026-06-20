// Helper for formatting time relative to now (e.g. "2d ago", "1d ago")
function formatRelativeTime(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return interval + 'y ago';
  
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return interval + 'mo ago';
  
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return interval + 'd ago';
  
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return interval + 'h ago';
  
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return interval + 'm ago';
  
  return 'just now';
}

module.exports = {
  formatRelativeTime
};
