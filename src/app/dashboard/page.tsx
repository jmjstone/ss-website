'use client';

import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function DashboardPage() {
  const { userProfile, logout } = useAuth(); // Full profile + logout function

  const isAdmin = userProfile?.is_admin ?? false;

  const handleLogout = async () => {
    await logout();
    // Optionally redirect to homepage
    window.location.href = '/login';
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen p-6 bg-stone-900 text-white roboto-condensed-thin">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold uppercase roboto-condensed-logo mb-6">Dashboard</h1>

          <div className="bg-stone-800 p-6 rounded-none shadow-lg">
            <p className="text-lg mb-2 uppercase">Welcome {userProfile?.first_name ?? 'User'}</p>
            <p className="text-sm text-stone-400">
              From here you can manage your account, access coaching content, or{' '}
              {isAdmin ? 'perform administrative tasks.' : 'view your content.'}
            </p>
          </div>

          {/* User action cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
            <div className="bg-stone-800 p-6 rounded-none shadow-lg hover:bg-stone-700 transition">
              <h2 className="text-xl font-bold roboto-condensed-logo uppercase mb-2">
                1-on-1 Coaching
              </h2>
              <p className="text-sm text-stone-400">
                Access your coaching materials and appointments.
              </p>
            </div>

            {isAdmin && (
              <div className="bg-stone-800 p-6 rounded-none shadow-lg transition">
                <h2 className="text-xl font-bold roboto-condensed-logo uppercase mb-2">
                  Management
                </h2>
                <p className="text-sm text-stone-400 mb-4">
                  Admin tools for creating posts and adding studies.
                </p>
                <div className="flex flex-col gap-2">
                  <Link
                    href="/admin/new"
                    className="bg-slate-600 px-4 py-2 uppercase hover:bg-white hover:text-black text-white text-center"
                  >
                    Create Post
                  </Link>
                  <Link
                    href="/admin/studies"
                    className="bg-slate-600 px-4 py-2 uppercase hover:bg-white hover:text-black text-white text-center"
                  >
                    Add Study
                  </Link>
                </div>
              </div>
            )}

            {/* Logout Card */}
            <div
              onClick={handleLogout}
              className="bg-red-900 cursor-pointer p-2 rounded-none shadow-lg hover:bg-white hover:text-black transition text-center flex flex-col justify-center items-center"
            >
              <h2 className="text-xl font-bold roboto-condensed-logo uppercase mb-0">Logout</h2>
              <p className="text-sm ">Sign out of your account</p>
            </div>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
