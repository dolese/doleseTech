// Dolese Tech brand mark + wordmark, drawn to match the brand kit.
// `tone` is the background the logo sits on: "light" draws the neutral strokes
// in Deep Navy, "dark" draws them in Cloud White. No background tile, so the
// logo sits directly on the page; the tiled version is only used for app icons.

const NAVY = "#1B2435";
const WHITE = "#F4F6F8";
const GREEN = "#6FCF6A";
const GREEN_ON_LIGHT = "#4CB548";
const BLUE = "#4FA8F0";
const BLUE_STEM = "#6BBAF4";

export function BrandMark({
  size = 36,
  tone = "light",
  className,
}: {
  size?: number;
  tone?: "light" | "dark";
  className?: string;
}) {
  const ink = tone === "light" ? NAVY : WHITE;
  const green = tone === "light" ? GREEN_ON_LIGHT : GREEN;
  return (
    <svg
      viewBox="14 14 72 72"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <g transform="translate(50 50)" fill="none" strokeWidth="10">
        <path d="M -18.64 -22.21 A 29 29 0 0 1 28.72 -4.04" stroke={green} />
        <path d="M 28.97 1.27 A 29 29 0 0 1 2.02 28.93" stroke={ink} />
        <path d="M -2.53 28.89 A 29 29 0 0 1 -29 0.5" stroke={BLUE} />
      </g>
      <g transform="translate(50 50)">
        <rect x="-34" y="-7" width="10.5" height="3.6" fill={green} />
        <path d="M -31 -20.5 H -2 A 22.5 22.5 0 0 1 20.5 2 A 19 19 0 0 0 -2 -12.5 H -31 Z" fill={ink} />
        <path d="M -16 -8 H -5.5 V 18 H -9 A 7 7 0 0 1 -16 11 Z" fill={BLUE_STEM} />
      </g>
    </svg>
  );
}

export default function BrandLogo({
  tone = "light",
  markSize = 36,
  className = "",
}: {
  tone?: "light" | "dark";
  markSize?: number;
  className?: string;
}) {
  return (
    <span className={`brand-logo brand-logo--${tone} ${className}`.trim()} aria-label="Dolese Tech" role="img">
      <BrandMark size={markSize} tone={tone} className="brand-logo-mark" />
      <span className="brand-logo-words" aria-hidden="true">
        <span className="brand-logo-name">dolese</span>
        <span className="brand-logo-tag">TECH</span>
      </span>
    </span>
  );
}
