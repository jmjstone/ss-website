'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    const user = data.user ?? data.session?.user;

    if (user) {
      try {
        const res = await fetch('/api/createProfile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: user.id,
            email: user.email,
            first_name: firstName,
            last_name: lastName,
          }),
        });

        const result = await res.json();

        if (result.error) {
          console.error('Profile creation failed:', result.error);
          alert('Profile creation failed. Contact support.');
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error('Profile creation request failed:', err);
      }
    }

    alert('Account created! Please check your email for confirmation.');
    setLoading(false);
    router.push('/login');
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-stone-900 rounded-none shadow-lg roboto-condensed-thin text-white">
      <h1 className="text-3xl font-bold uppercase roboto-condensed-logo mb-6 text-white">
        Sign Up
      </h1>

      <div className="space-y-4">
        {/* First & Last Name */}
        <input
          type="text"
          placeholder="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full p-3 bg-stone-700 rounded-none text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#7fa9e4]"
          required
        />
        <input
          type="text"
          placeholder="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full p-3 bg-stone-700 rounded-none text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#7fa9e4]"
          required
        />

        {/* Email & Password */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 bg-stone-700 rounded-none text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#7fa9e4]"
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 bg-stone-700 rounded-none text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#7fa9e4]"
          required
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSignup}
        disabled={loading}
        className="w-full mt-6 bg-slate-600 roboto-condensed-logo uppercase text-lg hover:bg-white hover:text-black px-6 py-3 rounded-none transition-colors duration-300"
      >
        {loading ? 'Signing Up...' : 'Sign Up'}
      </button>

      {/* Login link */}
      <p className="mt-4 text-center text-stone-400">
        Already have an account?{' '}
        <a href="/login" className="underline hover:text-white">
          Login
        </a>
      </p>
    </div>
  );
}
