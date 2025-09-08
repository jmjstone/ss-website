import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Header from '@/components/Header';
import { Metadata } from 'next';
import Footer from '@/components/Footer';
import { CalculatorProvider } from '@/context/CalculatorContext';
import { CartProvider } from '@/context/CartContext';
import CartPopdown from '@/components/CartPopdown';
import BackgroundWrapper from '@/components/BackgroundWrapper';
import HeaderWrapper from '@/components/HeaderWrapper';

export const metadata: Metadata = {
  title: 'Stone Science Fitness',
  description: 'Your source for fitness blogs and study breakdowns',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* Google Fonts */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Roboto+Condensed:ital,wght@0,100..900;1,100..900&display=swap"
        />
      </head>
      <body className="antialiased min-h-screen flex flex-col">
        <AuthProvider>
          <CalculatorProvider>
            <CartProvider>
              <CartPopdown />
              <HeaderWrapper>
                {/* Main takes all remaining space */}
                <main className="flex-1 pt-14">
                  <BackgroundWrapper>{children}</BackgroundWrapper>
                </main>
              </HeaderWrapper>
            </CartProvider>
          </CalculatorProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
