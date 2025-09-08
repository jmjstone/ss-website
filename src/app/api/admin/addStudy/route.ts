import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: NextRequest) {
  try {
    const { name, authors, date, link, category, summary, description } = await req.json();

    const { data, error } = await supabase.from('studies').insert([
      {
        name,
        authors,
        date,
        link,
        category,
        summary,
        description,
      },
    ]);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ data });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
