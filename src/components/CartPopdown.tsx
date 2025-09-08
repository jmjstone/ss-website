'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';

export default function CartPopdown() {
  const { showPopdown, lastAddedItem, closePopdown, cart } = useCart();
  const router = useRouter();

  if (!showPopdown || !lastAddedItem) return null;

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Your cart is empty');
      return;
    }

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cart }),
      });

      const data = await res.json();

      if (!data.clientSecret) {
        console.error('No clientSecret returned', data);
        return;
      }

      closePopdown();
      router.push(`/checkout?clientSecret=${data.clientSecret}`);
    } catch (err) {
      console.error(err);
    }
  };
  return (
    <div className="fixed top-20 right-6 z-50 w-96 uppercase roboto-condensed-thin bg-neutral-900/95 backdrop-blur-xl text-white border border-white/10 rounded-2xl shadow-2xl animate-slideDown">
      <div className="p-6 space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-1">Item Added</h2>
          <p className="text-sm text-neutral-300">{lastAddedItem.name}</p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/cart"
            className="flex-1 text-center border-1 border-white py-2.5 roboto-condensed-logo rounded-full text-white hover:text-black font-medium hover:bg-white transition"
            onClick={closePopdown}
          >
            Go to Cart
          </Link>
          <button
            onClick={handleCheckout}
            className="flex-1 text-center border-1 bg-[#7fa9e4] py-2.5 roboto-condensed-logo rounded-full font-medium hover:text-slate-400 hover:shadow-[0_0_2px_#fff,inset_0_0_2px_#fff,0_0_5px_#08f,0_0_15px_#08f,0_0_30px_#08f] uppercase hover:bg-white hover:border-1 hover:border-white transition"
          >
            Checkout
          </button>
        </div>

        <button
          className="w-full py-2.5 rounded-full roboto-condensed-thin border-1 border-dash bg-neutral-800 hover:bg-white hover:text-black uppercase text-neutral-200 font-medium transition"
          onClick={closePopdown}
        >
          Continue Shopping
        </button>
      </div>

      {/* Tailwind keyframes for animation */}
      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
