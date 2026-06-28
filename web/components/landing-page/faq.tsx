"use client"
import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface FAQItem {
  question: string;
  answer: string;
}

import MaxWidthWrapper from './max-width-wrapper';

interface FAQSectionProps {
  className?: string;
}

const faqData: FAQItem[] = [
  {
    question: 'How does Metaforce connect to my Salesforce org?',
    answer: 'Metaforce uses a Chrome extension to extract your active session token and instance URL from an open Salesforce tab. No OAuth setup, no connected apps, and no AppExchange installation required. Your credentials are encrypted and stored securely in Supabase against your project.',
  },
  {
    question: 'What can Metaforce actually build?',
    answer: 'During the current proof-of-concept phase, Metaforce supports custom objects and custom fields. You describe what you need in natural language, and the AI translates that into the correct SFDX operations to create and deploy the metadata directly to your org.',
  },
  {
    question: 'Is it safe to let an AI deploy to my org?',
    answer: 'Yes. Metaforce operates on an approval-based workflow. The AI plans every SFDX operation in an ephemeral task list, but nothing executes until you explicitly approve each step. If an operation fails, the AI diagnoses the error and proposes a fix before retrying.',
  },
  {
    question: 'Can my team collaborate on the same project?',
    answer: 'Absolutely. Every project has a single shared conversation and requirements list. All collaborators see updates in real time via Supabase Realtime, so your team stays aligned on scope and implementation status without scattered docs or Slack threads.',
  }
];

const FAQSection: React.FC<FAQSectionProps> = ({ className }) => {
  const [openIndex, setOpenIndex] = useState<number>(0);

  const toggleItem = (index: number) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <div className={cn('bg-black text-white font-sans', className)}>
      <div className="relative w-full border">
        
<MaxWidthWrapper>

  <div className='border-x h-40'>

  </div>

        <div className="w-full border-b">
          <div className="mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 border-x border-t">
              
              {/* Left Column */}
              <div className="flex flex-col border-r items-center justify-center ">
                <h2 className="text-[32px] md:text-[42px] font-semibold leading-[1.2] text-[#e8e8e8] m-0 tracking-[-0.5px] mb-6 ">
                  Asked Questions.
                </h2>
                <p className="text-[#6b6b6b] text-base leading-[1.8] m-0 max-w-[380px]">
                 Quick answers to how Metaforce connects to your org, keeps your data safe, and handles AI-driven deployments.

                </p>
              </div>

              {/* Right Column - Accordion */}
              <div>
                <div className="px-10 py-5 text-2xl">
                  <span className="text-[#e8e8e8] text-2xl font-extralight tracking-wide uppercase ">
                    &ldquo;GENERAL&rdquo;
                  </span>
                </div>

                <div className="border-t border-[#2a2a2a] p-4">
                  {faqData.map((item, index) => (
                    <div 
                      key={index} 
                      className="border-b"
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
</MaxWidthWrapper>

      </div>
    </div>
  );
};

export default FAQSection;