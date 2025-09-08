// app/api/webhooks/stripe/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import nodemailer from 'nodemailer';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature')!;
  const body = await req.text(); // raw body required for signature verification

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!, // from Stripe dashboard / CLI
    );
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // --- Handle PaymentIntent success ---
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    // Customer email (if collected in your payment form)
    const customerEmail = paymentIntent.receipt_email || paymentIntent.metadata?.email;
    if (!customerEmail) {
      console.warn('No customer email found in PaymentIntent');
      return NextResponse.json({ received: true });
    }

    // If you’re passing items into metadata when confirming payment, retrieve them
    // 🔎 Rebuild items from flattened metadata
    const meta = paymentIntent.metadata;
    const items: any[] = [];
    let index = 0;
    while (meta[`item_${index}_id`]) {
      items.push({
        id: meta[`item_${index}_id`],
        price: Number(meta[`item_${index}_price`]),
        quantity: Number(meta[`item_${index}_qty`]),
        // optional: include name if you also send it in metadata
        name: meta[`item_${index}_name`] || `Item ${index + 1}`,
      });
      index++;
    }
    console.log('✅ Reconstructed items:', items);
    // Extract discount metadata if present
    const discount =
      meta.cart_discount_type && meta.cart_discount_value
        ? {
            type: meta.cart_discount_type,
            value: meta.cart_discount_value,
          }
        : null;

    // Save to Supabase
    const { error } = await supabaseAdmin.from('orders').insert({
      email: customerEmail,
      items,
      stripe_payment_intent_id: paymentIntent.id,
      status: 'paid',
      amount: paymentIntent.amount_received, // 💡 store final charged amount
      currency: paymentIntent.currency,
      discount,
      created_at: new Date().toISOString(),
    });
    if (error) {
      console.error('❌ Supabase insert failed:', error);
    } else {
      console.log('✅ Order saved to Supabase');
    }
    // --- Send confirmation email via ZoHo ---
    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.ZOHO_USER,
        pass: process.env.ZOHO_PASS,
      },
    });
    const totalDollars = (paymentIntent.amount_received / 100).toFixed(2);
    await transporter.sendMail({
      from: `"Stone Science Fitness" <${process.env.ZOHO_USER}>`,
      to: customerEmail,
      subject: 'Your Stone Science Fitness Order Confirmation',
      html: `
        <h2>Thank you for your purchase!</h2>
        <p>We’ve received your order and it’s being processed.</p>
        ${
          items.length > 0
            ? `<h3>Order details:</h3>
         ${items
           .map(
             (item: any) =>
               `<p>${item.name} x ${item.quantity} ($${(item.price / 100).toFixed(2)})</p>`,
           )
           .join('')}`
            : ''
        }
        <p><strong>Total: $${totalDollars} USD</strong></p>
        <br/>
        <p>— The Stone Science Fitness Team</p>
      `,
    });

    console.log(`✅ Email sent to ${customerEmail}`);
  }

  return NextResponse.json({ received: true });
}
