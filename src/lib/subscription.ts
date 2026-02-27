// Subscription tiers and limits
export const TIERS = {
  free: {
    name: 'Free',
    price: 0,
    limits: {
      documents: 5,
      storageBytes: 100 * 1024 * 1024, // 100MB
      features: {
        search: false,
        chat: false,
        pdfExtraction: false,
        teamSharing: false,
        apiAccess: false,
      },
    },
  },
  personal: {
    name: 'Personal',
    price: 9,
    limits: {
      documents: 10000,
      storageBytes: 5 * 1024 * 1024 * 1024, // 5GB
      features: {
        search: true,
        chat: false,
        pdfExtraction: true,
        teamSharing: false,
        apiAccess: false,
      },
    },
  },
  pro: {
    name: 'Pro',
    price: 29,
    limits: {
      documents: -1, // unlimited
      storageBytes: 50 * 1024 * 1024 * 1024, // 50GB
      features: {
        search: true,
        chat: true,
        pdfExtraction: true,
        teamSharing: true,
        apiAccess: false,
      },
    },
  },
  enterprise: {
    name: 'Enterprise',
    price: 99,
    limits: {
      documents: -1,
      storageBytes: -1, // unlimited
      features: {
        search: true,
        chat: true,
        pdfExtraction: true,
        teamSharing: true,
        apiAccess: true,
      },
    },
  },
} as const;

export type TierName = keyof typeof TIERS;

// Check if user can perform action
export function canPerformAction(
  tier: TierName,
  action: 'search' | 'chat' | 'pdfExtraction' | 'teamSharing' | 'apiAccess'
): boolean {
  return TIERS[tier].limits.features[action];
}

// Check if user can upload more documents
export function canUploadDocument(
  tier: TierName,
  currentDocumentCount: number,
  fileSizeBytes: number,
  currentStorageBytes: number
): { allowed: boolean; reason?: string } {
  const limits = TIERS[tier].limits;
  
  // Check document count
  if (limits.documents !== -1 && currentDocumentCount >= limits.documents) {
    return {
      allowed: false,
      reason: `Document limit reached (${limits.documents} docs). Upgrade your plan to upload more.`,
    };
  }
  
  // Check storage
  if (limits.storageBytes !== -1 && currentStorageBytes + fileSizeBytes > limits.storageBytes) {
    const usedMB = Math.round(currentStorageBytes / (1024 * 1024));
    const limitMB = Math.round(limits.storageBytes / (1024 * 1024));
    return {
      allowed: false,
      reason: `Storage limit reached (${usedMB}MB/${limitMB}MB). Upgrade your plan for more storage.`,
    };
  }
  
  return { allowed: true };
}

// Get upgrade prompt for feature
export function getUpgradePrompt(feature: string): { tier: TierName; message: string } {
  const prompts: Record<string, { tier: TierName; message: string }> = {
    search: {
      tier: 'personal',
      message: 'Full-text search requires Personal plan (€9/mo)',
    },
    chat: {
      tier: 'pro',
      message: 'AI Chat requires Pro plan (€29/mo)',
    },
    pdfExtraction: {
      tier: 'personal',
      message: 'PDF extraction requires Personal plan (€9/mo)',
    },
    teamSharing: {
      tier: 'pro',
      message: 'Team sharing requires Pro plan (€29/mo)',
    },
    apiAccess: {
      tier: 'enterprise',
      message: 'API access requires Enterprise plan (€99/mo)',
    },
  };
  
  return prompts[feature] || { tier: 'personal', message: 'Upgrade required' };
}

// Format storage for display
export function formatStorage(bytes: number): string {
  if (bytes === -1) return 'Unlimited';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${Math.round(bytes / (1024 * 1024))} MB`;
  return `${Math.round(bytes / (1024 * 1024 * 1024))} GB`;
}
