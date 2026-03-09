/**
 * API Middleware
 * Wraps API routes with automatic logging and error handling
 */

import { NextRequest, NextResponse } from 'next/server';
import { apiLogger } from './api-logger';

export interface ApiHandlerOptions {
  path: string;
  requiresAuth?: boolean;
  allowedMethods?: string[];
}

/**
 * Create an API route handler with automatic logging
 */
export function createApiHandler<TRequest extends Record<string, unknown>>(
  handler: (req: NextRequest, data: TRequest) => Promise<NextResponse>,
  options: ApiHandlerOptions
) {
  return async (req: NextRequest) => {
    // Validate HTTP method if specified
    if (options.allowedMethods && !options.allowedMethods.includes(req.method)) {
      return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
      );
    }

    // Validate auth if required
    if (options.requiresAuth) {
      const authHeader = req.headers.get('authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    const startTime = Date.now();
    const { method, headers, url } = req;

    try {
      // Parse request body if it's JSON
      let requestData: TRequest;
      const contentType = headers.get('content-type');

      if (contentType?.includes('application/json')) {
        requestData = await req.json();
      } else {
        requestData = {} as TRequest;
      }

      // Call the actual handler
      const response = await handler(req, requestData);
      const duration = Date.now() - startTime;
      const size = response.headers.get('content-length') || '0';
      const userAgent = headers.get('user-agent');
      const ip = headers.get('x-forwarded-for') || headers.get('x-real-ip') || 'unknown';

      // Log successful request
      apiLogger.info({
        method,
        path: options.path,
        statusCode: response.status,
        duration,
        userAgent,
        ip,
        userId: await extractUserId(req),
        responseSize: parseInt(size),
      });

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      const message = error instanceof Error ? error.message : 'Unknown error';
      const stack = error instanceof Error ? error.stack : undefined;

      // Log error
      apiLogger.error({
        method,
        path: options.path,
        statusCode: 500,
        duration,
        userAgent: req.headers.get('user-agent'),
        ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown',
        userId: await extractUserId(req),
        error: { message, stack },
      });

      // Return error response
      return NextResponse.json(
        {
          error: 'Internal server error',
          message,
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Helper to extract user ID from request
 */
async function extractUserId(req: NextRequest): Promise<string | undefined> {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) return undefined;

    const token = authHeader.substring(7);
    // In a real app, verify token and extract user ID
    // const decoded = await verifyToken(token);
    // return decoded.userId;

    // For demo purposes, return a mock user ID
    if (process.env.NODE_ENV === 'test') {
      return 'test-user';
    }
    return undefined;
  } catch {
    return undefined;
  }
}

/**
 * Middleware for authentication
 */
export function requireAuth() {
  return async (req: NextRequest, data: unknown) => {
    const authHeader = req.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Token verification would go here
    // For now, just continue
    return null;
  };
}

/**
 * Middleware for rate limiting (basic implementation)
 */
export async function checkRateLimit(req: NextRequest): Promise<NextResponse | null> {
  const rateLimitHeader = req.headers.get('x-rate-limit');
  if (rateLimitHeader) {
    const limit = parseInt(rateLimitHeader, 10);
    const remaining = parseInt(req.headers.get('x-ratelimit-remaining') || '0', 10);

    if (remaining <= 0) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }
  }
  return null;
}
