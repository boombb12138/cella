import type { ErrorType } from 'backend/lib/errors';
import type { AppRoute } from 'backend/server';
import { config } from 'config';
import { hc } from 'hono/client';

// Custom error class to handle API errors
export class ApiError extends Error {
  status: string;
  type: string;
  severity: string;
  logId?: string;
  path?: string;
  method?: string;
  timestamp?: string;

  constructor(status: number | string, error: ErrorType) {
    super(error.message);
    this.status = String(status);
    this.type = error.type;
    this.severity = error.severity;
    this.logId = error.logId;
    this.path = error.path;
    this.method = error.method;
    this.timestamp = error.timestamp;
  }
}

// Create a Hono client to make requests to the backend
export const client = hc<AppRoute>(config.backendUrl, {
  fetch: (input: RequestInfo | URL, init?: RequestInit) =>
    fetch(input, {
      ...init,
      credentials: 'include',
    }),
});
