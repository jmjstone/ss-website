'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react'; // you can use any icon library or SVG

type BackButtonProps = {
  label: string;
  backUrl?: string; // optional
  className?: string;
};

export default function BackButton({ label, backUrl = '/', className }: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (backUrl) {
      router.push(backUrl);
    } else {
      router.back();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`flex items-center gap-2 hover:cursor-pointer roboto-condensed-logo font-bold uppercase hover:text-neutral-400 transition-colors duration-200 ${className}`}
    >
      <ArrowLeft size={20} />
      {label.toUpperCase()}
    </button>
  );
}
