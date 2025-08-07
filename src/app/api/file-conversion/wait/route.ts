import { NextRequest, NextResponse } from 'next/server';
import { cloudConvert } from '@/lib/cloudconvert';

export async function POST(req: NextRequest) {
  const { jobId } = await req.json();
  if (!jobId) {
    return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });
  }

  try {
    await cloudConvert.jobs.wait(jobId); // ✅ wait until job starts
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CloudConvert Wait Error]', error);
    return NextResponse.json({ error: 'Failed to wait for job' }, { status: 500 });
  }
}