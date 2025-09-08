'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    const error = await login(email, password);
    if (error) {
      alert(error);
      return;
    }
    router.push('/dashboard');
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-stone-900 rounded-none shadow-lg roboto-condensed-thin text-white">
      <h1 className="text-3xl font-bold uppercase roboto-condensed-logo mb-6 text-white">Login</h1>

      <div className="space-y-4">
        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 bg-stone-700 rounded-none text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#7fa9e4]"
          required
        />

        {/* Password */}
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
        onClick={handleLogin}
        disabled={loading}
        className="w-full mt-6 bg-slate-600 roboto-condensed-logo uppercase text-lg hover:bg-white hover:text-black px-6 py-3 rounded-none transition-colors duration-300"
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>

      {/* Signup link */}
      <p className="mt-4 text-center text-stone-400">
        New here?{' '}
        <a href="/signup" className="underline hover:text-white">
          Create Account
        </a>
      </p>
    </div>
  );
}
