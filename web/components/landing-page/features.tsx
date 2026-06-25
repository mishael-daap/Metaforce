import React from "react";
import { cn } from "@/lib/utils";

interface Feature {
  title: string;
  description: string;
  icon: React.ReactNode;
}

interface FeaturesSectionProps {
  className?: string;
}

const features: Feature[] = [
  {
    title: "AI Agent Builder",
    description:
      "Design intelligent agents with modular logic, memory and tools - no complex setup required.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
        <path d="M8 11h.01" />
        <path d="M16 11h.01" />
      </svg>
    ),
  },
  {
    title: "Workflow Orchestration",
    description:
      "Chain actions, triggers and decisions to automate multi-step workflows reliably.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <path d="M7 14h.01" />
        <path d="M17 14h.01" />
        <path d="M10 7h4v4h-4z" opacity="0" />
        <path d="M10 10h.01" />
        <path d="M3 14h18v7H3z" opacity="0" />
        <path d="M7 7v4M17 7v4M7 14h10v4H7z" opacity="0" />
        <path d="M10 6h4v4h-4z" opacity="0" />
        <circle cx="7" cy="14" r="1" fill="currentColor" stroke="none" />
        <circle cx="17" cy="14" r="1" fill="currentColor" stroke="none" />
        <path d="M7 14h10" />
        <path d="M7 14v4M17 14v4" />
        <rect x="3" y="17" width="7" height="7" rx="1" opacity="0" />
        <rect x="14" y="17" width="7" height="7" rx="1" opacity="0" />
        <path d="M3 14h4v4H3zM14 14h7v7h-7z" opacity="0" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
        <path d="M10 17h4" />
      </svg>
    ),
  },
  {
    title: "Plug & Play Integrations",
    description:
      "Connect APIs, databases and third-party tools seamlessly with built-in connectors.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22v-5" />
        <path d="M9 12V7a3 3 0 0 1 6 0v5" />
        <path d="M9 7h6" />
        <path d="M15 17h-2v-2h2z" opacity="0" />
        <path d="M10 14h4v5h-4z" />
      </svg>
    ),
  },
  {
    title: "Production-Ready Security",
    description:
      "Built-in safeguards, rate limits and isolation to run agents safely at scale and protect your data.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
  },
  {
    title: "Real-Time Monitoring",
    description:
      "Track executions, logs and performance metrics in real time and get insights into your agent's behavior.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    title: "Scalable Infrastructure",
    description:
      "Run agents efficiently across workloads with automatic scaling and optimization.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
        <rect x="9" y="9" width="6" height="6" />
        <line x1="9" y1="1" x2="9" y2="4" />
        <line x1="15" y1="1" x2="15" y2="4" />
        <line x1="9" y1="20" x2="9" y2="23" />
        <line x1="15" y1="20" x2="15" y2="23" />
        <line x1="20" y1="9" x2="23" y2="9" />
        <line x1="20" y1="14" x2="23" y2="14" />
        <line x1="1" y1="9" x2="4" y2="9" />
        <line x1="1" y1="14" x2="4" y2="14" />
      </svg>
    ),
  },
];

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ className }) => {
  return (
    <div className={cn("bg-black text-white font-sans", className)}>
      <div className="relative w-full">
        {/* Vertical grid lines */}
        <div
          className="absolute inset-0 max-w-[1200px] mx-auto border-x border-[#2a2a2a] pointer-events-none z-[1]"
          aria-hidden="true"
        />

        {/* Header */}
        <div className="w-full border-b border-t border-[#2a2a2a]">
          <div className="max-w-[1200px] mx-auto px-8 md:px-16 py-16 md:py-24 text-center">
            <h2 className="text-[32px] md:text-[42px] font-semibold leading-[1.2] text-[#e8e8e8] m-0 tracking-[-0.5px] mb-5">
              What We Offer
            </h2>
            <p className="text-[#6b6b6b] text-base md:text-lg leading-[1.7] m-0 max-w-[600px] mx-auto">
              Explore amet minim mollit non deserunt ullamco est sit aliqua
              dolor do amet sint. Velit officia consequat.
            </p>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="w-full border-b border-[#2a2a2a]">
          <div className="max-w-[1200px] mx-auto px-8 md:px-16">
            <div className="grid grid-cols-1 md:grid-cols-3">
              {features.map((feature, index) => {
                const isLastRow = index >= 3;
                const isLastCol = (index + 1) % 3 === 0;

                return (
                  <div
                    key={feature.title}
                    className={cn(
                      "py-10 md:py-12 border-[#2a2a2a]",
                      // Mobile: all items have bottom border except last
                      index !== features.length - 1 && "border-b",
                      // Desktop: first row has top padding, borders managed below
                      "md:border-b",
                      !isLastRow && "md:border-b",
                      isLastRow && "md:border-b-0",
                      // Right borders on desktop except last column
                      !isLastCol && "md:border-r",
                    )}
                  >
                    <div className="w-11 h-11 rounded-lg bg-[#22c55e] flex items-center justify-center text-white mb-6">
                      {feature.icon}
                    </div>
                    <h3 className="text-[#e8e8e8] text-lg font-semibold m-0 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-[#6b6b6b] text-sm leading-[1.8] m-0 max-w-[320px]">
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesSection;
