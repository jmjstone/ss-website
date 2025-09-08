'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabaseClient';

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

export default function StudiesPage() {
  const [studies, setStudies] = useState<Study[]>([]);
  const [filteredStudies, setFilteredStudies] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<'All' | Study['category']>('All');

  useEffect(() => {
    const fetchStudies = async () => {
      const { data, error } = await supabase
        .from('studies')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching studies:', error);
      } else {
        setStudies(data as Study[]);
        setFilteredStudies(data as Study[]);
      }
      setLoading(false);
    };

    fetchStudies();
  }, []);

  // Filter studies when category changes
  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredStudies(studies);
    } else {
      setFilteredStudies(studies.filter((s) => s.category === selectedCategory));
    }
  }, [selectedCategory, studies]);

  const categories: ('All' | Study['category'])[] = [
    'All',
    'Hypertrophy',
    'Nutrition',
    'Strength',
    'Health',
  ];

  return (
    <div className="bg-white block min-h-screen max-w-full">
      <div className="bg-white p-6 max-w-7xl mx-auto">
        <h1 className="text-3xl roboto-condensed-logo text-black font-bold mb-2 uppercase">
          Studies
        </h1>
        <p className="text-stone-600 mb-10 uppercase roboto-condensed-thin">
          A curated source of meta-analyses and trusted studies on hypertrophy, nutrition, strength,
          and health sciences
        </p>

        {/* Category filter */}
        <div className="flex gap-4 mb-6 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 font-semibold transition ${
                selectedCategory === cat
                  ? 'bg-slate-600 text-white'
                  : 'bg-stone-200 hover:cursor-pointer text-black hover:bg-stone-300'
              }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="roboto-condensed-thin uppercase">Loading studies...</p>
        ) : filteredStudies.length === 0 ? (
          <p className="roboto-condensed-thin uppercase">No studies found.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudies.map((study) => (
              <StudyCard
                key={study.id}
                id={study.id}
                name={study.name}
                authors={study.authors}
                date={study.date}
                summary={study.summary}
                link={study.link}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

type StudyCardProps = {
  id: string;
  name: string;
  authors: string;
  date: string;
  summary: string;
  link: string;
};

function StudyCard({ id, name, authors, date, summary, link }: StudyCardProps) {
  return (
    <Link
      href={`/studies/${id}`}
      className="group block bg-stone-200 hover:bg-stone-100 transition transform p-6 roboto-condensed-thin"
    >
      <h2 className="uppercase text-2xl font-bold mb-2 text-black group-hover:text-black">
        {name}
      </h2>
      <p className="text-stone-700 text-sm mb-2">{authors}</p>
      <p className="text-stone-500 text-xs mb-4">
        {new Date(date).toLocaleDateString(undefined, {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: 'UTC',
        })}
      </p>
      <p className="text-stone-700 mb-4 group-hover:text-black">{summary}</p>
      <p className="text-blue-500 underline hover:text-blue-700 text-sm">View Study</p>
    </Link>
  );
}
