import { useMemo } from 'react';
import { starLatticeDataUri, eightPointStarPath } from './star';

interface StarFieldProps {
  /** Opacity of the lattice. */
  opacity?: number;
  /** aria-hidden since it is decorative. */
  'aria-hidden'?: boolean;
}

/** Tiling eight-pointed star lattice used as the deep-blue field's texture. */
export function StarField({ opacity = 0.14 }: StarFieldProps) {
  const uri = useMemo(() => starLatticeDataUri('rgba(239,241,243,0.55)', 1, 72), []);
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0"
      style={{
        backgroundImage: `url("${uri}")`,
        backgroundSize: '72px 72px',
        opacity,
      }}
    />
  );
}

interface StarSealProps {
  /** Fills the seal with the teal certification color when true. */
  certified?: boolean;
  size?: number;
  'aria-hidden'?: boolean;
}

/** Single eight-pointed star — the certification seal of the notation world. */
export function StarSeal({ certified = false, size = 20 }: StarSealProps) {
  const path = useMemo(() => eightPointStarPath(45, 0.42), []);
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden="true"
      className="landing-seal shrink-0"
      style={{ overflow: 'visible' }}
    >
      <path
        d={path}
        fill={certified ? '#bcebe5' : 'rgba(239,241,243,0.10)'}
        stroke={certified ? '#bcebe5' : 'rgba(239,241,243,0.45)'}
        strokeWidth="3"
      />
    </svg>
  );
}
