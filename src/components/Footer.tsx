'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Footer() {
  const { user, isAdmin, logout, loading } = useAuth();
  return (
    <footer className="stonecolor text-white border-t border-stone-800 roboto-condensed-thin">
      <div className="max-w-7xl mx-auto px-6 py-16 flex flex-col md:flex-row justify-between gap-12">
        {/* Brand / Logo */}
        <div className="flex flex-col gap-4">
          <h1 className="font-[700] text-4xl roboto-condensed-logo italic">
            SS<span className="stoneslate">F.</span>
          </h1>
          <p className="text-stone-400 text-sm max-w-xs">
            Strength through science. Your source for training, nutrition, and evidence-based
            fitness.
          </p>
        </div>

        {/* Guides Section */}
        <div className="flex flex-col gap-3">
          <h3 className="uppercase text-lg font-bold stoneslate">Products</h3>
          <Link href="/store" className="hover:stoneslate transition">
            Store
          </Link>
          <Link href="/cart" className="hover:stoneslate transition">
            Cart
          </Link>
        </div>

        {/* Resources Section */}
        <div className="flex flex-col gap-3">
          <h3 className="uppercase text-lg font-bold stoneslate">Resources</h3>
          <Link href="/articles" className="hover:stoneslate transition">
            Articles
          </Link>
          <Link href="/studies" className="hover:stoneslate transition">
            Studies
          </Link>
          <Link href="/videos" className="hover:stoneslate transition">
            Videos
          </Link>
          <Link href="/calculators" className="hover:stoneslate transition">
            Calculators
          </Link>
        </div>

        {/* Coaching Section */}
        <div className="flex flex-col gap-3">
          <h3 className="uppercase text-lg font-bold stoneslate">Coaching</h3>
          <Link href="/coaching" className="hover:stoneslate transition">
            1-on-1 Coaching
          </Link>
          {loading ? (
            <p className="">LOADING...</p>
          ) : user ? (
            <>
              <Link href="/dashboard" className="hover:stoneslate transition">
                Dashboard
              </Link>
              {isAdmin && (
                <>
                  <Link href="/admin/new" className="text-white-600">
                    Create Post
                  </Link>
                  <Link href="/admin/studies" className="text-white-600">
                    Add Study
                  </Link>
                </>
              )}
            </>
          ) : (
            <Link href="/login" className="hover:stoneslate transition">
              Login
            </Link>
          )}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-stone-800 py-6 text-center text-sm text-stone-500">
        © {new Date().getFullYear()} Stone Science Fitness. All rights reserved.
      </div>
    </footer>
  );
}
