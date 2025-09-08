'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
}

export default function Toast({ message, type = 'success', onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000); // auto-close after 3s
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed top-20 right-6 z-50 min-w-[250px] max-w-sm px-5 py-3 rounded-lg border
        shadow-[0_0_5px_#08f,0_0_10px_#08f,inset_0_0_3px_#fff] 
        text-white flex items-center justify-between gap-3 animate-slideIn
        ${type === 'success' ? 'bg-black/90 border-blue-500' : 'bg-black/90 border-red-500'}
      `}
    >
      <span className="text-sm uppercase roboto-condensed-thin font-medium">{message}</span>
      <button onClick={onClose} className="text-white/70 hover:text-white transition">
        <X size={18} />
      </button>

      {/* Animations */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.25s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
