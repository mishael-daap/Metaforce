import React from 'react';

const StaticLoader = ({ className = '' }) => {
  return (
    <div className={`static-loader ${className}`}>
      <svg viewBox="0 0 713 814" fill="none" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="127.051" cy="415.626" rx="127.051" ry="397.662" fill="#1447E6"/>
        <ellipse cx="409.596" cy="279.261" rx="83.4362" ry="261.297" fill="#1447E6"/>
        <ellipse cx="648.527" cy="201.689" rx="64.4734" ry="201.689" fill="#1447E6"/>
      </svg>

      <style>{`
        .static-loader {
          display: flex;
          justify-content: center;
          align-items: center;
        }

        .static-loader svg {
          width: 100%;
          height: 100%;
        }
      `}</style>
    </div>
  );
};

export default StaticLoader;