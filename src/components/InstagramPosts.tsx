'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import Link from 'next/link';
const images = [
  '/InstagramShowcaseImage1.png',
  '/SSFGold.png',
  'https://yvrdqrvtohobvjuqprmy.supabase.co/storage/v1/object/public/preview_images/LiftersBlueprintPreview.png',
  '/instagramShowcaseImage3.png',
  '/SSFSlate.png',
  'https://yvrdqrvtohobvjuqprmy.supabase.co/storage/v1/object/public/product-images/8WeekSemesterShredsImage1.jpg',
  'https://yvrdqrvtohobvjuqprmy.supabase.co/storage/v1/object/public/product-images/8WeekSemesterShredsProgramCover.jpg',
];

export default function InstagramGallery() {
  const [mounted, setMounted] = useState(false); // ensures client-only render
  const [current, setCurrent] = useState<number | null>(null);
  const [carouselStart, setCarouselStart] = useState(0);
  const [windowWidth, setWindowWidth] = useState(0);

  useEffect(() => {
    setMounted(true); // now safe to render
    setWindowWidth(window.innerWidth);
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!mounted) return null;

  let maxVisible = 5;
  if (windowWidth < 1200) maxVisible = 4;
  if (windowWidth < 900) maxVisible = 3;
  if (windowWidth < 600) maxVisible = 2;

  const thumbSize = Math.min(240, (windowWidth - 80) / maxVisible);
  const gap = 16;

  const prevThumbs = () => setCarouselStart((prev) => Math.max(prev - 1, 0));
  const nextThumbs = () =>
    setCarouselStart((prev) => Math.min(prev + 1, images.length - maxVisible));

  return (
    <section className="bg-black mx-auto text-center px-4 py-12">
      <h2 className="roboto-condensed-thinx2 uppercase italic text-6xl p-5 transition hover:scale-102 font-bold mb-4 text-white">
        <a href="https://www.instagram.com/stone.science/">SSF Instagram</a>
      </h2>

      {/* Thumbnail carousel */}
      <div className="relative flex items-center justify-center mb-10 ">
        {carouselStart > 0 && (
          <button
            onClick={prevThumbs}
            className="absolute left-[-0.5rem] z-10 text-white p-2 bg-black/30 rounded-full hover:bg-black/50"
          >
            <ChevronLeft size={32} />
          </button>
        )}

        <div
          className="overflow-hidden"
          style={{ width: maxVisible * thumbSize + (maxVisible - 1) * gap }}
        >
          <div
            className="flex gap-4 transition-transform duration-300"
            style={{ transform: `translateX(-${carouselStart * (thumbSize + gap)}px)` }}
          >
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className="flex-shrink-0 relative aspect-square overflow-hidden rounded-lg group"
                style={{ width: thumbSize, height: thumbSize }}
              >
                <img
                  src={src}
                  alt={`Instagram post ${i + 1}`}
                  className="object-cover w-full h-full transition duration-300 group-hover:brightness-75"
                />
              </button>
            ))}
          </div>
        </div>

        {carouselStart < images.length - maxVisible && (
          <button
            onClick={nextThumbs}
            className="absolute right-[-0.5rem] z-10 text-white p-2 bg-black/30 rounded-full hover:bg-black/50"
          >
            <ChevronRight size={32} />
          </button>
        )}
      </div>

      {/* Lightbox */}
      {current !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <button className="absolute top-4 right-4 text-white" onClick={() => setCurrent(null)}>
            <X size={36} />
          </button>

          <button
            onClick={() => setCurrent((current - 1 + images.length) % images.length)}
            className="absolute left-4 text-white p-2"
          >
            <ChevronLeft size={48} />
          </button>

          <img
            src={images[current]}
            alt={`Instagram post ${current + 1}`}
            className="max-w-[90%] max-h-[80%] rounded-xl shadow-lg"
          />

          <button
            onClick={() => setCurrent((current + 1) % images.length)}
            className="absolute right-4 text-white p-2"
          >
            <ChevronRight size={48} />
          </button>
        </div>
      )}
    </section>
  );
}
