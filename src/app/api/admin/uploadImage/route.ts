import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 });

    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;

    const { error } = await supabaseAdmin.storage
      .from('blog-images')
      .upload(fileName, file, { upsert: true });
    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabaseAdmin.storage.from('blog-images').getPublicUrl(fileName);
    return NextResponse.json({ url: publicUrl });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
