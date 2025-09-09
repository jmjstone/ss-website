'use client';

import { useEffect, useState } from 'react';
import { useCart } from '@/context/CartContext';
import ProductCard from '@/components/ProductCard';
import ComingSoon from '@/components/ComingSoon';
interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  discount?: number | null;
  image_url?: string | null;
}

export default function StorePage() {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [promoToken, setPromoToken] = useState<string | null>(null);
  const [promoDiscount, setPromoDiscount] = useState<number | null>(null);

  useEffect(() => {
    // ✅ Load promo if it exists in localStorage
    const savedToken = localStorage.getItem('promoToken');
    const savedPct = localStorage.getItem('promoPct');

    if (savedToken && savedPct) {
      setPromoToken(savedToken);
      setPromoDiscount(parseInt(savedPct, 10));
    }
  }, []);
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/products');
        const data: Product[] = await res.json();
        setProducts(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchProducts();
  }, []);

  return (
    <main
      className="roboto-condensed-thin min-h-screen text-white p-8 bg-cover relative"
      style={{
        backgroundImage:
          "url('https://yvrdqrvtohobvjuqprmy.supabase.co/storage/v1/object/public/hero-background-images/GymImage7v2.jpg')",
      }}
    >
      <div className="absolute inset-0 bg-black/60"></div>

      <div className=" relative max-w-7xl mx-auto">
        <div className="text-center flex-co mb-20">
          <h1 className="text-center text-4xl font-bold mb-0 uppercase roboto-condensed-logo relative z-10">
            Store
          </h1>
          <p className="roboto-condensed-light text-lg text-stone-300">
            Professional packages expertly designed to help you reach your goals.
          </p>
        </div>
        <div
          className={`grid gap-10 relative z-10 ${
            products.length == 1 ? 'grid-cols-1 justify-items-center' : 'grid-cols-1 md:grid-cols-3'
          }`}
        >
          {products.map((p, idx) => (
            <div
              key={p.id}
              className="opacity-0 animate-fadeIn"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease forwards;
        }
      `}</style>
    </main>
  );
}

{
  /*
  return <ComingSoon />;
}
{*/
}
