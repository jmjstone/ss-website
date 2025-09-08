import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: NextRequest) {
  const { id, email, first_name, last_name } = await req.json();

  if (!id || !email || !first_name || !last_name) {
    return NextResponse.json(
      { error: 'Missing required fields: id, email, firstName, or lastName' },
      { status: 400 },
    );
  }

  const { data, error } = await supabaseAdmin
    .from('profiles')
    .insert([{ id, email, first_name: first_name, last_name: last_name, is_admin: false }]);

  if (error) {
    console.error('Profile insert error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
