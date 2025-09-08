'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  email: string | null;
  items: OrderItem[];
  amount: number;
  currency: string;
  discount: { type: string; value: number } | null;
  created_at: string;
}

interface Product {
  id: string;
  name: string;
  price: number;
  image_url?: string | null;
}

// Separate component that uses useSearchParams
function SuccessContent() {
  const searchParams = useSearchParams();
  const paymentIntentId = searchParams.get('payment_intent');
  const supabase = createClientComponentClient();
  const router = useRouter();
  const { cart, addToCart } = useCart();
  const { clearCart } = useCart();

  const [order, setOrder] = useState<Order | null>(null);
  const [recommended, setRecommended] = useState<Product[]>([]);
  const [promoTokens, setPromoTokens] = useState<Record<string, string>>({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch order from Supabase
  useEffect(() => {
    if (!paymentIntentId) {
      setError('Missing payment reference.');
      setLoading(false);
      return;
    }

    const fetchOrder = async () => {
      try {
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('stripe_payment_intent_id', paymentIntentId)
          .single();

        if (error || !data) {
          console.error(error);
          setError('Order not found.');
        } else {
          setOrder(data as Order);
        }
      } catch (err) {
        console.error(err);
        setError('Failed to fetch order.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [paymentIntentId, supabase]);

  // Fetch recommended products (exclude purchased items)
  useEffect(() => {
    if (!order) return;

    const fetchRecommended = async () => {
      try {
        const purchasedIds = order.items.map((i) => i.id);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .not('id', 'in', `(${purchasedIds.join(',')})`)
          .limit(3);

        if (error) {
          console.error('Failed to fetch recommended products:', error);
        } else {
          setRecommended(data as Product[]);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchRecommended();
  }, [order, supabase]);

  // Mint promo tokens for recommended items (once per id)
  useEffect(() => {
    const go = async () => {
      if (!order || recommended.length === 0) return;

      const missing = recommended.filter((p) => !promoTokens[p.id]);
      if (missing.length === 0) return;

      const updates: Record<string, string> = {};
      await Promise.all(
        missing.map(async (p) => {
          try {
            const res = await fetch('/api/promo/mint', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                paymentIntentId: new URLSearchParams(window.location.search).get('payment_intent'),
                productId: p.id,
                pct: 10,
              }),
            });
            const data = await res.json();
            if (res.ok && data.token) {
              updates[p.id] = data.token;
            }
          } catch (e) {
            console.error('mint failed for', p.id, e);
          }
        }),
      );
      if (Object.keys(updates).length) {
        setPromoTokens((prev) => ({ ...prev, ...updates }));
      }
    };
    go();
  }, [order, recommended]);

  // Clear cart once after order is fetched
  useEffect(() => {
    if (order) {
      clearCart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order]);

  if (loading)
    return (
      <div className="flex h-full uppercase justify-center m-auto">
        <p className=" roboto-condensed-logo p-6">Loading your order...</p>
      </div>
    );
  if (error)
    return (
      <div className="flex h-full uppercase justify-center m-auto">
        <p className=" roboto-condensed-logo p-6 text-red-500">{error}</p>
      </div>
    );
  if (!order)
    return (
      <div className="flex h-full uppercase justify-center m-auto">
        <p className=" roboto-condensed-logo p-6">No order details available.</p>
      </div>
    );

  return (
    <div className="min-h-[calc(100vh-40px)] roboto-condensed-thin flex flex-col items-center p-10 bg-gray-50 ">
      <div className="bg-white border-1 border-gray-200 rounded-2xl p-10 max-w-2xl  w-full">
        {/* Logo + Header */}
        <div className="flex items-baseline gap-0 w-full">
          <img
            className="border-1 border-black rounded-2xl p-1 max-w-18 min-w-18 mb-4 "
            src="/sslogoblack.png"
            alt="Stone Science Logo"
          />
          <p className="text-sm">&copy;</p>
        </div>
        <h1 className="text-2xl font-bold text-sky-600 mb-4">Thank you for your purchase!</h1>
        <p className="text-gray-700 mb-6">
          A receipt and order details has been sent to <strong>{order.email}</strong>.
        </p>
        {/* Order Summary */}
        <h2 className="text-lg font-semibold mb-2">Order Summary</h2>
        <div className="space-y-2 mb-4">
          {order.items?.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm text-gray-800 border-b pb-1">
              <span>
                {item.name} x {item.quantity}
              </span>
              <span>${(item.price / 100).toFixed(2)}</span>
            </div>
          ))}
        </div>
        {/* Discount */}
        {order.discount && (
          <p className="text-sm font-bold text-sky-600 mb-2">
            Discount applied:{' '}
            {order.discount.type === 'percent'
              ? `${order.discount.value}%`
              : `$${(order.discount.value / 100).toFixed(2)}`}
          </p>
        )}
        {/* Total */}
        <div className="flex justify-between text-lg font-bold border-t pt-3">
          <span>Total</span>
          <span>
            ${(order.amount / 100).toFixed(2)} {order.currency.toUpperCase()}
          </span>
        </div>
        {/* Order meta */}
        <p className="mt-6 text-sm text-gray-500">Order ID: {order.id}</p>
        <p className="text-sm text-gray-500">
          Placed on {new Date(order.created_at).toLocaleString()}
        </p>
        {/* Recommended Products */}
        {recommended.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-semibold mb-4">You might also like:</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {recommended?.map((product) => {
                const token = promoTokens[product.id];
                const promoHref = token
                  ? `/store/${product.id}?promo=${encodeURIComponent(token)}`
                  : `/store/${product.id}`;

                return (
                  <div
                    key={product.id}
                    className="border-0 hover:text-black hover:scale-102 transition rounded-lg p-4 flex flex-col items-center text-center"
                  >
                    {/* Product link */}
                    <Link href={promoHref} className="flex flex-col items-center">
                      {product.image_url && (
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="w-32 h-32 object-cover mb-2 rounded"
                        />
                      )}
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-gray-600">${(product.price / 100).toFixed(2)}</p>
                    </Link>

                    {/* Buy Now button */}
                    <button
                      disabled={!token}
                      className="mt-2 bg-green-600 disabled:opacity-50 text-white px-3 py-1 rounded hover:bg-green-700 transition"
                      onClick={() =>
                        addToCart({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          promoToken: token,
                        })
                      }
                    >
                      Buy Now -10%
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        {/* Return to Store */}
        <div className="flex justify-items-center mt-10">
          <Link
            href="/store"
            className="text-neutral-500 flex gap-1 uppercase m-auto text-lg font-bold hover:scale-102 hover:underline transition hover:pointer"
          >
            ← Return to Store
          </Link>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-full uppercase justify-center m-auto">
          <p className="roboto-condensed-logo p-6">Loading success page...</p>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
