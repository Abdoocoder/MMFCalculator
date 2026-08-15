import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useMyRole } from './useMyRole';

const mocks = vi.hoisted(() => ({
  role: 'admin' as string | null | undefined,
}));

vi.mock('convex/react', async () => {
  const { getFunctionName } = await import('convex/server');
  return {
    useQuery: (ref: any) => {
      if (getFunctionName(ref) === 'auth:getMyRole') return mocks.role;
      return undefined;
    },
  };
});

beforeEach(() => {
  mocks.role = 'admin';
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useMyRole', () => {
  it('exposes the role returned by the query', () => {
    mocks.role = 'admin';
    const { result } = renderHook(() => useMyRole());
    expect(result.current.role).toBe('admin');
    expect(result.current.isAdmin).toBe(true);
  });

  it('reports isAdmin false for a member role', () => {
    mocks.role = 'member';
    const { result } = renderHook(() => useMyRole());
    expect(result.current.role).toBe('member');
    expect(result.current.isAdmin).toBe(false);
  });

  it('reports isAdmin false while the role is loading', () => {
    mocks.role = undefined;
    const { result } = renderHook(() => useMyRole());
    expect(result.current.role).toBeNull();
    expect(result.current.isAdmin).toBe(false);
  });

  it('reports isAdmin false when there is no role claim', () => {
    mocks.role = null;
    const { result } = renderHook(() => useMyRole());
    expect(result.current.role).toBeNull();
    expect(result.current.isAdmin).toBe(false);
  });
});
