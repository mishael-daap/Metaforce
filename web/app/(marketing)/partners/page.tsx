"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import MaxWidthWrapper from "@/components/landing-page/max-width-wrapper";
import Image from "next/image";

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
    name: "Dkloud",
    handle: "Dkloud Consulting",
    avatar: "/assets/dkloud-profile.jpg",
    quote: "Salesforce Consulting Company.",
    body: "DKLOUD is a London-based Salesforce consultancy specializing in CRM implementation, CPQ, and digital transformation. They help businesses architect, deploy, and optimize their Salesforce investment end-to-end — from initial setup to complex automation and expansion.",
    stars: 4,
  },
  // {
  //   id: 2,
  //   name: "Jane Smith",
  //   handle: "@janesmith",
  //   avatar: "/assets/avatar.jpg",
  //   quote: "Exercitation veniam consequat",
  //   body: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  //   stars: 5,
  // },
  // {
  //   id: 3,
  //   name: "Bob Johnson",
  //   handle: "@bobjohnson",
  //   avatar: "/assets/avatar.jpg",
  //   quote: "Excepteur sint occaecat cupidatat",
  //   body: "Sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus.",
  //   stars: 5,
  // },
];

const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill={filled ? "#f5c518" : "none"}
    stroke={filled ? "#f5c518" : "#6b6b6b"}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="inline-block"
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const TestimonialContent = ({ testimonial }: { testimonial: Testimonial }) => (
  <div className="flex flex-col justify-center h-full px-6 md:px-12 py-12 md:py-16">
    <div className="flex gap-1 mb-8">
      {/* {Array.from({ length: 5 }).map((_, i) => (
        <StarIcon key={i} filled={i < testimonial.stars} />
      ))} */}
    </div>

    <blockquote className="m-0 mb-6">
      <p className="text-[#e8e8e8] text-xl md:text-2xl font-medium italic leading-[1.4] m-0">
        &ldquo;{testimonial.quote}&rdquo;
      </p>
    </blockquote>

    <p className="text-[#6b6b6b] text-sm leading-[1.8] m-0 mb-8 max-w-[420px]">
      {testimonial.body}
    </p>

    <a
      href="https://www.linkedin.com/company/dkloud-consulting/"
      className="inline-flex items-center gap-2 text-[#e8e8e8] text-sm font-medium no-underline hover:text-white transition-colors duration-200 group"
    >
      Learn more
      <span className="transition-transform duration-200 group-hover:translate-x-1">
        →
      </span>
    </a>
  </div>
);

const TestimonialListItem = ({
  testimonial,
  index,
  activeIndex,
  onHover,
}: {
  testimonial: Testimonial;
  index: number;
  activeIndex: number;
  onHover: () => void;
}) => (
  <div
    onMouseEnter={onHover}
    className={cn(
      "w-full flex items-center gap-5 px-6 md:px-8 py-8 cursor-pointer transition-colors duration-200",
      index !== testimonials.length - 1 && "border-b border-[#2a2a2a]",
      activeIndex === index ? "bg-[#111]" : "bg-transparent",
    )}
  >
    <div className="relative w-[60px] h-[60px]  overflow-hidden flex-shrink-0 bg-[#1a1a1a]">
      <Image
        src={testimonial.avatar}
        alt={testimonial.name}
        fill
        className="object-cover"
        sizes="60px"
      />
    </div>
    <div>
      <h4 className="text-[#e8e8e8] text-base font-medium m-0 mb-1">
        {testimonial.name}
      </h4>
      <span className="text-[#6b6b6b] text-sm">{testimonial.handle}</span>
    </div>
  </div>
);

const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  className,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = testimonials[activeIndex];

  return (
    <div className={cn(" text-white font-sans", className)}>
      <div className="relative w-full">
        <MaxWidthWrapper>
          {/* Left Column */}
              <div className="flex flex-col justify-start border-b pb-10">
                <h2 className="text-[32px] md:text-[42px] font-semibold leading-[1.2] text-[#e8e8e8] m-0 tracking-[-0.5px] mb-6">
                  Our Partners
                </h2>
                <p className="text-[#6b6b6b] text-base leading-[1.8] m-0 max-w-[380px]">
                  Trusted by Salesforce consultancies worldwide. We partner with implementation experts who bring Metaforce to teams building complex CRM solutions.
                </p>
              </div>

          <div className="grid grid-cols-1 md:grid-cols-2 border-b border-x ">
            {/* Left Column — User List */}
            <div className="border-b md:border-b-0 md:border-r border-[#2a2a2a]">
              {testimonials.map((t, index) => (
                <TestimonialListItem
                  key={t.id}
                  testimonial={t}
                  index={index}
                  activeIndex={activeIndex}
                  onHover={() => setActiveIndex(index)}
                />
              ))}
            </div>

            {/* Right Column — Active Testimonial */}
            <div className="bg-black">
              <TestimonialContent testimonial={active} />
            </div>
          </div>
        </MaxWidthWrapper>
      </div>
    </div>
  );
};


export default function Page(){
    return <div className="border-b pb-20">
<MaxWidthWrapper>
    <TestimonialsSection />
</MaxWidthWrapper>
    </div>
}