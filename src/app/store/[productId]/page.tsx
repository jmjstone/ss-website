'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useCart } from '@/context/CartContext';
import BackButton from '@/components/BackButton';
import ReactMarkdown from 'react-markdown';
interface Product {
  id: string;
  name: string;
  description: string | null;
  long_description?: string | null;
  price: number;
  currency: string;
  discount?: number | null;
  image_url?: string | null;
  preview_images?: string[]; // for additional preview images
}

export default function ProductPage() {
  const { productId } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const promoToken = searchParams.get('promo');
  const [promoDiscount, setPromoDiscount] = useState<number | null>(null);

  useEffect(() => {
    if (!productId) return;

    async function fetchProduct() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();

        if (error) throw error;
        setProduct(data as Product);
      } catch (err) {
        console.error('Error fetching product:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchProduct();
  }, [productId]);
  useEffect(() => {
    if (product) {
      // Pick the main image: use product.image_url if it exists, otherwise first preview
      const firstImage =
        product.image_url ||
        (product.preview_images && product.preview_images.length > 0
          ? product.preview_images[0]
          : null);
      setMainImage(firstImage);
    }
  }, [product]);

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxImage(null);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);
  useEffect(() => {
    if (!product || !promoToken) return;

    // Call your backend to verify the token
    const verifyToken = async () => {
      try {
        const res = await fetch('/api/promo/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: promoToken, productId: product.id }),
        });

        const text = await res.text(); // read raw text first
        console.log('Raw response from verify API:', text);
        const data = JSON.parse(text);

        if (data.valid && data.pct) {
          const clamped = Math.min(Math.max(data.pct, 0), 100);
          setPromoDiscount(clamped);

          // ✅ Save promo token to localStorage
          localStorage.setItem('promoToken', promoToken);
          localStorage.setItem('promoPct', clamped.toString());
        } else {
          setPromoDiscount(null);
          localStorage.removeItem('promoToken');
          localStorage.removeItem('promoPct');
        }
      } catch (err) {
        console.error('Failed to verify promo token', err);
        setPromoDiscount(null);
      }
    };

    verifyToken();
  }, [product, promoToken]);
  if (loading)
    return (
      <div
        className="roboto-condensed-thin flex uppercase justify-center items-center min-h-screen bg-black text-white p-8 bg-cover relative"
        style={{
          backgroundImage:
            "url('https://yvrdqrvtohobvjuqprmy.supabase.co/storage/v1/object/public/hero-background-images/GymImage7v2.jpg')",
        }}
      >
        {/* Dim overlay */}
        <div className="absolute inset-0 bg-black/60"></div>
        <p className="relative z-10">Loading product...</p>
      </div>
    );

  if (!product)
    return (
      <div
        className="roboto-condensed-thin flex uppercase justify-center items-center min-h-screen bg-black text-white p-8 bg-cover relative"
        style={{
          backgroundImage:
            "url('https://yvrdqrvtohobvjuqprmy.supabase.co/storage/v1/object/public/hero-background-images/GymImage7v2.jpg')",
        }}
      >
        {/* Dim overlay */}
        <div className="absolute inset-0 bg-black/60"></div>
        <p className="relative z-10">Product not found.</p>
      </div>
    );

  const finalPrice = (() => {
    let price = product.price;

    // Apply DB discount first
    if (product.discount) price = Math.round(price * (1 - product.discount / 100));

    // Apply promo discount from API
    if (promoDiscount) price = Math.round(price * (1 - promoDiscount / 100));

    return price;
  })();

  return (
    <main
      className="roboto-condensed-thin min-h-screen bg-black text-white p-8 bg-cover relative"
      style={{
        backgroundImage:
          "url('https://yvrdqrvtohobvjuqprmy.supabase.co/storage/v1/object/public/hero-background-images/GymImage7v2.jpg')",
      }}
    >
      <div className="absolute inset-0 bg-black/60 pointer-events-none"></div>
      <BackButton className="text-white animate-fadeIn" label="Back to Store" backUrl="/store" />
      <div className="relative max-w-5xl mx-auto flex flex-col md:flex-row gap-8 animate-fadeIn">
        {/* Left: Main product image + preview images */}
        {/* Main image */}
        <div>
          {mainImage && (
            <img
              src={mainImage}
              alt={product.name}
              className="rounded shadow-[0_0_2px_#fff,inset_0_0_2px_#fff,0_0_5px_#08f,0_0_15px_#08f,0_0_30px_#08f] w-full max-w-md"
            />
          )}

          {/* Preview images */}
          {product.preview_images && product.preview_images.length > 0 && (
            <div className="flex gap-2 mt-2">
              {[product.image_url, ...product.preview_images].map((img, i) => (
                <img
                  key={i}
                  src={img || ''}
                  alt={`${product.name} preview ${i + 1}`}
                  className="w-20 h-20 mt-4 object-cover rounded-sm shadow hover:scale-102 transition cursor-pointer border-1 border-stone-400"
                  onClick={() => setLightboxImage(img || '')} // Open lightbox
                />
              ))}
            </div>
          )}
        </div>
        {/* Right: Product info */}
        <div className="flex-1 flex flex-col justify-start">
          <h1 className="text-4xl font-bold roboto-condensed-logo mb-4">{product.name}</h1>

          <p className="text-2xl font-semibold mb-4">
            ${(finalPrice / 100).toFixed(2)}
            {product.discount || promoToken ? (
              <span className="line-through text-stone-500 ml-2">
                ${(product.price / 100).toFixed(2)}
              </span>
            ) : null}
          </p>
          {product.description && <p className="text-stone-300 mb-4">{product.description}</p>}
          <button
            className="bg- mt-2 w-60 border-1 border-white hover:border-0 hover:shadow-[0_0_2px_#fff,inset_0_0_2px_#fff,0_0_5px_#08f,0_0_15px_#08f,0_0_30px_#08f] rounded-full hover:bg-white hover:text-black px-6 py-3 uppercase roboto-condensed-logo text-xl transition animate-pulseHover"
            onClick={() =>
              addToCart({
                id: product.id,
                name: product.name,
                price: product.price,
                discount: product.discount || 0,
                promoToken: promoToken || undefined, // ✅ preserve promo if present
                appliedPromoDiscount: promoDiscount || 0,
              })
            }
          >
            Add to Cart
          </button>
          {product.long_description && (
            <div className="mt-6 prose prose-invert max-w-none">
              <ReactMarkdown>{product.long_description}</ReactMarkdown>
            </div>
          )}
        </div>
      </div>

      {/* Lightbox overlay moved outside main content */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center cursor-zoom-out"
          onClick={() => setLightboxImage(null)}
        >
          <img
            src={lightboxImage}
            alt="Preview"
            className="max-h-[60%] max-w-[60%] rounded-sm shadow-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Tailwind keyframes */}
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

        @keyframes pulseHover {
          0%,
          100% {
            box-shadow: 0 0 5px #08f, 0 0 10px #08f;
          }
          50% {
            box-shadow: 0 0 10px #08f, 0 0 20px #08f;
          }
        }

        .animate-pulseHover:hover {
          animation: pulseHover 1.5s infinite;
        }
      `}</style>
    </main>
  );
}
