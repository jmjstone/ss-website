// app/api/webhooks/stripe/route.ts
import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import nodemailer from 'nodemailer';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createDownloadLink } from '@/lib/downloadUtils';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature')!;
  const body = await req.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // Handle PaymentIntent success
  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const customerEmail = paymentIntent.receipt_email || paymentIntent.metadata?.email;

    if (!customerEmail) {
      console.warn('No customer email found in PaymentIntent');
      return NextResponse.json({ received: true });
    }

    // Rebuild items from metadata
    const meta = paymentIntent.metadata;
    const items: any[] = [];
    let index = 0;
    while (meta[`item_${index}_id`]) {
      items.push({
        id: meta[`item_${index}_id`],
        price: Number(meta[`item_${index}_price`]),
        quantity: Number(meta[`item_${index}_qty`]),
        name: meta[`item_${index}_name`] || `Item ${index + 1}`,
      });
      index++;
    }

    const discount =
      meta.cart_discount_type && meta.cart_discount_value
        ? {
            type: meta.cart_discount_type,
            value: meta.cart_discount_value,
          }
        : null;

    // Save to Supabase
    const { data: orderData, error } = await supabaseAdmin
      .from('orders')
      .insert({
        email: customerEmail,
        items,
        stripe_payment_intent_id: paymentIntent.id,
        status: 'paid',
        amount: paymentIntent.amount_received,
        currency: paymentIntent.currency,
        discount,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert failed:', error);
    } else {
      console.log('Order saved to Supabase');
    }

    // Generate download links for digital products
    const downloadLinks: string[] = [];
    try {
      // Check if any purchased items are digital products that need download links
      for (const item of items) {
        // You can customize this logic based on your product setup
        // For now, assuming any product with "program" in the name needs a download link
        if (item.id === '31f323e6-2e8c-445f-a451-adb991af3b72') {
          // Replace with actual product ID

          const downloadLink = await createDownloadLink({
            productId: item.id,
            customerEmail,
            orderId: orderData?.id || paymentIntent.id,
            filename: '8-week-semester-shreds-program.pdf', // Replace with your actual PDF filename
            expiresInDays: 30,
          });

          downloadLinks.push(downloadLink.downloadUrl);
        }
      }
    } catch (downloadError) {
      console.error('Error creating download links:', downloadError);
      // Continue with email sending even if download link creation fails
    }

    // Send confirmation email
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

    // Create enhanced email with download links
    const createEmailContent = () => {
      let html = `
        <div style="font-family: 'Arial Narrow', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://yvrdqrvtohobvjuqprmy.supabase.co/storage/v1/object/public/assets/SSBorderLogoWhite.png" alt="Stone Science" style="width: 80px; height: auto;">
          </div>
          
          <h2 style="color: #0070f3; text-align: center;">Thank You for Your Purchase!</h2>
          <p>We've received your order and it's being processed.</p>
      `;

      // Add download section if there are download links
      if (downloadLinks.length > 0) {
        html += `
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 25px 0; text-align: center;">
            <h3 style="margin-top: 0; color: #333;">Download Your Program</h3>
            <p>Your digital content is ready for download:</p>
        `;

        downloadLinks.forEach((link, idx) => {
          html += `
            <div style="margin: 15px 0;">
              <a href="${link}" 
                 style="display: inline-block; background: #0070f3; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Download Program ${downloadLinks.length > 1 ? `#${idx + 1}` : ''}
              </a>
            </div>
          `;
        });

        html += `
            <p style="font-size: 14px; color: #666; margin-top: 15px;">
              <strong>Important:</strong> Download links expire in 30 days. Save your files to your device.
            </p>
          </div>
        `;
      }

      // Add order details
      if (items.length > 0) {
        html += `
          <h3>Order Details:</h3>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px;">
        `;

        items.forEach((item: any) => {
          html += `<p style="margin: 5px 0;">${item.name} x ${item.quantity} - $${(
            item.price / 100
          ).toFixed(2)}</p>`;
        });

        html += `</div>`;
      }

      html += `
          <div style="margin: 20px 0; padding: 15px; background: #e3f2fd; border-radius: 5px;">
            <p style="margin: 0; font-size: 18px; font-weight: bold;">Total: $${totalDollars} USD</p>
          </div>
          
          <p>If you have any questions, please contact us at support@stonesciencefit.com</p>
          
          <div style="text-align: center; margin-top: 30px; color: #666; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Stone Science Fitness. All rights reserved.</p>
          </div>
        </div>
      `;

      return html;
    };

    await transporter.sendMail({
      from: `"Stone Science Fitness" <${process.env.ZOHO_USER}>`,
      to: customerEmail,
      subject:
        downloadLinks.length > 0
          ? 'Your Stone Science Program is Ready for Download!'
          : 'Your Stone Science Fitness Order Confirmation',
      html: createEmailContent(),
    });

    console.log(`Email sent to ${customerEmail} with ${downloadLinks.length} download link(s)`);
  }

  return NextResponse.json({ received: true });
}
