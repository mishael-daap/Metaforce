"use client"
import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  className?: string;
}

const faqData: FAQItem[] = [
  {
    question: 'How to use this component?',
    answer: 'To use this component, you need to import it in your project and use it in your JSX code. Here\'s an example of how to use it:',
  },
  {
    question: 'Are there any other components available?',
    answer: 'Yes, we offer a wide range of components including navigation, forms, data display, and feedback components. Check our documentation for the full list.',
  },
  {
    question: 'Are components responsive?',
    answer: 'All components are built with responsive design in mind. They adapt seamlessly to different screen sizes and devices using modern CSS techniques.',
  },
  {
    question: 'Can I customize the components?',
    answer: 'Absolutely. Every component accepts className props and uses Tailwind CSS utility classes, making it easy to override styles and match your brand.',
  },
];

const FAQSection: React.FC<FAQSectionProps> = ({ className }) => {
  const [openIndex, setOpenIndex] = useState<number>(0);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <div className={cn('bg-black text-white font-sans', className)}>
      <div className="relative w-full">
        {/* Vertical grid lines */}
        <div 
          className="absolute inset-0 max-w-[1200px] mx-auto border-x border-[#2a2a2a] pointer-events-none z-[1]" 
          aria-hidden="true" 
        />

        <div className="w-full border-b border-[#2a2a2a]">
          <div className="max-w-[1200px] mx-auto px-8 md:px-16 py-16 md:py-24">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16">
              
              {/* Left Column */}
              <div className="flex flex-col justify-start">
                <h2 className="text-[32px] md:text-[42px] font-semibold leading-[1.2] text-[#e8e8e8] m-0 tracking-[-0.5px] mb-6">
                  Asked Questions.
                </h2>
                <p className="text-[#6b6b6b] text-base leading-[1.8] m-0 max-w-[380px]">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis sed odio sit amet nibh vulputate cursus a sit amet mauris. Morbi accumsan ipsum velit.
                </p>
              </div>

              {/* Right Column - Accordion */}
              <div>
                <div className="mb-6">
                  <span className="text-[#e8e8e8] text-sm font-medium tracking-wide uppercase">
                    &ldquo;GENERAL&rdquo;
                  </span>
                </div>

                <div className="border-t border-[#2a2a2a]">
                  {faqData.map((item, index) => (
                    <div 
                      key={index} 
                      className="border-b border-[#2a2a2a]"
                    >
                      <button
                        onClick={() => toggleItem(index)}
                        className="w-full flex items-center justify-between py-5 text-left group cursor-pointer bg-transparent border-none outline-none"
                      >
                        <span className="text-[#e8e8e8] text-base font-medium pr-4">
                          {item.question}
                        </span>
                        <span className="text-[#6b6b6b] text-xl font-light flex-shrink-0 w-6 h-6 flex items-center justify-center transition-colors duration-200 group-hover:text-white">
                          {openIndex === index ? '−' : '+'}
                        </span>
                      </button>
                      
                      <div 
                        className={cn(
                          'overflow-hidden transition-all duration-300 ease-in-out',
                          openIndex === index ? 'max-h-[500px] opacity-100 pb-5' : 'max-h-0 opacity-0'
                        )}
                      >
                        <p className="text-[#6b6b6b] text-sm leading-[1.8] m-0 pr-8">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQSection;