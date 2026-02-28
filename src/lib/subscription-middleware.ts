import { NextRequest, NextResponse } from 'next/server';
import { query } from './db';
import { canPerformAction, canUploadDocument, getUpgradePrompt, TierName } from './subscription';

interface User {
  id: number;
  email: string;
  tier: TierName;
}

// Get current user from auth token
export async function getCurrentUser(request: NextRequest): Promise<User | null> {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) return null;

    // Simple JWT decode (you should verify properly in production)
    const decoded = Buffer.from(token.split('.')[1], 'base64').toString();
    const payload = JSON.parse(decoded);

    const result = await query(
      'SELECT id, email, tier FROM users WHERE id = $1',
      [payload.id]
    );

    return result.rows[0] || null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

// Get user's current usage stats
export async function getUserUsage(userId: number) {
  const docsResult = await query(
    'SELECT COUNT(*) as count, COALESCE(SUM(LENGTH(content)), 0) as total_bytes FROM documents WHERE user_id = $1',
    [userId]
  );

  const storageResult = await query(
    'SELECT COALESCE(SUM(LENGTH(content)), 0) as total_bytes FROM documents WHERE user_id = $1',
    [userId]
  );

  return {
    documentCount: parseInt(docsResult.rows[0].count),
    storageBytes: parseInt(storageResult.rows[0].total_bytes),
  };
}

// Check if user can access feature
export async function checkFeatureAccess(
  request: NextRequest,
  feature: 'search' | 'chat' | 'pdfExtraction' | 'teamSharing' | 'apiAccess'
): Promise<{ allowed: boolean; user?: User; error?: string; upgradePrompt?: string }> {
  const user = await getCurrentUser(request);

  if (!user) {
    return { allowed: false, error: 'Unauthorized' };
  }

  const allowed = canPerformAction(user.tier, feature);

  if (!allowed) {
    const upgrade = getUpgradePrompt(feature);
    return {
      allowed: false,
      user,
      error: upgrade.message,
      upgradePrompt: upgrade.message,
    };
  }

  return { allowed: true, user };
}

// Check if user can upload document
export async function checkUploadLimit(
  request: NextRequest,
  fileSizeBytes: number
): Promise<{ allowed: boolean; user?: User; error?: string }> {
  const user = await getCurrentUser(request);

  if (!user) {
    return { allowed: false, error: 'Unauthorized' };
  }

  const usage = await getUserUsage(user.id);
  const check = canUploadDocument(user.tier, usage.documentCount, fileSizeBytes, usage.storageBytes);

  if (!check.allowed) {
    return {
      allowed: false,
      user,
      error: check.reason,
    };
  }

  return { allowed: true, user };
}

// Middleware wrapper for feature gates
export function withFeatureGate(feature: 'search' | 'chat' | 'pdfExtraction' | 'teamSharing' | 'apiAccess') {
  return async function (
    request: NextRequest,
    handler: (request: NextRequest, user: User) => Promise<NextResponse>
  ): Promise<NextResponse> {
    const { allowed, user, error } = await checkFeatureAccess(request, feature);

    if (!allowed) {
      return NextResponse.json(
        { error: error || 'Access denied', requiresUpgrade: true },
        { status: 403 }
      );
    }

    return handler(request, user!);
  };
}
