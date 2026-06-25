"use client"

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface Testimonial {
  id: number;
  name: string;
  handle: string;
  avatar: string;
  quote: string;
  body: string;
  stars: number;
}

interface TestimonialsSectionProps {
  className?: string;
}

const testimonials: Testimonial[] = [
  {
    id: 1,
    name: 'John Doe',
    handle: '@johndoe',
    avatar: '/avatars/john.jpg',
    quote: 'Amet minim mollit non deserunt',
    body: 'Amet minim mollit non deserunt ullamco est sit aliqua dolor do amet sint. Velit officia consequat duis enim velit mollit.',
    stars: 5,
  },
  {
    id: 2,
    name: 'Jane Smith',
    handle: '@janesmith',
    avatar: '/avatars/jane.jpg',
    quote: 'Exercitation veniam consequat',
    body: 'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
    stars: 5,
  },
  {
    id: 3,
    name: 'Bob Johnson',
    handle: '@bobjohnson',
    avatar: '/avatars/bob.jpg',
    quote: 'Excepteur sint occaecat cupidatat',
    body: 'Sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus.',
    stars: 5,
  },
];

const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill={filled ? '#f5c518' : 'none'}
    stroke={filled ? '#f5c518' : '#6b6b6b'}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="inline-block"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({ className }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = testimonials[activeIndex];

  return (
    <div className={cn('bg-black text-white font-sans', className)}>
      <div className="relative w-full">
        {/* Vertical grid lines */}
        <div 
          className="absolute inset-0 max-w-[1200px] mx-auto border-x border-[#2a2a2a] pointer-events-none z-[1]" 
          aria-hidden="true" 
        />

        <div className="w-full border-b border-[#2a2a2a]">
          <div className="max-w-[1200px] mx-auto px-8 md:px-16">
            <div className="grid grid-cols-1 md:grid-cols-2 min-h-[400px]">
              
              {/* Left Column — User List */}
              <div className="border-b md:border-b-0 md:border-r border-[#2a2a2a]">
                {testimonials.map((t, index) => (
                  <button
                    key={t.id}
                    onClick={() => setActiveIndex(index)}
                    className={cn(
                      'w-full flex items-center gap-5 px-6 md:px-8 py-8 text-left cursor-pointer bg-transparent border-none outline-none transition-colors duration-200',
                      index !== testimonials.length - 1 && 'border-b border-[#2a2a2a]',
                      activeIndex === index ? 'bg-[#111]' : 'hover:bg-[#0a0a0a]'
                    )}
                  >
                    <div className="relative w-[60px] h-[60px] rounded-full overflow-hidden flex-shrink-0 bg-[#1a1a1a]">
                      <Image
                        src={t.avatar}
                        alt={t.name}
                        fill
                        className="object-cover"
                        sizes="60px"
                      />
                    </div>
                    <div>
                      <h4 className="text-[#e8e8e8] text-base font-medium m-0 mb-1">
                        {t.name}
                      </h4>
                      <span className="text-[#6b6b6b] text-sm">
                        {t.handle}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {/* Right Column — Active Testimonial */}
              <div className="flex flex-col justify-center px-6 md:px-12 py-12 md:py-16">
                <div className="flex gap-1 mb-8">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon key={i} filled={i < active.stars} />
                  ))}
                </div>

                <blockquote className="m-0 mb-6">
                  <p className="text-[#e8e8e8] text-xl md:text-2xl font-medium italic leading-[1.4] m-0">
                    &ldquo;{active.quote}&rdquo;
                  </p>
                </blockquote>

                <p className="text-[#6b6b6b] text-sm leading-[1.8] m-0 mb-8 max-w-[420px]">
                  {active.body}
                </p>

                <a 
                  href="#" 
                  className="inline-flex items-center gap-2 text-[#e8e8e8] text-sm font-medium no-underline hover:text-white transition-colors duration-200 group"
                >
                  Read more
                  <span className="transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </a>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialsSection;