import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { query } from '@/lib/db';
import { getUserUsage } from '@/lib/subscription-middleware';
import { TIERS, formatStorage, TierName } from '@/lib/subscription';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get user tier - only query columns we know exist
    const userResult = await query(
      'SELECT tier FROM users WHERE id = $1',
      [user.id]
    );

    const userTier = userResult.rows[0]?.tier || 'free';
    const subscriptionStatus = 'active';
    const periodEnd = null;

    // Get usage stats
    const usage = await getUserUsage(user.id);

    // Get tier limits
    const tierConfig = TIERS[userTier as TierName];

    return NextResponse.json({
      tier: userTier,
      tierName: tierConfig.name,
      subscriptionStatus,
      periodEnd,
      usage: {
        plan: tierConfig.name,
        documents: {
          used: usage.documentCount,
          limit: tierConfig.limits.documents,
          percent: tierConfig.limits.documents === -1 ? 0 : Math.round((usage.documentCount / tierConfig.limits.documents) * 100),
        },
        storage: {
          used: usage.storageBytes,
          usedFormatted: formatStorage(usage.storageBytes),
          limit: tierConfig.limits.storageBytes,
          limitFormatted: formatStorage(tierConfig.limits.storageBytes),
          percent: tierConfig.limits.storageBytes === -1 ? 0 : Math.round((usage.storageBytes / tierConfig.limits.storageBytes) * 100),
        },
        features: tierConfig.limits.features,
      },
    });
  } catch (error) {
    console.error('Get subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to get subscription info' },
      { status: 500 }
    );
  }
}
