/**
 * Star geometry for the Financing Notation world — the eight-pointed star
 * (khatam) that tiles the landing field and seals each certified term.
 * Pure math: no DOM, no randomness, fully testable.
 */

export interface StarGeometry {
  /** SVG path (viewBox 0 0 100 100) of an eight-pointed star, center 50,50. */
  path: string;
  /** Size of the pattern tile in viewBox units. */
  tile: number;
}

/**
 * Build the path for an eight-pointed star with the given outer radius.
 * An eight-pointed star alternates outer and inner vertices every 22.5°.
 * `inner` is the inner radius ratio (0..1); 0.42 reads cleanly.
 */
export function eightPointStarPath(radius = 45, innerRatio = 0.42): string {
  const cx = 50;
  const cy = 50;
  const inner = radius * innerRatio;
  const points: Array<[number, number]> = [];
  for (let i = 0; i < 16; i++) {
    const r = i % 2 === 0 ? radius : inner;
    const angle = (Math.PI * i) / 8 - Math.PI / 2;
    points.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
  }
  const d = points
    .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`)
    .join(' ');
  return `${d} Z`;
}

/** Translate every coordinate pair in an SVG path string by (dx, dy). */
function translatePath(path: string, dx: number, dy: number): string {
  return path.replace(
    /(-?\d+\.\d+)\s(-?\d+\.\d+)/g,
    (_: string, x: string, y: string) =>
      `${(parseFloat(x) + dx).toFixed(2)} ${(parseFloat(y) + dy).toFixed(2)}`,
  );
}

/**
 * A full tile: the eight-pointed star plus four corner quarter-stars, so the
 * pattern tessellates seamlessly. Returns an SVG path string (viewBox 100×100).
 */
export function starTilePath(radius = 34, innerRatio = 0.42): string {
  const star = eightPointStarPath(radius, innerRatio);
  const corner = eightPointStarPath(radius * 0.42, innerRatio);
  const corners: Array<[number, number]> = [
    [0, 0],
    [100, 0],
    [0, 100],
    [100, 100],
  ];
  const cornerPaths = corners
    .map(([tx, ty]) => translatePath(corner, tx - 50, ty - 50))
    .join(' ');
  return `${star} ${cornerPaths}`;
}

/** Safe data-URI for a tiling star lattice on a colored field. */
export function starLatticeDataUri(
  stroke = 'rgba(255,255,255,0.10)',
  strokeWidth = 1,
  tileSize = 64,
): string {
  const path = starTilePath(34, 0.42);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${tileSize}" height="${tileSize}" viewBox="0 0 100 100">` +
    `<g fill="none" stroke="${stroke}" stroke-width="${strokeWidth}">` +
    `<path d="${path}"/>` +
    `<circle cx="50" cy="50" r="2.5" fill="${stroke}"/>` +
    `</g></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}
