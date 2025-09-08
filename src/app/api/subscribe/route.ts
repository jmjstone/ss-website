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
      subject: "Your Free College Lifter's Blueprint is Ready!",
      html: `
    <div style="font-family: 'Arial Narrow', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
      
      <div style="text-align: center; margin-bottom: 30px;">
        <img src="https://yvrdqrvtohobvjuqprmy.supabase.co/storage/v1/object/public/assets/SSBorderLogoWhite.png" alt="Stone Science" style="width: 80px; height: auto;">
      </div>

      <h1 style="color: #0070f3; text-align: center; margin-bottom: 20px;">Thanks for Signing Up!</h1>
      
      <p style="font-size: 16px; color: #333; text-align: center; margin-bottom: 25px;">
        Your free copy of <strong>The College Lifter's Blueprint</strong> is ready for download.
      </p>
      
      <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0; text-align: center; border: 1px solid #e9ecef;">
        <h2 style="margin-top: 0; color: #333; font-size: 20px;">Download Your Free Guide</h2>
        <p style="margin: 15px 0; color: #666;">Click the button below to get your blueprint:</p>
        
        <a href="${downloadLink}" 
           style="display: inline-block; background: #0070f3; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; margin: 10px 0;">
          Download The College Lifter's Blueprint
        </a>
      </div>
      
      <div style="background: #e3f2fd; padding: 15px; border-radius: 5px; border-left: 4px solid #0070f3; margin: 20px 0;">
        <p style="margin: 0; font-size: 14px; color: #1565c0;">
          <strong>Tip:</strong> Save this PDF to your device for easy access during your workouts!
        </p>
      </div>
      
      <h3 style="color: #333; margin-top: 25px;">What's Inside:</h3>
      <ul style="color: #666; line-height: 1.6;">
        <li>Essential workout routines for college students</li>
        <li>Time-efficient training strategies</li>
        <li>Nutrition tips on a budget</li>
        <li>How to stay consistent with a busy schedule</li>
      </ul>
      
      <p style="color: #666; margin-top: 25px;">
        If you have any questions about the blueprint or need support, reach out to us at 
        <a href="mailto:support@stonesciencefit.com" style="color: #0070f3; text-decoration: none;">support@stonesciencefit.com</a>.
      </p>
      
      <div style="border-top: 2px solid #e9ecef; margin-top: 30px; padding-top: 20px; text-align: center; color: #6c757d; font-size: 12px;">
        <p>© ${new Date().getFullYear()} Stone Science Fitness. All rights reserved.</p>
        <p style="margin-top: 10px;">
          <a href="https://stonesciencefit.com" style="color: #0070f3; text-decoration: none;">Visit our website</a> | 
          <a href="https://stonesciencefit.com/store" style="color: #0070f3; text-decoration: none;">Browse Programs</a>
        </p>
      </div>
      
    </div>
  `,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
