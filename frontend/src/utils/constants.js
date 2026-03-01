export const API_URL = import.meta.env.VITE_API_URL || '/api';

export const STRIPE_PUBLISHABLE_KEY =
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

export const ROLES = {
  CLIENT: 'client',
  PROVIDER: 'prestataire',
  ADMIN: 'admin',
};

export const REQUEST_STATUSES = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  REFUNDED: 'refunded',
};

export const SERVICE_CATEGORIES = [
  'Plomberie',
  'Électricité',
  'Jardinage',
  'Ménage',
  'Informatique',
  'Coiffure',
  'Livraison',
  'Babysitting',
  'Cours particuliers',
  'Rénovation',
  'Déménagement',
  'Photographie',
  'Cuisine',
  'Autre',
];

export const COLORS = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  success: '#10b981',
  danger: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',
  background: '#f8fafc',
  surface: '#ffffff',
  border: '#e2e8f0',
  textDark: '#1e293b',
  textLight: '#64748b',
  textMuted: '#94a3b8',
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
};

export const RATING_LABELS = {
  1: 'Très mauvais',
  2: 'Mauvais',
  3: 'Correct',
  4: 'Bon',
  5: 'Excellent',
};
