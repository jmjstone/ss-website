// lib/downloadUtils.ts
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabaseAdmin'; // Use your existing admin client

export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function createDownloadLink({
  productId,
  customerEmail,
  orderId,
  filename,
  expiresInDays = 7,
}: {
  productId: string;
  customerEmail: string;
  orderId?: string;
  filename: string;
  expiresInDays?: number;
}) {
  const token = generateSecureToken();
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);

  const { data, error } = await supabaseAdmin
    .from('download_links')
    .insert({
      token,
      product_id: productId,
      customer_email: customerEmail,
      order_id: orderId,
      filename,
      expires_at: expiresAt.toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating download link:', error);
    throw new Error('Failed to create download link');
  }

  return {
    token,
    downloadUrl: `${
      process.env.NEXT_PUBLIC_URL || 'https://stonesciencefit.com'
    }/api/download/${token}`,
    expiresAt,
  };
}
