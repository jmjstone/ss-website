'use client';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Toast from '@/components/Toast';
import { Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
  const { cart, removeFromCart, getTotal, clearCart, updateQuantity } = useCart();
  const router = useRouter();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleCheckout = async () => {
    if (cart.length === 0) {
      setToast({ message: 'Your cart is empty', type: 'error' });
      return;
    }

    try {
      // Map cart items to ensure promoToken is sent
      const itemsWithPromo = cart.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        promoToken: item.promoToken || null, // include the token if present
      }));

      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: itemsWithPromo }),
      });

      const data = await res.json();

      if (!data.clientSecret) {
        setToast({ message: 'Checkout failed. Please try again.', type: 'error' });
        return;
      }

      setToast({ message: 'Redirecting to checkout...', type: 'success' });
      router.push(`/checkout?clientSecret=${data.clientSecret}`);
    } catch (err) {
      console.error(err);
      setToast({ message: 'Something went wrong.', type: 'error' });
    }
  };

  return (
    <div className=" min-h-full bg-white">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="flex-1 flex flex-col max-w-7xl mx-auto p-6">
        <Link
          href="/store"
          className="text-black uppercase roboto-condensed-logo mb-6 inline-block hover:text-blue-700"
        >
          ← Continue Shopping
        </Link>
        <h1 className="text-3xl roboto-condensed-logo font-bold text-black uppercase mb-6">
          Your Cart
        </h1>
        <div className="border-b p-2 border-gray-200 mb-6 pb-4 roboto-condensed-thin uppercase flex justify-between">
          <p>Product</p>
          <div className="flex gap-49">
            <p>Quantity</p>
            <p>Total</p>
          </div>
        </div>
        {cart.length === 0 ? (
          <p className="roboto-condensed-thin text-stone-600 ">Your cart is empty.</p>
        ) : (
          <div className="flex flex-col gap-4 ">
            {cart.map((item) => {
              // compute display price per unit
              let displayPrice = item.price;
              if (item.discount) {
                displayPrice = Math.round(displayPrice * (1 - item.discount / 100));
              }
              if (item.promoToken) {
                displayPrice = Math.round(displayPrice * 0.9); // 10% off for promo token
              }

              return (
                <div
                  key={item.id}
                  className="flex justify-between items-center p-2 bg-gray-50 border-gray-200"
                >
                  {/* Left: Product image + info */}
                  <div className="flex gap-2">
                    {item.image_url && (
                      <div className="w-20 h-30 flex-shrink-0 mr-4">
                        <img
                          src={item.image_url}
                          alt={item.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                    <div className="flex flex-col gap-1">
                      <p className="roboto-condensed-logo font-semibold text-black">{item.name}</p>
                      <p className="roboto-condensed-thin text-stone-600 text-sm">
                        Price: ${(displayPrice / 100).toFixed(2)} x {item.quantity}
                      </p>
                    </div>
                  </div>

                  {/* Right: Quantity + remove + total */}
                  <div className="flex justify-between gap-20">
                    <div className="flex items-center border rounded overflow-hidden">
                      <button
                        className="px-2 py-1 bg-gray-200 hover:bg-gray-300 transition"
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      >
                        -
                      </button>
                      <span className="px-3 py-1 roboto-condensed-thin text-black">
                        {item.quantity}
                      </span>
                      <button
                        className="px-2 py-1 bg-gray-200 hover:bg-gray-300 transition"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        +
                      </button>
                    </div>

                    <button
                      className="text-red-600 pb-1 roboto-condensed-thin hover:cursor-pointer hover:text-red-800 font-medium transition"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>

                    <p className="roboto-condensed-logo text-black mr-1 pt-1">
                      ${((displayPrice * item.quantity) / 100).toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })}
            <button
              className="flex-1 w-30 py-2 uppercase border hover:cursor-pointer border-gray-300 bg-white hover:bg-gray-100 text-black roboto-condensed-logo transition"
              onClick={clearCart}
            >
              Clear Cart
            </button>
            <div className="flex mt-3 justify-between font-bold text-xl text-right border-t-1 border-neutral-300 py-5 roboto-condensed-logo text-black">
              <div></div>
              <div className="flex items-center uppercase">
                <p className="text-md">Estimated Total &nbsp; &nbsp;</p>
                <p className="text-2xl text-stone-700 roboto-condensed-thin">
                  ${(getTotal() / 100).toFixed(2)} USD
                </p>
              </div>
            </div>

            <div className="flex gap-4 mt-4 flex-wrap">
              <button
                className="flex-1 py-3 uppercase hover:cursor-pointer text-xl bg-black hover:border-black  text-white roboto-condensed-logo transition"
                onClick={handleCheckout}
              >
                Checkout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
