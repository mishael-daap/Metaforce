import React from 'react';

const ShimmerLoader = ({ className = '' }) => {
  return (
    <div className={`shimmer-loader ${className}`}>
      <svg viewBox="0 0 713 814" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse className="shimmer-ell shimmer-ell-1" cx="127.051" cy="415.626" rx="127.051" ry="397.662" fill="#1447E6"/>
        <ellipse className="shimmer-ell shimmer-ell-2" cx="409.596" cy="279.261" rx="83.4362" ry="261.297" fill="#1447E6"/>
        <ellipse className="shimmer-ell shimmer-ell-3" cx="648.527" cy="201.689" rx="64.4734" ry="201.689" fill="#1447E6"/>
      </svg>

      <style>{`
        .shimmer-loader {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .shimmer-loader svg {
          width: 100%;
          height: 100%;
        }

        .shimmer-ell {
          transform-origin: center center;
          animation: shimmerBounce 1.8s ease-in-out infinite;
        }

        .shimmer-ell-1 { animation-delay: 0s; }
        .shimmer-ell-2 { animation-delay: 0.2s; }
        .shimmer-ell-3 { animation-delay: 0.4s; }

        @keyframes shimmerBounce {
          0%, 100% {
            transform: translateX(-30px) scaleY(1);
            opacity: 0.4;
            filter: brightness(0.6);
          }
          25% {
            transform: translateX(15px) scaleY(1.02);
            opacity: 0.8;
            filter: brightness(0.9);
          }
          50% {
            transform: translateX(30px) scaleY(1);
            opacity: 1;
            filter: brightness(1.2);
          }
          75% {
            transform: translateX(15px) scaleY(0.98);
            opacity: 0.8;
            filter: brightness(0.9);
          }
        }
      `}</style>
    </div>
  );
};

export default ShimmerLoader;