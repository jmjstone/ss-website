import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Received body:', body); // debug

    const { title, summary, slug, content, image } = body;

    // Trim inputs to avoid empty strings
    if (!title?.trim() || !slug?.trim() || !content?.trim()) {
      console.log('Fields missing', { title, summary, slug, content });
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('blog_posts')
      .insert([{ title, summary, slug, content, image }]);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
