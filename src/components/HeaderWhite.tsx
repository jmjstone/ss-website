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

export default function HeaderWhite() {
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

  return (
    <>
      <header
        className={`fixed justify-between max-h-[56px] min-h-[56px] items-center flex top-0 left-0 w-full z-50 border-b border-stone-300 text-black flex justify-between items-center text-l font-[500] text-nowrap transition-colors duration-300 bg-white`}
      >
        <h1 className="font-[700] pt-1 items-center flex">
          <Link
            href="/"
            className="italic flex px-2 py-1 hover:scale-104 transition duration-300 text-black hover:text-black"
          >
            <div className="flex items-baseline gap-[2px] w-full">
              <img
                className=" border-black max-h-[46px] mt-1 min-h-[46px]"
                src="https://yvrdqrvtohobvjuqprmy.supabase.co/storage/v1/object/public/assets/SSLogoBlack.png"
                alt="Stone Science Logo"
              />
              <p className="">&copy;</p>
              {/* <p className="text-[64px] roboto-condensed-logo text-blue-400">FIT.</p> */}
            </div>
          </Link>
        </h1>

        <nav className="flex items-center uppercase roboto-condensed-thin">
          {/* Desktop links (hidden on small screens) */}

          {/* Always-visible items */}

          <Link
            href="/cart"
            className="px-4 py-4 flex items-center hover:bg-white group hover:text-black transition relative"
            aria-label="View cart"
            title="Cart"
          >
            <ShoppingCart size={20} />
          </Link>
        </nav>
      </header>
    </>
  );
}
