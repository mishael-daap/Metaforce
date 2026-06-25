"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";

interface Company {
  name: string;
  logo: string;
}

interface MarqueeLogosProps {
  companies: readonly Company[];
  className?: string;
}

export default function MarqueeLogos({ companies, className }: MarqueeLogosProps) {
  // Duplicate logos for seamless infinite loop
  const doubled = [...companies, ...companies];

  return (
    <div className={cn("group relative flex overflow-hidden", className)}>
      {/* Marquee track */}
      <div className="animate-marquee flex shrink-0 items-center gap-x-12 md:gap-x-16">
        {doubled.map((company, i) => (
          <div
            key={`${company.name}-${i}`}
            className="flex shrink-0 items-center"
          >
            <Image
              src={company.logo}
              alt={company.name}
              width={80}
              height={80}
              quality={100}
              className="w-28 h-auto"
            />
          </div>
        ))}
      </div>

      {/* Left fade gradient */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background to-transparent z-10" />
      {/* Right fade gradient (optional, for completeness) */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background to-transparent z-10" />
    </div>
  );
}
