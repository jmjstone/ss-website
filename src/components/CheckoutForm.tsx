'use client';

import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { useState } from 'react';

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Redirect to your success page after payment
        return_url: `${window.location.origin}/store?success=true`,
      },
    });

    if (error) {
      setMessage(error.message || 'Payment failed');
    }

    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto flex flex-col gap-4 p-6 bg-stone-800 rounded"
    >
      <PaymentElement />
      <button
        type="submit"
        disabled={loading || !stripe || !elements}
        className="bg-blue-600 hover:bg-white hover:text-black px-6 py-3 rounded uppercase font-bold transition mt-4"
      >
        {loading ? 'Processing...' : 'Pay Now'}
      </button>
      {message && <p className="text-red-400 mt-2">{message}</p>}
    </form>
  );
}
