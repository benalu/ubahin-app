import { NextRequest, NextResponse } from 'next/server';
import { cloudConvert } from '@/lib/cloudconvert';
import { ALLOWED_EXTENSIONS, ALLOWED_OUTPUT_FORMATS } from '@/lib/constants/file';
import { getFileExtensionFromFilename } from '@/features/fileConversion/lib/apiUtils';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const filename = formData.get('fileName')?.toString() || '';
    const outputFormat = formData.get('outputFormat')?.toString() || '';

    const ext = getFileExtensionFromFilename(filename);
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    if (!ALLOWED_OUTPUT_FORMATS.includes(outputFormat)) {
      return NextResponse.json({ error: 'Unsupported output format' }, { status: 400 });
    }

    const job = await cloudConvert.jobs.create({
      tasks: {
        import_my_file: {
          operation: 'import/upload',
        },
        convert_my_file: {
          operation: 'convert',
          input: 'import_my_file',
          output_format: outputFormat,
        },
        export_my_file: {
          operation: 'export/url',
          input: 'convert_my_file',
        },
      },
    });

    const uploadTask = job.tasks.find((t) => t.name === 'import_my_file');
    if (!uploadTask || !uploadTask.result?.form) {
      throw new Error('Upload task form not found');
    }

    return NextResponse.json({
      success: true,
      uploadForm: uploadTask.result.form, // { url, parameters }
      jobId: job.id,
    });
  } catch (err) {
    console.error('[CloudConvert Error]', err);
    return NextResponse.json({ error: 'Failed to prepare job' }, { status: 500 });
  }
}
