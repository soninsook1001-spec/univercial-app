import React from 'react';

const LogoIcon = ({ size = 28, ...props }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
      {...props}
    >
      <defs>
        {/* Soft elegant blue gradient */}
        <linearGradient id="logo-grad-bg" x1="0" y1="0" x2="100" y2="100">
          <stop offset="0%" stopColor="#a3c2df" />
          <stop offset="100%" stopColor="#7ba1c7" />
        </linearGradient>
        {/* Warm golden beige gradient for accent */}
        <linearGradient id="logo-grad-accent" x1="0" y1="100" x2="100" y2="0">
          <stop offset="0%" stopColor="#ebdcb9" />
          <stop offset="100%" stopColor="#f5ecd5" />
        </linearGradient>
        {/* Drop shadow for 3D depth */}
        <filter id="logo-shadow" x="-10%" y="-10%" width="130%" height="130%">
          <feDropShadow dx="2" dy="3" stdDeviation="3" floodColor="#334155" floodOpacity="0.12" />
        </filter>
      </defs>

      {/* Main logo mark */}
      {/* Left wing / page of book */}
      <path
        d="M50 85C32 85 18 70 18 45C18 35 24 20 38 12C38 12 36 28 44 38C50 45 50 55 50 85Z"
        fill="url(#logo-grad-bg)"
        filter="url(#logo-shadow)"
      />
      {/* Right wing / page of book (overlapping) */}
      <path
        d="M50 85C68 85 82 70 82 45C82 35 76 20 62 12C62 12 64 28 56 38C50 45 50 55 50 85Z"
        fill="url(#logo-grad-accent)"
        filter="url(#logo-shadow)"
      />
      {/* Glowing Star/Spark in the center top */}
      <path
        d="M50 12L53.5 21.5L63 25L53.5 28.5L50 38L46.5 28.5L37 25L46.5 21.5L50 12Z"
        fill="#ffffff"
      />
      {/* Elegant center separation line */}
      <path
        d="M50 38V85"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.85"
      />
    </svg>
  );
};

export default LogoIcon;
