// app/api/checkout/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { verifyPromo } from '@/lib/promo';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Initialize Supabase client (server-side)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function POST(req: Request) {
  try {
    const { items, discount } = await req.json();

    if (!items || items.length === 0) {
      return NextResponse.json({ message: 'No items in cart' }, { status: 400 });
    }

    // Fetch the products from Supabase by ID
    const { data: dbProducts, error } = await supabase
      .from('products')
      .select('*')
      .in(
        'id',
        items.map((i: any) => i.id),
      );

    if (error || !dbProducts) {
      console.error(error);
      return NextResponse.json({ message: 'Error fetching products' }, { status: 500 });
    }

    // Step 1: Apply product-level discounts + promo tokens and compute subtotal
    let subtotal = 0;
    const itemPrices: Record<string, number> = {}; // store discounted price per item

    items.forEach((item: any) => {
      const product = dbProducts.find((p: any) => p.id === item.id);
      if (!product) throw new Error(`Product not found: ${item.id}`);

      let priceCents = product.price;

      // Apply DB discount if present
      if (product.discount) {
        priceCents = Math.round(priceCents * (1 - product.discount / 100));
      }

      // Verify promo token (if provided)
      if (item.promoToken) {
        const result = verifyPromo(item.promoToken, process.env.DISCOUNT_TOKEN_SECRET!);
        if (result.valid && result.payload.pid === item.id) {
          const pct = Math.max(0, Math.min(result.payload.pct, 100));
          priceCents = Math.round(priceCents * (1 - pct / 100));
        } else {
          console.warn('Invalid promo token for item', item.id, result);
        }
      }

      itemPrices[item.id] = priceCents;
      subtotal += priceCents * item.quantity;
    });

    // Step 2: Apply cart-level discount proportionally
    let total = subtotal;
    let discountAmount = 0;

    if (discount) {
      const { type, value } = discount;
      if (type === 'percent') {
        total = Math.round(total * (1 - value / 100));
        discountAmount = subtotal - total;
      } else {
        total -= value;
        if (total < 0) total = 0;
        discountAmount = subtotal - total;
      }
    }

    // Step 3: Build metadata with final per-item price
    const cartMetadata = items.reduce((acc: Record<string, string>, item: any, idx: number) => {
      const basePrice = itemPrices[item.id];
      let finalPrice = basePrice;

      if (discountAmount > 0 && subtotal > 0) {
        const itemSubtotal = basePrice * item.quantity;
        const itemShare = itemSubtotal / subtotal;
        const itemDiscount = Math.round(discountAmount * itemShare);
        finalPrice = Math.round((itemSubtotal - itemDiscount) / item.quantity);
      }

      acc[`item_${idx}_id`] = item.id;
      acc[`item_${idx}_qty`] = String(item.quantity);
      acc[`item_${idx}_name`] = item.name;
      acc[`item_${idx}_price`] = String(finalPrice);

      if (item.promoToken) {
        acc[`item_${idx}_promo`] = 'true';
      }
      return acc;
    }, {} as Record<string, string>);

    // Optional: store cart-level discount metadata
    if (discount) {
      cartMetadata.cart_discount_type = discount.type;
      cartMetadata.cart_discount_value = discount.value.toString();
    }

    // Step 4: Create PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: total,
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: cartMetadata,
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { message: 'PaymentIntent creation failed', error: err.message },
      { status: 500 },
    );
  }
}
