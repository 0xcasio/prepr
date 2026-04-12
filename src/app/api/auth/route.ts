import { NextResponse } from 'next/server';
import { getAuthStatus, saveApiKey, removeApiKey } from '@/lib/auth';

/**
 * GET /api/auth — returns the current auth status.
 */
export async function GET() {
  const status = getAuthStatus();
  return NextResponse.json(status);
}

/**
 * POST /api/auth — save an API key.
 */
export async function POST(req: Request) {
  const { apiKey } = (await req.json()) as { apiKey: string };
  const status = saveApiKey(apiKey);
  return NextResponse.json(status);
}

/**
 * DELETE /api/auth — remove the stored API key.
 */
export async function DELETE() {
  removeApiKey();
  return NextResponse.json({ authenticated: false });
}
