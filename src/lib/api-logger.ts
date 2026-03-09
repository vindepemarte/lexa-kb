/**
 * API Request/Response Logger
 * Provides structured logging for all API routes
 * Helps with debugging, monitoring, and incident response
 */

export interface ApiLogEntry {
  timestamp: string;
  method: string;
  path: string;
  statusCode: number;
  duration: number;
  userAgent?: string;
  ip?: string;
  userId?: string;
  error?: {
    message: string;
    stack?: string;
  };
  responseSize?: number;
}

const API_LOG_LEVELS = ['debug', 'info', 'warn', 'error'] as const;
type LogLevel = typeof API_LOG_LEVELS[number];

class ApiLogger {
  private isEnabled = process.env.ENABLE_API_LOGGING !== 'false';
  private minLevel: LogLevel = (process.env.API_LOG_LEVEL as LogLevel) || 'info';

  shouldLog(level: LogLevel): boolean {
    return this.isEnabled && API_LOG_LEVELS.indexOf(level) >= API_LOG_LEVELS.indexOf(this.minLevel);
  }

  log(level: LogLevel, entry: Omit<ApiLogEntry, 'timestamp'>) {
    if (!this.shouldLog(level)) return;

    const timestamp = new Date().toISOString();
    const logEntry = { ...entry, timestamp };

    switch (level) {
      case 'debug':
        console.debug('[API]', logEntry);
        break;
      case 'info':
        console.info('[API]', logEntry);
        break;
      case 'warn':
        console.warn('[API]', logEntry);
        break;
      case 'error':
        console.error('[API]', logEntry);
        break;
    }

    // In production, you could send logs to Vercel Analytics, Sentry, or a log aggregator
    if (process.env.NODE_ENV === 'production') {
      this.sendToLogService(logEntry);
    }
  }

  private sendToLogService(entry: ApiLogEntry) {
    // Example: Send to Vercel Analytics or external logging service
    // This would be configured based on your preferred logging solution
    if (typeof window === 'undefined') {
      // Server-side logging - send to your logging service
      // Example: sendToSentry(entry), sendToVercelAnalytics(entry), etc.
    }
  }

  // Convenience methods
  debug(entry: Omit<ApiLogEntry, 'timestamp'>) {
    this.log('debug', entry);
  }

  info(entry: Omit<ApiLogEntry, 'timestamp'>) {
    this.log('info', entry);
  }

  warn(entry: Omit<ApiLogEntry, 'timestamp'>) {
    this.log('warn', entry);
  }

  error(entry: Omit<ApiLogEntry, 'timestamp'>) {
    this.log('error', entry);
  }

  // Middleware helpers
  createRouteHandler(
    handler: (req: Request) => Promise<Response>,
    options: {
      path: string;
      requiresAuth?: boolean;
    }
  ) {
    return async (req: Request) => {
      const startTime = Date.now();
      const { method, headers, url } = req;

      try {
        const response = await handler(req);

        const duration = Date.now() - startTime;
        const size = response.headers.get('content-length') || '0';
        const userAgent = headers.get('user-agent');
        const ip = headers.get('x-forwarded-for') || headers.get('x-real-ip') || 'unknown';

        this.info({
          method,
          path: options.path,
          statusCode: response.status,
          duration,
          userAgent,
          ip,
          userId: await this.extractUserId(req),
          responseSize: parseInt(size),
        });

        return response;
      } catch (error) {
        const duration = Date.now() - startTime;
        const message = error instanceof Error ? error.message : 'Unknown error';
        const stack = error instanceof Error ? error.stack : undefined;

        this.error({
          method,
          path: options.path,
          statusCode: 500,
          duration,
          userAgent: headers.get('user-agent'),
          ip: headers.get('x-forwarded-for') || headers.get('x-real-ip') || 'unknown',
          userId: await this.extractUserId(req),
          error: { message, stack },
        });

        throw error;
      }
    };
  }

  private async extractUserId(req: Request): Promise<string | undefined> {
    // Extract user ID from session/token if available
    try {
      const authHeader = req.headers.get('authorization');
      if (!authHeader?.startsWith('Bearer ')) return undefined;

      // In a real app, you'd verify the token and extract the user ID
      // This is a placeholder for the actual implementation
      const token = authHeader.substring(7);
      // const decoded = await verifyToken(token);
      // return decoded.userId;
      return undefined;
    } catch {
      return undefined;
    }
  }
}

// Export singleton instance
export const apiLogger = new ApiLogger();

// Convenience function for route handlers
export function createApiRouteHandler(handler: (req: Request) => Promise<Response>) {
  return apiLogger.createRouteHandler(handler, { path: '/*' });
}

// Environment configuration
if (process.env.ENABLE_API_LOGGING === 'false') {
  apiLogger.setEnabled(false);
}
