import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export type HealthStatus = 'ok' | 'degraded';

export type HealthReport = {
  status: HealthStatus;
  service: 'lexa-kb';
  ts: string;
  durationMs: number;
  checks: {
    db: 'up' | 'down';
  };
  errors?: {
    db?: string;
  };
};

const DEFAULT_DB_TIMEOUT_MS = 1500;

async function checkDb(): Promise<void> {
  const client = await pool.connect();
  try {
    await client.query('SELECT 1');
  } finally {
    client.release();
  }
}

export async function GET(request: Request) {
  const startedAt = Date.now();
  const searchParams = new URL(request.url).searchParams;
  const ready = searchParams.get('ready') === 'true';

  let dbStatus: 'up' | 'down' = 'up';
  let dbError: string | undefined;

  const dbTimeoutMs = DEFAULT_DB_TIMEOUT_MS;

  try {
    let timeoutHandle: NodeJS.Timeout | undefined;

    await Promise.race([
      checkDb().finally(() => {
        if (timeoutHandle) clearTimeout(timeoutHandle);
      }),
      new Promise((_, reject) => {
        timeoutHandle = setTimeout(() => {
          reject(new Error(`DB probe timed out after ${dbTimeoutMs}ms`));
        }, dbTimeoutMs);
      }),
    ]);
  } catch (error) {
    dbStatus = 'down';
    dbError = error instanceof Error ? error.message : 'Unknown DB health probe error';
  }

  const report: HealthReport = {
    status: dbStatus === 'up' ? 'ok' : 'degraded',
    service: 'lexa-kb',
    ts: new Date().toISOString(),
    durationMs: Date.now() - startedAt,
    checks: {
      db: dbStatus,
    },
    ...(dbError ? { errors: { db: dbError } } : {}),
  };

  const statusCode = ready && report.status !== 'ok' ? 503 : 200;

  return NextResponse.json(report, { status: statusCode });
}
