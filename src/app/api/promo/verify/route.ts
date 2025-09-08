// app/api/promo/verify/route.ts
import { NextResponse } from 'next/server';
import { verifyPromo } from '@/lib/promo';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { token, productId } = await req.json();

    if (!token || !productId) {
      return NextResponse.json({ valid: false, pct: 0 });
    }

    const result = verifyPromo(token, process.env.DISCOUNT_TOKEN_SECRET!);

    // Check if token is valid and matches the product
    if (result.valid && result.payload.pid === productId) {
      return NextResponse.json({ valid: true, pct: result.payload.pct });
    }

    return NextResponse.json({ valid: false, pct: 0 });
  } catch (err) {
    console.error('Error verifying promo token', err);
    return NextResponse.json({ valid: false, pct: 0 });
  }
}
