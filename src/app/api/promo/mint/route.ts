// app/api/promo/mint/route.ts
import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { signPromo } from '@/lib/promo';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const { paymentIntentId, productId, pct = 10 } = await req.json();

    if (!paymentIntentId || !productId) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    // Verify the order exists & is paid (basic gate)
    const { data: order, error } = await supabaseAdmin
      .from('orders')
      .select('id, created_at, status')
      .eq('stripe_payment_intent_id', paymentIntentId)
      .single();

    if (error || !order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }
    if (order.status !== 'paid') {
      return NextResponse.json({ message: 'Order not paid' }, { status: 400 });
    }

    // Optional: limit minting time window (e.g., within 24h of purchase)
    const createdMs = new Date(order.created_at).getTime();
    const dayMs = 24 * 60 * 60 * 1000;
    if (Date.now() - createdMs > dayMs) {
      return NextResponse.json({ message: 'Promo window expired' }, { status: 400 });
    }

    const exp = Date.now() + 15 * 60 * 1000; // valid 15 minutes
    const token = signPromo(
      { pid: productId, pct: Number(pct), exp, oid: order.id, iat: Date.now() },
      process.env.DISCOUNT_TOKEN_SECRET!,
    );

    return NextResponse.json({ token, exp });
  } catch (e: any) {
    return NextResponse.json({ message: 'mint_failed', error: e?.message }, { status: 500 });
  }
}
