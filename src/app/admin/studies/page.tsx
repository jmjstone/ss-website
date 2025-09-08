'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import BackButton from '@/components/BackButton';
export default function AddStudyPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [authors, setAuthors] = useState('');
  const [date, setDate] = useState('');
  const [link, setLink] = useState('');
  const [category, setCategory] = useState<'Hypertrophy' | 'Nutrition' | 'Strength' | 'Health'>(
    'Hypertrophy',
  );
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/addStudy/route.ts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, authors, date, link, category, summary, description }),
      });

      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || 'Unknown error');

      router.push('/admin/studies');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute requireAdmin>
      <div className="p-6 max-w-3xl mx-auto roboto-condensed-thin">
        <BackButton className="text-white" label="Dashboard" backUrl="/dashboard"></BackButton>
        <h1 className="text-3xl font-bold mb-6 uppercase text-white">Add Study</h1>

        <form onSubmit={handleSubmit} className="space-y-4 bg-stone-900 p-6  shadow-lg">
          {/* Name */}
          <input
            type="text"
            placeholder="Study Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2  bg-stone-700 text-white"
            required
          />
          {/* Authors */}
          <input
            type="text"
            placeholder="Authors"
            value={authors}
            onChange={(e) => setAuthors(e.target.value)}
            className="w-full p-2  bg-stone-700 text-white"
            required
          />
          {/* Date */}
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-2  bg-stone-700 text-white"
            required
          />
          {/* Link */}
          <input
            type="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="Study URL"
            className="w-full p-2  bg-stone-700 text-white"
            required
          />
          {/* Category */}
          <div className="flex gap-2 mb-4 flex-wrap">
            {['Hypertrophy', 'Nutrition', 'Strength', 'Health'].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() =>
                  setCategory(cat as 'Hypertrophy' | 'Nutrition' | 'Strength' | 'Health')
                }
                className={`px-4 py-2 uppercase font-semibold rounded-none transition-colors duration-300 ${
                  category === cat
                    ? 'bg-slate-600 text-white'
                    : 'bg-stone-700 text-white hover:bg-white hover:text-black'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          {/* Summary */}
          <textarea
            placeholder="Summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="w-full p-2  bg-stone-700 text-white"
            required
          />
          {/* Description */}
          <textarea
            placeholder="Description / Abstract"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2  bg-stone-700 text-white"
            required
          />

          {error && <p className="text-red-500">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-slate-600 text-white px-4 py-2  hover:bg-white hover:text-black transition-colors"
          >
            {loading ? 'Saving...' : 'Add Study'}
          </button>
        </form>
      </div>
    </ProtectedRoute>
  );
}
