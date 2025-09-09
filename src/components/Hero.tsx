'use client';

import Slider from 'react-slick';
import Link from 'next/link';
import { useState, useRef } from 'react';

const slides = [
  {
    title: 'Articles',
    href: '/blog',
    bg: 'bg-stone-800',
    img: 'https://yvrdqrvtohobvjuqprmy.supabase.co/storage/v1/object/public/hero-background-images/GymImage7v2.jpg',
  },
  {
    title: 'Store',
    href: '/store',
    bg: 'bg-stone-700',
    img: 'https://yvrdqrvtohobvjuqprmy.supabase.co/storage/v1/object/public/hero-background-images/GymImage9v3.jpg',
  },
  {
    title: 'Videos',
    href: '/videos',
    bg: 'bg-stone-600',
    img: 'https://yvrdqrvtohobvjuqprmy.supabase.co/storage/v1/object/public/hero-background-images/GymImage3v2.jpg',
  },
  {
    title: 'Calculators',
    href: '/calculators',
    bg: 'bg-stone-500',
    img: 'https://yvrdqrvtohobvjuqprmy.supabase.co/storage/v1/object/public/hero-background-images/GymImage4v2.jpg',
  },
  {
    title: 'Coaching',
    href: '/coaching',
    bg: 'bg-stone-800',
    img: 'https://yvrdqrvtohobvjuqprmy.supabase.co/storage/v1/object/public/hero-background-images/GymImage1v2.jpg',
  },
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<Slider>(null);

  const settings = {
    dots: false, // disable default dots
    infinite: true,
    autoplay: true,
    autoplaySpeed: 4000,
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    beforeChange: (_oldIndex: number, newIndex: number) => setCurrentSlide(newIndex),
  };

  return (
    <section className="mt-0 pb-10 bg-black relative">
      <Slider ref={sliderRef} {...settings} className="relative">
        {slides.map((slide, idx) => (
          <div key={idx}>
            <Link
              href={slide.href}
              style={{
                backgroundImage: `
      linear-gradient(to bottom, rgba(0,0,0,0.99), rgba(0,0,0,0) 30%, rgba(0,0,0,0) 70%, rgba(0,0,0,0.99)),
      url(${slide.img})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
              className="flex h-[40vh] items-center justify-center transition-colors duration-300"
            >
              <h2 className="uppercase text-6xl sm:text-6xl md:text-8xl lg:text-8xl xl:text-8xl font-bold roboto-condensed-thinx2 text-slate-300 text-shadow-black hover:text-white hover:scale-102 transition">
                {slide.title}
              </h2>
            </Link>
          </div>
        ))}
      </Slider>

      {/* Navigation dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, dotIdx) => (
          <button
            key={dotIdx}
            className={`w-2 h-2 rounded-full transition-colors ${
              dotIdx === currentSlide
                ? 'bg-black/50 scale-100'
                : 'bg-white/20 hover:cursor-pointer hover:bg-black/25'
            }`}
            onClick={() => sliderRef.current?.slickGoTo(dotIdx)}
          />
        ))}
      </div>
    </section>
  );
}
