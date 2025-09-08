// app/api/contact/route.ts
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(req: Request) {
  try {
    const { first_name, last_name, email, message, phone, fitness_level, primary_goal } =
      await req.json();

    if (!first_name || !last_name || !email || !message) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    const fullName = `${first_name} ${last_name}`;

    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.ZOHO_USER,
        pass: process.env.ZOHO_PASS,
      },
    });

    const emailText = `
First Name: ${first_name}
Last Name: ${last_name}

Email: ${email}
Phone: ${phone || 'N/A'}

Current Fitness Level: ${fitness_level || 'N/A'}
Primary Goal: ${primary_goal || 'N/A'}

Message:
${message}
`;

    await transporter.sendMail({
      from: `"Coaching Inquiry" <${process.env.ZOHO_USER}>`,
      to: process.env.BUSINESS_EMAIL,
      subject: `New Coaching Inquiry from ${fullName}`,
      text: emailText,
    });

    return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ message: 'Error sending email' }, { status: 500 });
  }
}
