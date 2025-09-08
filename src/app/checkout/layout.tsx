// app/checkout/layout.tsx
'use client';
import HeaderWhite from '@/components/HeaderWhite';
export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-white">
        <HeaderWhite />
        <main
          className="flex-1 absolute pt-10 top-0 left-0 w-full bg-white"
          style={{ height: 'calc(100vh - 0px)' }}
        >
          {children}
        </main>
        {/* No footer */}
      </body>
    </html>
  );
}
