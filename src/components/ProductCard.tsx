'use client';

import { useCart } from '@/context/CartContext';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  discount?: number | null;
  image_url?: string | null;
}

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [hovered, setHovered] = useState(false);

  // ✅ Load promo from localStorage if available
  const [promoToken, setPromoToken] = useState<string | null>(null);
  const [promoDiscount, setPromoDiscount] = useState<number>(0);

  useEffect(() => {
    const savedToken = localStorage.getItem('promoToken');
    const savedPct = localStorage.getItem('promoPct');

    if (savedToken && savedPct) {
      setPromoToken(savedToken);
      setPromoDiscount(parseInt(savedPct, 10));
    }
  }, []);

  // ✅ Final price calculation
  const finalPrice = (() => {
    let price = product.price;

    // Apply DB discount
    if (product.discount) {
      price = Math.round(price * (1 - product.discount / 100));
    }

    // Apply promo discount
    if (promoDiscount) {
      price = Math.round(price * (1 - promoDiscount / 100));
    }

    return price;
  })();

  return (
    <div
      className={`flex flex-col items-center text-white transform transition duration-300 ${
        hovered ? 'scale-105' : ''
      } animate-fadeIn`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Product image with glow */}
      {/* Clickable area for product details */}
      <Link
        href={`/store/${product.id}`}
        className="flex flex-col items-center w-full cursor-pointer"
      >
        {product.image_url && (
          <div className="relative max-w-70 mb-4">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover rounded shadow-[0_0_2px_#fff,inset_0_0_2px_#fff,0_0_5px_#08f,0_0_15px_#08f,0_0_30px_#08f]"
            />
          </div>
        )}

        {/* Product info */}
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold">{product.name}</h2>
          {product.description && (
            <p className="text-stone-300 text-sm mt-1">{product.description}</p>
          )}
          <p className="text-lg font-semibold mt-2">
            ${(finalPrice / 100).toFixed(2)}
            {product.discount ? (
              <span className="line-through text-stone-500 ml-2">
                ${(product.price / 100).toFixed(2)}
              </span>
            ) : null}
          </p>
        </div>
      </Link>
      {/* Add to cart button */}
      <button
        className="bg- mt-2 w-60 border-1  border-white hover:border-0 hover:shadow-[0_0_2px_#fff,inset_0_0_2px_#fff,0_0_5px_#08f,0_0_15px_#08f,0_0_30px_#08f] rounded-full hover:bg-white hover:text-black px-6 py-3 uppercase roboto-condensed-logo text-xl transition animate-pulseHover"
        onClick={() =>
          addToCart({
            id: product.id,
            name: product.name,
            price: product.price,
            discount: product.discount || 0,
            promoToken: promoToken || undefined, // ✅ pass along promo token
            appliedPromoDiscount: promoDiscount || 0, // ✅ apply discount
            image_url: product.image_url,
          })
        }
      >
        Add to Cart
      </button>
    </div>
  );
}
