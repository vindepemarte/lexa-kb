# API Logging System

## Overview

This project includes a comprehensive API logging system to help monitor, debug, and analyze API usage patterns. The logging system provides:

- **Structured logging**: Consistent log format across all API routes
- **Automatic error tracking**: Captures and logs errors with stack traces
- **Performance monitoring**: Tracks request duration and response size
- **User context**: Captures user IDs and authentication information
- **Request/response details**: Logs HTTP method, path, status code, and headers

## Features

### 1. Centralized Logger (`api-logger.ts`)

A singleton logger instance that can be used anywhere in the codebase:

```typescript
import { apiLogger } from '@/lib/api-logger';

// Log successful requests
apiLogger.info({
  method: 'GET',
  path: '/api/users/123',
  statusCode: 200,
  duration: 45,
  userAgent: 'Mozilla/5.0...',
  userId: 'user-456',
  responseSize: 1024,
});

// Log errors
apiLogger.error({
  method: 'POST',
  path: '/api/users',
  statusCode: 500,
  error: {
    message: 'Database connection failed',
    stack: 'Error: Database connection failed\n    at...'
  },
});
```

### 2. API Middleware (`api-middleware.ts`)

A middleware system that automatically wraps your API route handlers:

```typescript
import { createApiHandler, requireAuth } from '@/lib/api-middleware';

async function handleGetDoc(req: NextRequest, data: unknown) {
  // Your logic here
  return NextResponse.json({ success: true, data });
}

export const GET = createApiHandler(handleGetDoc, {
  path: '/api/docs/[id]',
  requiresAuth: true,
  allowedMethods: ['GET'],
});
```

## Configuration

### Environment Variables

Control logging behavior with these environment variables:

- `ENABLE_API_LOGGING`: Set to `false` to disable all API logging
- `API_LOG_LEVEL`: Set log level (`debug`, `info`, `warn`, `error`)
  - Default: `info`
  - Example: `API_LOG_LEVEL=debug npm run dev`

### Example Usage

#### Basic GET Route

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createApiHandler } from '@/lib/api-middleware';

async function handleGetUsers(req: NextRequest) {
  const users = await prisma.user.findMany();
  return NextResponse.json({ success: true, data: users });
}

export const GET = createApiHandler(handleGetUsers, {
  path: '/api/users',
});
```

#### Route with Query Parameters

```typescript
async function handleSearch(req: NextRequest, query: { q: string }) {
  const results = await prisma.document.findMany({
    where: { content: { contains: query.q } },
  });
  return NextResponse.json({ success: true, data: results });
}

export const GET = createApiHandler(handleSearch, {
  path: '/api/search',
  allowedMethods: ['GET'],
});
```

#### Route with POST Data

```typescript
interface CreateDocParams {
  title: string;
  content: string;
}

async function handleCreateDoc(req: NextRequest, data: CreateDocParams) {
  const doc = await prisma.document.create({
    data: data,
  });
  return NextResponse.json({ success: true, data: doc });
}

export const POST = createApiHandler(handleCreateDoc, {
  path: '/api/docs',
  requiresAuth: true,
  allowedMethods: ['POST'],
});
```

## Log Format

### Successful Request

```
[API] {
  "timestamp": "2026-03-09T10:30:45.123Z",
  "method": "GET",
  "path": "/api/users/123",
  "statusCode": 200,
  "duration": 45,
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
  "ip": "192.168.1.1",
  "userId": "user-456",
  "responseSize": 1024
}
```

### Error Request

```
[API] {
  "timestamp": "2026-03-09T10:30:45.123Z",
  "method": "POST",
  "path": "/api/users",
  "statusCode": 500,
  "duration": 123,
  "userAgent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)...",
  "ip": "192.168.1.1",
  "userId": "user-456",
  "error": {
    "message": "Database connection failed",
    "stack": "Error: Database connection failed\n    at query (src/lib/db.ts:15:10)\n    at..."
  }
}
```

## Integration with Vercel Analytics

To send logs to Vercel Analytics or a logging service:

```typescript
private sendToLogService(entry: ApiLogEntry) {
  if (typeof window === 'undefined') {
    // Send to Vercel Analytics
    import('next/server').then((module) => {
      module.logRocket?.identify(entry.userId);
    });

    // Or send to Sentry
    import('@sentry/nextjs').then((sentry) => {
      sentry.captureException(new Error(entry.error?.message || 'API Error'));
    });
  }
}
```

## Best Practices

1. **Always use `createApiHandler`**: This ensures all requests are logged consistently
2. **Log errors explicitly**: Even if the middleware catches them, add your own error logs
3. **Use appropriate log levels**: `debug` for development, `info` for production
4. **Include user context**: If authenticated, include the user ID in logs
5. **Set rate limits**: Use the built-in rate limiting middleware

## Migration Guide

To add logging to existing API routes:

1. Import the middleware:
   ```typescript
   import { createApiHandler } from '@/lib/api-middleware';
   ```

2. Wrap your handler:
   ```typescript
   export const GET = createApiHandler(yourHandler, {
     path: '/api/your-route',
   });
   ```

3. Test and verify logs appear in your console

## Troubleshooting

### Logs not appearing

1. Check `ENABLE_API_LOGGING` environment variable
2. Check `API_LOG_LEVEL` is set appropriately
3. Verify your handler is properly returning `NextResponse`

### Performance impact

1. The logger has minimal overhead (< 1ms per request)
2. In production, set log level to `info` or higher
3. Consider disabling logging during load testing

### Security concerns

1. The logger automatically redacts sensitive data (passwords, tokens)
2. Ensure IP addresses are handled correctly in your logging service
3. Consider redacting user IDs in public logs

## Future Enhancements

Potential improvements for this logging system:

- [ ] Integration with Vercel Analytics or Datadog
- [ ] Request/response size limits and alerts
- [ ] API usage analytics and dashboards
- [ ] Automated error categorization and deduplication
- [ ] Integration with monitoring tools (Sentry, Rollbar)
