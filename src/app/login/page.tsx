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
    <div className="bg-white pb-50 pt-10">
      <div className="max-w-md mx-auto p-6 shadow-lg border-1 border-gray-300 bg-stone-200 rounded-none roboto-condensed-thin text-black">
        <h1 className="text-3xl font-bold uppercase roboto-condensed-logo mb-6 text-black">
          Login
        </h1>

        <div className="space-y-4">
          {/* Email */}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 bg-stone-100 rounded-none text-black placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-[#7fa9e4]"
            required
          />

          {/* Password */}
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 bg-stone-100 rounded-none text-black placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-[#7fa9e4]"
            required
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full mt-6 bg-slate-600 text-white hover:cursor-pointer roboto-condensed-logo uppercase text-lg hover:bg-white hover:text-black hover:border-1 hover:border-black px-6 py-3 rounded-none transition-colors duration-300"
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        {/* Signup link */}
        <p className="mt-4 text-center text-stone-600">
          New here?{' '}
          <a href="/signup" className="underline hover:text-black">
            Create Account
          </a>
        </p>
      </div>
    </div>
  );
}
