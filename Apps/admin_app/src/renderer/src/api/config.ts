/** API base URL — set via VITE_API_BASE_URL (e.g. http://192.168.10.211:8000/api). */
export function getApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_BASE_URL?.trim()

  if (configured) {
    return configured.replace(/\/$/, '')
  }

  return 'http://127.0.0.1:8000/api'
}

export const ADMIN_API_ROLES = ['municipal_manager', 'system_manager'] as const

export function isAdminApiRole(role: string): boolean {
  return (ADMIN_API_ROLES as readonly string[]).includes(role)
}
