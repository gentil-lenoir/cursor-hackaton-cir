import type { TaskCategory } from '../types';

export function formatPhoneDisplay(phone: string): string {
  return phone.replace(/(\+250)(\d{3})(\d{3})(\d{3})/, '$1 $2 $3 $4');
}

export function isValidRwandaPhone(phone: string): boolean {
  return /^\+250\d{9}$/.test(phone);
}

export function formatDate(iso?: string): string {
  if (!iso) return 'No due date';
  return new Date(iso).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function categoryLabel(category: TaskCategory): string {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

export function googleMapsUrl(latitude?: number, longitude?: number): string | null {
  if (latitude == null || longitude == null) return null;
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}
