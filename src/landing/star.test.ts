import { describe, expect, it } from 'vitest';
import {
  eightPointStarPath,
  starTilePath,
  starLatticeDataUri,
  StarGeometry,
} from './star';

describe('eightPointStarPath', () => {
  it('produces a closed path with 16 vertices', () => {
    const path = eightPointStarPath();
    expect(path.startsWith('M')).toBe(true);
    expect(path.endsWith('Z')).toBe(true);
    const moves = path.match(/[ML]/g) ?? [];
    expect(moves).toHaveLength(16);
  });

  it('starts at the top point (50, 5) for radius 45', () => {
    const path = eightPointStarPath(45);
    expect(path.startsWith('M50.00 5.00')).toBe(true);
  });

  it('returns a distinct path for different radii', () => {
    expect(eightPointStarPath(45)).not.toBe(eightPointStarPath(30));
  });
});

describe('starTilePath', () => {
  it('combines the center star with four corner quarter-stars', () => {
    const path = starTilePath();
    expect(path).toContain('Z');
    const zCount = (path.match(/Z/g) ?? []).length;
    expect(zCount).toBe(5); // center + 4 corners
  });

  it('is deterministic', () => {
    expect(starTilePath()).toBe(starTilePath());
  });

  it('translates every corner star to its tile corner', () => {
    const path = starTilePath();
    const subpaths = path
      .split('Z')
      .map((s) => s.trim())
      .filter(Boolean);
    expect(subpaths).toHaveLength(5);
    const corners: Array<[number, number]> = [
      [0, 0],
      [100, 0],
      [0, 100],
      [100, 100],
    ];
    const cornerSubpaths = subpaths.slice(1);
    cornerSubpaths.forEach((sub, i) => {
      const [tx, ty] = corners[i];
      const vertices = sub.match(/-?\d+\.\d+\s-?\d+\.\d+/g) ?? [];
      expect(vertices.length).toBe(16);
      const maxDist = 14.28 * 1.001;
      for (const v of vertices) {
        const [x, y] = v.split(' ').map(Number);
        const dist = Math.hypot(x - tx, y - ty);
        expect(dist).toBeLessThanOrEqual(maxDist);
      }
    });
  });
});

describe('starLatticeDataUri', () => {
  it('returns a data URI SVG containing the star path', () => {
    const uri = starLatticeDataUri();
    expect(uri.startsWith('data:image/svg+xml,')).toBe(true);
    const decoded = decodeURIComponent(uri.replace('data:image/svg+xml,', ''));
    expect(decoded).toContain('<path');
    expect(decoded).toContain('stroke');
  });

  it('encodes the requested stroke color', () => {
    const uri = starLatticeDataUri('rgba(255,255,255,0.05)');
    expect(decodeURIComponent(uri)).toContain('rgba(255,255,255,0.05)');
  });
});

// Keep the type import used so the exported interface stays exercised.
const _: StarGeometry = { path: 'M0 0 Z', tile: 64 };
expect(_).toBeDefined();
