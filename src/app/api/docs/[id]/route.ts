/**
 * Example API route with API logging middleware
 *
 * This demonstrates how to use the api-logger and api-middleware utilities
 *
 * Usage:
 * 1. Import createApiHandler from '@/lib/api-middleware'
 * 2. Define your handler function
 * 3. Wrap it with createApiHandler
 * 4. Export the wrapped handler as default
 */

import { NextRequest, NextResponse } from 'next/server';
import { createApiHandler, requireAuth } from '@/lib/api-middleware';
import { prisma } from '@/lib/db';
import { apiLogger } from '@/lib/api-logger';

// Define the type for the request data
interface GetDocParams {
  id: string;
}

interface GetDocQuery {
  includeContent?: 'true' | 'false';
}

/**
 * Handler for GET /api/docs/[id]
 * Retrieves a document by ID
 */
async function handleGetDoc(
  req: NextRequest,
  params: GetDocParams,
  query: GetDocQuery
): Promise<NextResponse> {
  // Require authentication
  const authResult = await requireAuth()(req, params);
  if (authResult) return authResult;

  const { id } = params;
  const { includeContent } = query;

  try {
    const includeContentBool = includeContent === 'true';

    // Fetch document from database
    const doc = await prisma.document.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        content: includeContentBool,
        createdAt: true,
        updatedAt: true,
        userId: true,
      },
    });

    if (!doc) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: doc,
    });
  } catch (error) {
    // Log the error (though the middleware will also log it)
    apiLogger.error({
      method: 'GET',
      path: `/api/docs/${id}`,
      statusCode: 500,
      error: {
        message: error instanceof Error ? error.message : 'Database query failed',
        stack: error instanceof Error ? error.stack : undefined,
      },
    });

    throw error;
  }
}

/**
 * Handler for POST /api/docs/[id]
 * Update a document
 */
async function handleUpdateDoc(
  req: NextRequest,
  data: { title?: string; content?: string }
): Promise<NextResponse> {
  // Require authentication
  const authResult = await requireAuth()(req, {});
  if (authResult) return authResult;

  const { id } = req.nextUrl.pathname.match(/\/api\/docs\/([a-zA-Z0-9-]+)/)?.[1] || '';
  const { title, content } = data;

  try {
    if (!id) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    // Update document
    const doc = await prisma.document.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(content !== undefined && { content }),
        updatedAt: new Date(),
      },
      select: {
        id: true,
        title: true,
        content: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: doc,
    });
  } catch (error) {
    apiLogger.error({
      method: 'POST',
      path: `/api/docs/${id}`,
      statusCode: 500,
      error: {
        message: error instanceof Error ? error.message : 'Update failed',
        stack: error instanceof Error ? error.stack : undefined,
      },
    });

    throw error;
  }
}

/**
 * Export the GET handler with API logging
 */
export const GET = createApiHandler(handleGetDoc, {
  path: '/api/docs/[id]',
  requiresAuth: true,
  allowedMethods: ['GET'],
});

/**
 * Export the POST handler with API logging
 */
export const POST = createApiHandler(handleUpdateDoc, {
  path: '/api/docs/[id]',
  requiresAuth: true,
  allowedMethods: ['POST'],
});

/**
 * Optional: Export all methods in a single route
 */
export const runtime = 'edge';
