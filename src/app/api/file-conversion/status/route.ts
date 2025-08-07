import { NextRequest, NextResponse } from 'next/server';
import { cloudConvert } from '@/lib/cloudconvert';

export const dynamic = 'force-dynamic';

type CloudConvertFile = {
  url?: string;
};

type CloudConvertTask = {
  name: string;
  status: string;
  result?: {
    files?: CloudConvertFile[];
  };
};

export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get('jobId');
  if (!jobId) {
    return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });
  }

  try {
    const job = await cloudConvert.jobs.get(jobId);
    console.dir(job.tasks?.map(t => ({
    name: t.name,
    operation: t.operation,
    status: t.status,
    result: t.result,
  })), { depth: null });
    const tasks: CloudConvertTask[] = job.tasks ?? [];

    const exportTask = tasks.find(
      (t) => t.name === 'export_my_file' && t.status === 'finished'
    );

    const downloadUrl = exportTask?.result?.files?.[0]?.url;

    if (typeof downloadUrl === 'string') {
      return NextResponse.json({ downloadUrl });
    } else {
      return NextResponse.json({ error: 'File not ready' }, { status: 202 });
    }
  } catch (error) {
    console.error('[CloudConvert Status Error]', error);
    return NextResponse.json({ error: 'Failed to get job status' }, { status: 500 });
  }
}
