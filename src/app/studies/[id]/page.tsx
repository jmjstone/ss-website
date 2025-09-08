'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import Link from 'next/link';
import BackButton from '@/components/BackButton';
type Study = {
  id: string;
  name: string;
  authors: string;
  date: string;
  summary: string;
  description: string;
  link: string;
  category: 'Hypertrophy' | 'Nutrition' | 'Strength' | 'Health';
};

export default function StudyPage() {
  const { id } = useParams();
  const router = useRouter();
  const [study, setStudy] = useState<Study | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchStudy = async () => {
      const { data, error } = await supabase.from('studies').select('*').eq('id', id).single();

      if (error) {
        console.error('Error fetching study:', error);
        router.push('/studies'); // redirect back to studies list if not found
      } else {
        setStudy(data as Study);
      }
      setLoading(false);
    };

    fetchStudy();
  }, [id, router]);

  if (loading)
    return (
      <div className="flex min-h-screen bg-black justify-center items-center roboto-condensed-thin uppercase">
        <p className="p-6 text-stone-600">Loading study...</p>
      </div>
    );
  if (!study) return null;

  return (
    <div className="bg-white block m-auto justify-center">
      <div className="bg-white p-8 max-w-4xl mx-auto roboto-condensed-thin shadow-lg min-h-screen">
        <Link
          href="/studies"
          className="text-black uppercase roboto-condensed-logo mb-6 inline-block hover:text-blue-700"
        >
          ← Back to Studies
        </Link>
        <h1 className="text-3xl font-bold uppercase mb-4 text-black roboto-condensed-logo">
          {study.name}
        </h1>

        <p className="text-stone-700 mb-2">{study.authors}</p>
        <p className="text-stone-500 text-xs mb-4">
          {new Date(study.date).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: 'UTC',
          })}
        </p>

        <p className="text-stone-700 mb-6">{study.description}</p>

        <a
          href={study.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline hover:text-blue-700"
        >
          View full study
        </a>
      </div>
    </div>
  );
}
