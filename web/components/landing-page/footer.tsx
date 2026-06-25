import Link from 'next/link';

import AnimationContainer from './animation-container';
import { TextHoverEffect } from './text-hover-effect';
import StaticLoader from '../ui/logo-static';
import { cn } from '@/lib/utils';
import React from 'react';

interface Props {
  className?: string;
};

interface Props {
  className?: string;
}

const Footer = () => {
  return (
    <div className="bg-black text-white font-sans">
      <div className="relative w-full">
        {/* Vertical lines track the content box edges */}
        <div 
          className="absolute inset-0 max-w-[1200px] mx-auto border-x border-[#2a2a2a] pointer-events-none z-[1]" 
          aria-hidden="true" 
        />

        {/* CTA Row */}
        <div className="w-full border-b border-[#2a2a2a]">
          <div className="max-w-[1200px] mx-auto px-8 md:px-16 flex flex-col items-start gap-6 py-12 md:flex-row md:justify-between md:items-center md:py-20">
            <h2 className="text-[28px] md:text-[38px] font-semibold leading-[1.25] text-[#e8e8e8] m-0 tracking-[-0.5px]">
              Start Building at the speed of light
            </h2>
            <button className="bg-primary text-white border-none px-8 py-3.5 rounded-[10px] text-sm font-semibold cursor-pointer whitespace-nowrap transition-opacity duration-200 hover:opacity-90">
              Get Started
            </button>
          </div>
        </div>

        {/* Empty spacer row */}
        <div className="w-full border-b border-[#2a2a2a] h-[140px]" />

        {/* Footer links row */}
        <div className="w-full border-b border-[#2a2a2a]">
          <div className="max-w-[1200px] mx-auto px-8 md:px-16 flex flex-col gap-12 pt-12 pb-12 md:flex-row md:justify-between md:pt-16 md:pb-[120px]">
            <div className="max-w-[380px]">
              <StaticLoader className='w-10 h-10 mb-2' />
              <p className="text-[#6b6b6b] text-sm leading-[1.8] m-0">
                Amet minim mollit non deserunt ullamco est sit aliqua dolor
                do amet sint. Velit officia consequat duis enim velit mollit.
              </p>
            </div>

            <div className="flex gap-[60px] md:gap-[120px]">
              <div>
                <h4 className="text-base font-semibold text-white m-0 mb-6">Legal</h4>
                <a href="#" className="block text-[#6b6b6b] no-underline text-sm mb-4 hover:text-white transition-colors duration-200">Terms</a>
                <a href="#" className="block text-[#6b6b6b] no-underline text-sm mb-4 hover:text-white transition-colors duration-200">Privacy Policy</a>
              </div>
              <div>
                <h4 className="text-base font-semibold text-white m-0 mb-6">Company</h4>
                <a href="#" className="block text-[#6b6b6b] no-underline text-sm mb-4 hover:text-white transition-colors duration-200">Partners</a>
                <a href="#" className="block text-[#6b6b6b] no-underline text-sm mb-4 hover:text-white transition-colors duration-200">Testimonials</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright sits outside the grid, full width */}
      <div className="text-center py-6 text-[#555] text-[13px] border-t border-[#1a1a1a]">
        &copy; {new Date().getFullYear()} Metaforce. All rights reserved.
      </div>

      <div>
        <div className="h-[20rem] lg:h-[20rem] hidden md:flex items-center justify-center w-full max-w-screen-lg mx-auto px-4">
               <TextHoverEffect text="METAFORCE" />
           </div>
      </div>
    </div>
  );
};

export default Footer;