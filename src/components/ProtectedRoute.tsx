'use client';

import { ReactNode, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean; // <--- new prop
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/login'); // not logged in
      } else if (requireAdmin && !isAdmin) {
        router.replace('/dashboard'); // logged in but not admin
      }
    }
  }, [user, isAdmin, loading, requireAdmin, router]);

  if (loading || !user || (requireAdmin && !isAdmin)) {
    return <p className="p-4">Loading...</p>;
  }

  return <>{children}</>;
}
