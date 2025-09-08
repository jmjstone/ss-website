'use client';

import { useState } from 'react';

export default function LeadCaptureForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus(data.error || 'Something went wrong.');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  return (
    <div className="p-6 bg-black text-white rounded-xl shadow-lg overflow-clip">
      <div className="flex flex-wrap items-center justify-evenly">
        <img
          className="hover:scale-102 transition duration-800 ease-in-out max-h-120 content-cover"
          src="https://yvrdqrvtohobvjuqprmy.supabase.co/storage/v1/object/public/preview_images/LiftersBlueprintPreview.png"
        ></img>
        <div
          style={{
            backgroundImage: `
      linear-gradient(to bottom, rgba(0,0,0,0.99), rgba(0,0,0,0) 30%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.99)),
      url('https://yvrdqrvtohobvjuqprmy.supabase.co/storage/v1/object/public/hero-background-images/GymImage1v2.jpg')
    `,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          className="flex gap-4 flex-1 items-center h-[500px] md:h-[400px] lg:h-[400px] bg-center bg-cover"
        >
          <div className="flex roboto-condensed-thin flex-1 flex-col gap-5">
            <h1 className="uppercase text-5xl text-wrap">Student looking for gains?</h1>
            <h1 className="uppercase roboto-condensed-thinx2 text-7xl">Look no further.</h1>
          </div>
          <div className="flex flex-1 flex-col">
            <h2 className="flex flex-col justify-center items-left uppercase roboto-condensed-thin text-3xl pb-2 font-bold ">
              <div className="flex flex-wrap items-center ">
                <p>
                  Get Your &nbsp;<i className="underline text-[36px] ">Free</i>&nbsp;
                </p>

                <p>Copy of:</p>
              </div>
              <p className="text-[40px] roboto-condensed-logo italic">
                The College Lifter's Blueprint
              </p>
            </h2>

            <form onSubmit={handleSubmit} className="flex flex-col gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className="flex-1 p-4 rounded-xl roboto-condensed-thin text-white border-1 border-white"
              />
              <p className="roboto-condensed-thinx2 text-stone-300 italic">
                *Email will be placed on Stone Science Fitness Email List
              </p>
              <button
                type="submit"
                className="bg-[#7fa9e4] min-w-20 outline-0 text-shadow-2 text-shadow-black outline-slate-200 roboto-condensed-logo uppercase text-white px-auto py-2 rounded-2xl text-3xl shadow-[0_0_1px_#fff,inset_0_0_1px_#fff,0_0_5px_#08f,0_0_5px_#08f,0_0_10px_#08f] hover:bg-white hover:text-slate-500 transition hover:scale-102"
              >
                Get It
              </button>
            </form>
            {status === 'loading' && <p className="mt-2 uppercase">Submitting...</p>}
            {status === 'success' && (
              <p className="mt-2 text-sky-400 uppercase bold">Check your inbox!</p>
            )}
            {status && status !== 'success' && status !== 'loading' && (
              <p className="mt-2 text-red-400 uppercase">{status}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
