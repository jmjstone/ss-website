'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState, useRef } from 'react';

export default function BackgroundWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const whitePages = ['/cart', '/studies'];
  const isWhitePage = whitePages.some((page) => pathname?.startsWith(page));

  const [minHeight, setMinHeight] = useState<number | undefined>(undefined);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateHeight = () => {
      const header = document.querySelector('header');
      const footer = document.querySelector('footer');
      const headerHeight = header?.clientHeight || 0;
      const footerHeight = footer?.clientHeight || 0;
      const viewportHeight = window.innerHeight;

      setMinHeight(viewportHeight - headerHeight - footerHeight);
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  return (
    <div
      ref={wrapperRef}
      className={`${isWhitePage ? 'bg-white' : 'bg-foreground'} flex-1`}
      style={{ minHeight: minHeight ? `${minHeight}px` : '100%' }}
    >
      {children}
    </div>
  );
}
