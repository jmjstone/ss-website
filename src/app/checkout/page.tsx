'use client';
import { useState, useEffect, Suspense } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useSearchParams } from 'next/navigation';
import { useCart } from '@/context/CartContext';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function CheckoutForm({ clientSecret }: { clientSecret: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    if (!email) {
      setError('Please enter your email');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1️⃣ Submit the Payment Element immediately
      elements.submit();

      // 2️⃣ Then confirm the PaymentIntent
      const { error: stripeError } = await stripe.confirmPayment({
        elements,
        clientSecret, // MUST pass server-created clientSecret
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success?payment_intent={PAYMENT_INTENT_ID}`,
          receipt_email: email,
        },
      });

      if (stripeError) {
        setError(stripeError.message || 'Payment failed');
        console.error(stripeError);
      }
    } catch (err) {
      console.error(err);
      setError('Unexpected error during payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-md">
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="p-2 rounded text-black border border-gray-300"
        required
      />
      <PaymentElement />
      {error && <p className="text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="bg-sky-600 px-6 py-3 rounded-lg mt-2 text-lg font-bold text-white hover:bg-sky-700 transition"
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
    </form>
  );
}

// Separate component that uses useSearchParams
function CheckoutContent() {
  const searchParams = useSearchParams();
  const initialClientSecret = searchParams.get('clientSecret');
  const { cart, getTotal } = useCart();

  const [discountCode, setDiscountCode] = useState('');
  const [discount, setDiscount] = useState<{ type: string; value: number } | null>(null);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [applyingDiscount, setApplyingDiscount] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(initialClientSecret);

  // Apply discount code
  const applyDiscount = async () => {
    if (!discountCode) return;
    setApplyingDiscount(true);
    setDiscountError(null);

    try {
      const res = await fetch('/api/discount/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: discountCode, cartTotal: getTotal() }),
      });
      const data = await res.json();

      if (!data.valid) {
        setDiscountError(data.message || 'Invalid code');
        setDiscount(null);
      } else {
        setDiscount({ type: data.type, value: data.value });
        setDiscountCode('');
      }
    } catch (err) {
      console.error(err);
      setDiscountError('Error validating code');
      setDiscount(null);
    }

    setApplyingDiscount(false);
  };

  // Re-create PaymentIntent whenever cart or discount changes
  useEffect(() => {
    const createPaymentIntent = async () => {
      if (cart.length === 0) return;

      try {
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: cart, discount }),
        });
        const data = await res.json();
        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error('Failed to create PaymentIntent', err);
      }
    };

    createPaymentIntent();
  }, [cart, discount]);

  const totalCents = (() => {
    let total = getTotal();
    if (discount) {
      if (discount.type === 'percent') total = Math.round(total * (1 - discount.value / 100));
      else total -= discount.value;
    }
    if (total < 0) total = 0;
    return total;
  })();

  if (!clientSecret) return <p>Loading payment...</p>;

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <div className="flex flex-col md:flex-row roboto-condensed-thin min-h-[calc(100vh-40px)] bg-white">
        {/* Left: Checkout form */}
        <div className="flex-1 pt-8  roboto-condensed-thin flex justify-center items-start p-6 md:max-w-6xl">
          <CheckoutForm clientSecret={clientSecret} />
        </div>

        {/* Middle divider */}
        <div className="hidden md:block w-px bg-gray-300"></div>

        {/* Right: Cart summary */}
        <div className="flex-1 p-6 pt-20 pl-8 roboto-condensed-thin bg-gray-50">
          <div className="flex flex-col gap-4">
            {cart.map((item) => {
              // 1️⃣ Compute display price per unit including promo
              let displayPrice = item.price;
              if (item.discount)
                displayPrice = Math.round(displayPrice * (1 - item.discount / 100));
              if (item.promoToken) displayPrice = Math.round(displayPrice * 0.9); // 10% off for promo

              return (
                <div key={item.id} className="flex items-center gap-4">
                  {item.image_url && (
                    <img
                      src={item.image_url}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded"
                    />
                  )}
                  <div className="flex-1">
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity} • ${(displayPrice / 100).toFixed(2)}
                    </p>
                  </div>
                  <p className="font-medium text-black">
                    ${((displayPrice * item.quantity) / 100).toFixed(2)}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Discount code input */}
          <div className="mt-4 mb-2 flex gap-2">
            <input
              type="text"
              placeholder="Discount code"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              className="p-3 rounded-lg border bg-white border-gray-200 flex-1"
            />
            <button
              type="button"
              onClick={applyDiscount}
              disabled={applyingDiscount}
              className="bg-neutral-100 border-1 border-gray-200 text-gray-500 font-bold px-4 py-2 rounded-lg hover:bg-gray-50 transition"
            >
              {applyingDiscount ? 'Applying...' : 'Apply'}
            </button>
          </div>
          {discountError && <p className="text-red-500 text-sm">{discountError}</p>}
          {discount && (
            <p className="text-green-600 text-sm">
              Discount applied:{' '}
              {discount.type === 'percent'
                ? `${discount.value}%`
                : `$${(discount.value / 100).toFixed(2)}`}
            </p>
          )}

          {/* Total */}
          <div className="flex mt-6 pt-4 justify-between border-gray-300 text-right">
            <p className="text-xl text-black font-bold">Total</p>
            <div className="flex items-baseline gap-2">
              <p className="text-sm font-light text-neutral-600 uppercase">usd</p>
              <p className="text-xl text-black font-bold">${(totalCents / 100).toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </Elements>
  );
}

// Main component with Suspense boundary
export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen">Loading checkout...</div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
