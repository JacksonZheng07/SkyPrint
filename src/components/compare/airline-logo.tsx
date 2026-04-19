"use client";

import airLogos from "airlogos";

interface AirlineLogoProps {
  code: string;
  size?: number;
  className?: string;
}

const logos = airLogos as Record<string, { png?: string; svg?: string }>;

export function AirlineLogo({ code, size = 36, className = "" }: AirlineLogoProps) {
  const entry = logos[code.toUpperCase()];
  const src = entry?.svg ?? entry?.png;

  if (!src) {
    return (
      <div
        className={`flex items-center justify-center rounded-md bg-white/20 font-bold text-white text-xs ${className}`}
        style={{ width: size, height: size }}
      >
        {code}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={code}
      width={size}
      height={size}
      className={`rounded-md object-contain ${className}`}
    />
  );
}
