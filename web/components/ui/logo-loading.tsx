/*
 * Usage:
 *   <LogoLoading className="w-20 h-20" />
 *   <LogoLoading speed="fast" />
 *   <LogoLoading speed="slow" direction="alternate" />
 *   <LogoLoading speed="5s" direction="alternate-reverse" />
 */
"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface LogoLoadingProps {
  className?: string;
  /** Shorthand: "fast" (~1s), "slow" (~3s), or any CSS duration like "2s", "500ms" */
  speed?: "fast" | "slow" | string;
  /**
   * Vanilla CSS `animation-direction` values used to fine-tune
   * the way the three bubbles shimmer and bounce.
   * — `"alternate"` (default) lets them ease forward then back,
   *   creating a gentle rocking effect.
   * — `"alternate-reverse"` runs the animation backwards every
   *   other cycle (useful if using `LogoLoading` on both light
   *   and dark backgrounds).
   * — `"normal"` / `"reverse"` / `"initial"` / `"inherit"` work
   *   just like standard CSS.
   */
  direction?:
    | "alternate"
    | "alternate-reverse"
    | "normal"
    | "reverse"
    | "initial"
    | "inherit"
    | "revert";
}

const LogoLoading = React.forwardRef<SVGSVGElement, LogoLoadingProps>(
  function LogoLoading({
    className,
    speed = "slow",
    direction = "alternate",
  }: LogoLoadingProps) {
    const duration =
      speed === "fast" ? "1s" : speed === "slow" ? "3s" : speed;
    return (
      <svg
        
        viewBox={`${-127.051 / 4} ${-397.662 / 4} ${(127.051 * 9) / 4} ${(397.662 * 5) / 4}`}
        xmlns="http://www.w3.org/2000/svg"
        className={cn("", className)}
      >
        <style>{`
        @keyframes shimmerBounce {
          0%, 100% { opacity: 0.4; transform: translateY(0px); }
          50%      { opacity: 1;   transform: translateY(-10%); }
        }
        .shim { animation: shimmerBounce ${duration} ease-in-out ${direction} infinite; transform-origin: center; }
        .shim-1 { animation-delay: 0.0s; }
        .shim-2 { animation-delay: 0.25s; }
        .shim-3 { animation-delay: 0.5s; }
      `}</style>
        <ellipse
          className="shim shim-1"
          cx="127.051"
          cy="415.626"
          rx="127.051"
          ry="397.662"
          fill="#1447E6"
        />
        <ellipse
          className="shim shim-2"
          cx="409.596"
          cy="279.261"
          rx="83.4362"
          ry="261.297"
          fill="#1447E6"
        />
        <ellipse
          className="shim shim-3"
          cx="648.527"
          cy="201.689"
          rx="64.4734"
          ry="201.689"
          fill="#1447E6"
        />
      </svg>
    );
  }
);

LogoLoading.displayName = "LogoLoading";
export { LogoLoading };
