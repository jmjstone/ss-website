// app/api/download/[token]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;

    // Verify token and check expiration
    const { data: downloadLink, error } = await supabase
      .from('download_links')
      .select('*')
      .eq('token', token)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !downloadLink) {
      return NextResponse.json({ error: 'Invalid or expired download link' }, { status: 404 });
    }

    // Get signed URL from Supabase Storage
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from('private-products')
      .createSignedUrl(downloadLink.filename, 300); // 5 minutes

    if (urlError || !signedUrlData) {
      console.error('Error creating signed URL:', urlError);
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Track download
    await supabase
      .from('download_links')
      .update({ downloaded_at: new Date().toISOString() })
      .eq('token', token);

    // Fetch the file and return it directly
    const fileResponse = await fetch(signedUrlData.signedUrl);

    if (!fileResponse.ok) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const fileBuffer = await fileResponse.arrayBuffer();

    // Return the PDF file directly
    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Stone Science Lifting Program.pdf"',
        'Content-Length': fileBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
