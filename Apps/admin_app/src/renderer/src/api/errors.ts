import axios from 'axios'
import { getApiBaseUrl } from '@/api/config'

export type AuthErrorCode = 'INVALID_CREDENTIALS' | 'INVALID_OTP' | 'NOT_ADMIN' | 'NETWORK_ERROR'

export class AuthError extends Error {
  readonly code: AuthErrorCode

  constructor(message: string, code: AuthErrorCode) {
    super(message)
    this.name = 'AuthError'
    this.code = code
  }
}

export function parseAuthError(error: unknown): AuthError {
  if (error instanceof AuthError) {
    return error
  }

  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    const serverMessage =
      typeof error.response?.data === 'object' &&
      error.response.data !== null &&
      'message' in error.response.data
        ? String((error.response.data as { message: string }).message)
        : null

    if (status === 401 || status === 422) {
      return new AuthError(
        serverMessage ?? 'Incorrect email or password.',
        status === 422 ? 'INVALID_CREDENTIALS' : 'INVALID_CREDENTIALS'
      )
    }

    if (status === 404) {
      return new AuthError(
        `API route not found (${getApiBaseUrl()}). Start the backend: npm run api:dev (repo root) or ./scripts/start-backend.sh`,
        'NETWORK_ERROR'
      )
    }

    if (!error.response) {
      return new AuthError(
        `Cannot reach the API at ${getApiBaseUrl()}. Start Laravel on port 8000 (see README).`,
        'NETWORK_ERROR'
      )
    }
  }

  if (error instanceof Error) {
    return new AuthError(error.message, 'NETWORK_ERROR')
  }

  return new AuthError('Login failed. Check your credentials and try again.', 'INVALID_CREDENTIALS')
}

export const PASSWORD_RESET_STEPS = [
  'Contact your system manager to reset your municipal manager password.',
  'For local development, run: php artisan tinker → User::where("email", "admin2004@gmail.com")->update(["password" => bcrypt("new-password")]);'
] as const
