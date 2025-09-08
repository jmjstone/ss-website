'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function CoachingPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const data = {
      first_name: (form.elements.namedItem('first_name') as HTMLInputElement).value,
      last_name: (form.elements.namedItem('last_name') as HTMLInputElement).value,
      email: (form.elements.namedItem('email') as HTMLInputElement).value,
      phone: (form.elements.namedItem('phone') as HTMLInputElement)?.value || '',
      fitness_level: (form.elements.namedItem('fitness_level') as HTMLSelectElement)?.value || '',
      primary_goal: (form.elements.namedItem('primary_goal') as HTMLSelectElement)?.value || '',
      message: (form.elements.namedItem('message') as HTMLTextAreaElement).value,
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setSuccess(true);
        form.reset();
      } else {
        const err = await res.json();
        setError(err.message || 'Something went wrong.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="roboto-condensed-thin min-h-screen bg-black text-white p-8 bg-cover relative"
      style={{
        backgroundImage:
          "url('https://yvrdqrvtohobvjuqprmy.supabase.co/storage/v1/object/public/hero-background-images/GymImage7v2.jpg')",
      }}
    >
      {/* Overlay to darken image */}
      <div className="absolute inset-0 bg-black/60"></div>

      <div className="relative max-w-3xl mx-auto text-center">
        <h1 className="text-4xl font-bold uppercase mb-4 roboto-condensed-logo">1-on-1 Coaching</h1>
        <p className="text-lg text-stone-300 mb-8">
          Get personalized training, nutrition guidance, and accountability designed specifically
          for your goals. Fill out the form below to start the conversation.
        </p>

        {/* Form container with fade-in */}
        <form
          onSubmit={handleSubmit}
          className="bg-stone-800/80 backdrop-blur-[2px] p-6 rounded-none shadow-[0_0_2px_#fff,inset_0_0_2px_#fff,0_0_5px_#08f,0_0_15px_#08f,0_0_30px_#08f] flex flex-col gap-4 text-left opacity-0 animate-fadeIn"
        >
          <div className="flex gap-4">
            <label className="flex-1 flex flex-col gap-2">
              <span className="uppercase text-sm">First Name</span>
              <input
                type="text"
                name="first_name"
                required
                className="p-2 bg-stone-900 border border-stone-700 rounded-none"
              />
            </label>

            <label className="flex-1 flex flex-col gap-2">
              <span className="uppercase text-sm">Last Name</span>
              <input
                type="text"
                name="last_name"
                required
                className="p-2 bg-stone-900 border border-stone-700 rounded-none"
              />
            </label>
          </div>

          <label className="flex flex-col gap-2">
            <span className="uppercase text-sm">Email</span>
            <input
              type="email"
              name="email"
              required
              className="p-2 bg-stone-900 border border-stone-700 rounded-none"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="uppercase text-sm">Phone Number (optional)</span>
            <input
              type="tel"
              name="phone"
              className="p-2 bg-stone-900 border border-stone-700 rounded-none"
            />
          </label>

          <div className="flex gap-4">
            <label className="flex-1 flex flex-col gap-2">
              <span className="uppercase text-sm">Current Fitness Level (optional)</span>
              <select
                name="fitness_level"
                className="p-2 bg-stone-900 border border-stone-700 rounded-none"
              >
                <option value="">Select level</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </label>

            <label className="flex-1 flex flex-col gap-2">
              <span className="uppercase text-sm">Primary Goal (optional)</span>
              <select
                name="primary_goal"
                className="p-2 bg-stone-900 border border-stone-700 rounded-none"
              >
                <option value="">Select goal</option>
                <option value="Fat Loss">Fat Loss</option>
                <option value="Muscle Gain">Muscle Gain</option>
                <option value="Strength">Strength</option>
                <option value="Performance">Performance</option>
              </select>
            </label>
          </div>
          <label className="flex flex-col gap-2">
            <span className="uppercase text-sm">Message</span>
            <textarea
              name="message"
              rows={5}
              required
              className="p-2 bg-stone-900 border border-stone-700 rounded-none"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="bg-[#7fa9e4] mt-2 border-1 border-sky-800 hover:border-0 hover:shadow-[0_0_2px_#fff,inset_0_0_2px_#fff,0_0_5px_#08f,0_0_15px_#08f,0_0_30px_#08f] rounded-full hover:bg-white hover:text-black px-6 py-3 uppercase roboto-condensed-logo text-xl transition animate-pulseHover"
          >
            {loading ? 'Sending...' : 'Submit'}
          </button>

          {error && <p className="text-red-400 mt-2">{error}</p>}
        </form>

        {success && (
          <div className="bg-stone-800/80 backdrop-blur-[2px] shadow-[0_0_1px_#fff,inset_0_0_2px_#fff,0_0_5px_#08f,0_0_1px_#08f,0_0_12px_#08f] mt-10 p-3 gap-0 flex-col justify-center animate-fadeIn">
            <p className="text-2xl text-white mt-2">
              Thank you for contacting Stone Science Fitness!
            </p>
            <br />
            <p className="text-stone-300">
              We will contact you within the next 72 hours to begin your{' '}
              <i>Stone Science Fitness Journey.©</i>
            </p>
            <p className="text-stone-300">
              <Link href="/" className="underline hover:text-stone-500">
                Return to home
              </Link>
            </p>
          </div>
        )}
      </div>

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
