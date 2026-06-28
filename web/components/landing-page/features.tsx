import React from "react";
import { cn } from "@/lib/utils";
import MaxWidthWrapper from "./max-width-wrapper";

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
    title: "Natural Language Requirements",
    description:
      "Describe what you need in plain English. The AI structures and refines your Salesforce requirements in real time.",
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
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    title: "Step-by-Step Build & Deploy",
    description:
      "Review and approve every SFDX operation. The AI deploys directly to your org with automatic error recovery.",
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
        <polyline points="9 11 12 14 22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
  },
  {
    title: "Zero-Setup Org Connection",
    description:
      "Connect any Salesforce org instantly via Chrome extension — no OAuth. Every component saved for future reuse.",
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
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    ),
  },
];

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ className }) => {
  return (
    <div className={cn(" text-white font-sans ", className)}>
      <div className="relative w-full border-t ">

      <MaxWidthWrapper>
        {/* Header */}
        <div className="w-full   border-x">
          <div className="max-w-[1200px] mx-auto px-8 md:px-16 py-16 md:py-24 text-center">
            <h2 className="text-[32px] md:text-[42px] font-semibold leading-[1.2] text-[#e8e8e8] m-0 tracking-[-0.5px] mb-5">
              What We Offer
            </h2>
            <p className="text-[#6b6b6b] text-base md:text-lg leading-[1.7] m-0 max-w-[600px] mx-auto">
              Everything you need to go from idea to deployed Salesforce metadata.
No XML. No OAuth setup. No scattered requirements docs. Just describe what you need and let the our agent handle the rest.

            </p>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="w-full border">
          <div className="">
            <div className="grid grid-cols-1 md:grid-cols-3 ">
              {features.map((feature, index) => {
                const isLastRow = index >= 3;
                const isLastCol = (index + 1) % 3 === 0;

                return (
                  <div
                    key={feature.title}
                    className={cn(
                      "py-10 md:py-12 flex flex-col items-center justify-center hover:bg-secondary/20",
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
                    <div className="w-fit h-fit">
                      <div className="w-11 h-11 rounded-lg bg-secondary flex items-center justify-center text-white mb-6">
                      {feature.icon}
                    </div>
                    <h3 className="text-[#e8e8e8] text-lg font-light m-0 mb-3 tracking-wide">
                      {feature.title}
                    </h3>
                    <p className="text-[#6b6b6b] text-sm leading-[1.8] m-0 max-w-[320px]">
                      {feature.description}
                    </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </MaxWidthWrapper>
      </div>
    </div>
  );
};

export default FeaturesSection;
