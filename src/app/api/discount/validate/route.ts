import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function POST(req: Request) {
  try {
    const { code, cartTotal } = await req.json();

    if (!code) {
      return NextResponse.json({ valid: false, message: 'No code provided' }, { status: 400 });
    }

    // Lookup discount code in Supabase
    const { data: discountCodes, error } = await supabaseAdmin
      .from('discount_codes')
      .select('*')
      .eq('code', code)
      .limit(1)
      .single();

    if (error || !discountCodes) {
      return NextResponse.json({ valid: false, message: 'Invalid discount code' }, { status: 404 });
    }

    // Check expiration
    const now = new Date();
    if (discountCodes.expires_at && new Date(discountCodes.expires_at) < now) {
      return NextResponse.json(
        { valid: false, message: 'Discount code has expired' },
        { status: 400 },
      );
    }

    // Check min cart total
    if (cartTotal < (discountCodes.min_cart_total || 0)) {
      return NextResponse.json(
        {
          valid: false,
          message: `Cart total must be at least $${(discountCodes.min_cart_total! / 100).toFixed(
            2,
          )} to use this code`,
        },
        { status: 400 },
      );
    }

    // Check max uses
    if (discountCodes.max_uses && discountCodes.used_count >= discountCodes.max_uses) {
      return NextResponse.json(
        { valid: false, message: 'Discount code usage limit reached' },
        { status: 400 },
      );
    }

    return NextResponse.json({
      valid: true,
      code: discountCodes.code,
      type: discountCodes.type,
      value: discountCodes.value,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ valid: false, message: 'Server error' }, { status: 500 });
  }
}
