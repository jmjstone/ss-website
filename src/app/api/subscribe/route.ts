import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 });
    }

    // Save to DB
    const { error } = await supabaseAdmin.from('subscribers').insert({ email }).select();

    if (error && !error.message.includes('duplicate key')) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Generate a signed URL (valid for 7 days)
    const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
      .from('lead-magnets')
      .createSignedUrl('the-college-lifters-blueprint.pdf', 60 * 60 * 24 * 7);

    if (signedUrlError) {
      return NextResponse.json({ error: signedUrlError.message }, { status: 500 });
    }

    const downloadLink = signedUrlData.signedUrl;

    // Send email with link via Zoho
    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.ZOHO_USER,
        pass: process.env.ZOHO_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Stone Science Fitness" <${process.env.ZOHO_USER}>`,
      to: email,
      subject: "Your Free College Lifter's Blueprint",
      html: `
        <h2>Thanks for signing up!</h2>
        <p>Here’s your free copy of The College Lifter's Blueprint</p>
        <p><a href="${downloadLink}" target="_blank">Download your copy of The College Lifter's Blueprintk</a></p>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
