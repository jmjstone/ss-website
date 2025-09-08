'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Menu, X, User, ShoppingCart } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useCart } from '@/context/CartContext';

function DrawerPortal({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when open
  useEffect(() => {
    if (!mounted) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = open ? 'hidden' : original || '';
    return () => {
      document.body.style.overflow = original;
    };
  }, [open, mounted]);

  if (!mounted) return null;

  return createPortal(
    <>
      {/* Dim overlay */}
      <div
        className={`fixed inset-0 z-[9998] transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        aria-hidden
        onClick={onClose}
      />

      {/* Slide-in panel */}
      <aside
        className={`fixed top-0 right-0 h-full w-72 bg-[#151211]/80 backdrop-blur-[6px] border-l border-stone-700 z-[9999] transform transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        // Ensure this stack is isolated from any parent backdrop/filters
        style={{ isolation: 'isolate' }}
      >
        <div className="flex justify-end p-4">
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="p-1 text-white hover:text-stone-400"
          >
            <X size={28} />
          </button>
        </div>
        <nav className="flex flex-col uppercase roboto-condensed-thin">{children}</nav>
      </aside>
    </>,
    document.body,
  );
}

export default function Header() {
  const { user, loading } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { cart } = useCart();
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Solid header when menu is open; otherwise keep your scroll behavior
  const headerSkin = menuOpen
    ? 'bg-[#151211]' // solid when drawer open
    : scrolled
    ? 'bg-[#151211]/40 backdrop-blur-[6px]'
    : 'bg-[#151211]';

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 border-b border-stone-800 text-white flex justify-between items-center text-l font-[500] text-nowrap transition-colors duration-300 ${headerSkin}`}
      >
        {/*
        <h1 className="font-[700] text-5xl roboto-condensed-logo">
          <Link
            href="/"
            className="italic flex px-4 py-1 hover:scale-104 transition duration-300 hover:text-white"
          >
            SS<p className="stoneslate">F.</p>
          </Link>
        </h1>
*/}
        <Link href="/" className="flex max-h-14 pr-1 pl-2 items-center hover:scale-102 transition">
          <img className="max-w-16 min-w-16" src="/sslogowhite.png" alt="Stone Science Logo"></img>
          <p className="roboto-condensed-logo pl-1 stoneslate mt-[4px] text-[64px] uppercase italic">
            FIT.
          </p>
        </Link>
        <nav className="flex items-center uppercase roboto-condensed-thin">
          {/* Desktop links (hidden on small screens) */}
          <div className="hidden md:flex">
            <Link href="/blog" className="px-4 py-4 hover:bg-white hover:text-black transition">
              ARTICLES
            </Link>
            <Link href="/studies" className="px-4 py-4 hover:bg-white hover:text-black transition">
              STUDIES
            </Link>
            <Link href="/videos" className="px-4 py-4 hover:bg-white hover:text-black transition">
              VIDEOS
            </Link>
            <Link
              href="/calculators"
              className="px-4 py-4 hover:bg-white hover:text-black transition"
            >
              CALCULATORS
            </Link>
            <Link href="/guides" className="px-4 py-4 hover:bg-white hover:text-black transition">
              GUIDES
            </Link>
            <Link href="/coaching" className="px-4 py-4 hover:bg-white hover:text-black transition">
              COACHING
            </Link>
          </div>

          {/* Always-visible items */}
          <Link href="/store" className="px-4 py-4 hover:bg-white hover:text-black transition">
            STORE
          </Link>

          {loading ? (
            <p className="px-4 py-4">LOADING...</p>
          ) : user ? (
            <Link
              href="/dashboard"
              className="w-10 h-10 border-2 mx-2 border-white text-white flex items-center justify-center hover:text-black hover:bg-white transition rounded-full"
              aria-label="Open dashboard"
              title="Dashboard"
            >
              <User size={20} />
            </Link>
          ) : (
            <Link
              href="/login"
              className="bg-slate-700 text-white px-4 py-4 hover:bg-white hover:text-black transition"
            >
              LOGIN
            </Link>
          )}
          <Link
            href="/cart"
            className="px-4 py-[18px] flex items-center hover:bg-white group hover:text-black transition relative"
            aria-label="View cart"
            title="Cart"
          >
            <ShoppingCart size={20} />
            {cart.length > 0 && (
              <span className="absolute -top-[-30px] -right-[0px] group-hover:text-black text-white roboto-condensed-thin text-s w-4 h-4 flex items-center justify-center rounded-full">
                {cart.length}
              </span>
            )}
          </Link>
          {/* Hamburger (mobile only) */}
          <button
            onClick={() => setMenuOpen(true)}
            className="md:hidden px-4 py-4 hover:bg-white hover:text-black transition"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            aria-controls="mobile-drawer"
          >
            <Menu size={24} />
          </button>
        </nav>
      </header>

      {/* Drawer rendered OUTSIDE the header via a portal */}
      <DrawerPortal open={menuOpen} onClose={() => setMenuOpen(false)}>
        <Link
          href="/cart"
          className="px-6 py-4 text-white hover:bg-white hover:text-black flex items-center"
          onClick={() => setMenuOpen(false)}
        >
          <ShoppingCart size={20} className="mr-2" /> Cart
          {cart.length ? <p>&nbsp; ({cart.length})</p> : null}
        </Link>
        <Link
          href="/blog"
          className="px-6 py-4 text-white hover:bg-white hover:text-black"
          onClick={() => setMenuOpen(false)}
        >
          ARTICLES
        </Link>
        <Link
          href="/studies"
          className="px-6 py-4 text-white hover:bg-white hover:text-black"
          onClick={() => setMenuOpen(false)}
        >
          STUDIES
        </Link>
        <Link
          href="/videos"
          className="px-6 py-4 text-white hover:bg-white hover:text-black"
          onClick={() => setMenuOpen(false)}
        >
          VIDEOS
        </Link>
        <Link
          href="/calculators"
          className="px-6 py-4 text-white hover:bg-white hover:text-black"
          onClick={() => setMenuOpen(false)}
        >
          CALCULATORS
        </Link>
        <Link
          href="/guides"
          className="px-6 py-4 text-white hover:bg-white hover:text-black"
          onClick={() => setMenuOpen(false)}
        >
          GUIDES
        </Link>
        <Link
          href="/coaching"
          className="px-6 py-4 text-white hover:bg-white hover:text-black"
          onClick={() => setMenuOpen(false)}
        >
          COACHING
        </Link>
        <Link
          href="/store"
          className="px-6 py-4 text-white hover:bg-white hover:text-black"
          onClick={() => setMenuOpen(false)}
        >
          STORE
        </Link>

        {user ? (
          <Link
            href="/dashboard"
            className="px-6 py-4 text-white hover:bg-white hover:text-black"
            onClick={() => setMenuOpen(false)}
          >
            DASHBOARD
          </Link>
        ) : (
          <Link
            href="/login"
            className="px-6 py-4 text-white hover:bg-white hover:text-black"
            onClick={() => setMenuOpen(false)}
          >
            LOGIN
          </Link>
        )}
      </DrawerPortal>
    </>
  );
}
