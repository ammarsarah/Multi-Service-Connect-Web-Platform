import { format, formatDistanceToNow, parseISO } from 'date-fns';

export function formatCurrency(amount, currency = 'EUR') {
  if (amount == null) return '—';
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount);
}

export function formatDate(date, pattern = 'dd MMM yyyy') {
  if (!date) return '—';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return format(d, pattern);
  } catch {
    return '—';
  }
}

export function formatDateTime(date) {
  return formatDate(date, 'dd MMM yyyy, HH:mm');
}

export function formatRelativeTime(date) {
  if (!date) return '—';
  try {
    const d = typeof date === 'string' ? parseISO(date) : date;
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return '—';
  }
}

export function getStatusColor(status) {
  const map = {
    pending: '#f59e0b',
    accepted: '#6366f1',
    rejected: '#ef4444',
    completed: '#10b981',
    cancelled: '#64748b',
    active: '#10b981',
    inactive: '#64748b',
    success: '#10b981',
    failed: '#ef4444',
    refunded: '#8b5cf6',
    validated: '#10b981',
    banned: '#ef4444',
    suspended: '#f59e0b',
  };
  return map[status?.toLowerCase()] || '#64748b';
}

export function getStatusBg(status) {
  const map = {
    pending: '#fef3c7',
    accepted: '#ede9fe',
    rejected: '#fee2e2',
    completed: '#d1fae5',
    cancelled: '#f1f5f9',
    active: '#d1fae5',
    inactive: '#f1f5f9',
    success: '#d1fae5',
    failed: '#fee2e2',
    refunded: '#ede9fe',
    validated: '#d1fae5',
    banned: '#fee2e2',
    suspended: '#fef3c7',
  };
  return map[status?.toLowerCase()] || '#f1f5f9';
}

export function truncateText(text, length = 100) {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + '…';
}

export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function formatFileSize(bytes) {
  if (!bytes) return '0 B';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
}
