import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { act } from 'react';
import { useAdminData } from './useAdminData';
import type { AdminApplication } from '../types';

const mocks = vi.hoisted(() => {
  const serverApplication = {
    record: {
      _id: 'rec_1',
      referenceNo: 'MDB-2026-1001',
      date: '2026-08-01',
      productName: 'مرابحة الأجهزة الكهربائية والإلكترونية',
      loanAmount: 500,
      netIncome: 200,
      durationYears: 1,
      monthlyInstallment: 48.16,
      totalWithInsurance: 577.88,
      status: 'pending',
    },
    member: {
      _id: 'mem_1',
      membershipNo: 'MDB-1001',
      fullName: 'أحمد محمود الشوابكة',
      department: 'قسم الحاسوب',
      phone: '0791112223',
    },
  };
  return {
    serverApplication,
    applications: [serverApplication] as unknown[] | undefined,
    setDecision: vi.fn(),
    listApplications: vi.fn(),
  };
});

vi.mock('convex/react', async () => {
  const { getFunctionName } = await import('convex/server');
  return {
    useQuery: (ref: any) => {
      if (getFunctionName(ref) === 'admin:listApplications') return mocks.applications;
      return undefined;
    },
    useMutation: (ref: any) => {
      if (getFunctionName(ref) === 'admin:setDecision') return mocks.setDecision;
      return mocks.listApplications;
    },
  };
});

const clientApplication: AdminApplication = {
  record: {
    id: 'rec_1',
    referenceNo: 'MDB-2026-1001',
    date: '2026-08-01',
    productName: 'مرابحة الأجهزة الكهربائية والإلكترونية',
    loanAmount: 500,
    netIncome: 200,
    durationYears: 1,
    monthlyInstallment: 48.16,
    totalWithInsurance: 577.88,
    status: 'pending',
  },
  member: {
    membershipNo: 'MDB-1001',
    fullName: 'أحمد محمود الشوابكة',
    department: 'قسم الحاسوب',
    phone: '0791112223',
  },
};

beforeEach(() => {
  mocks.applications = [mocks.serverApplication];
  mocks.setDecision.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useAdminData', () => {
  it('maps server docs to client applications', () => {
    const { result } = renderHook(() => useAdminData());
    expect(result.current.applications).toEqual([clientApplication]);
  });

  it('defaults to an empty list while applications are loading', () => {
    mocks.applications = undefined;
    const { result } = renderHook(() => useAdminData());
    expect(result.current.applications).toEqual([]);
  });

  it('maps a record whose owner has no member profile to a null member', () => {
    mocks.applications = [
      { record: { ...mocks.serverApplication.record, _id: 'rec_2' }, member: null },
    ];
    const { result } = renderHook(() => useAdminData());
    expect(result.current.applications).toEqual([
      {
        record: { ...clientApplication.record, id: 'rec_2' },
        member: null,
      },
    ]);
  });

  it('calls setDecision with the application id and status', async () => {
    mocks.setDecision.mockResolvedValue(undefined);
    const { result } = renderHook(() => useAdminData());

    await act(async () => {
      await result.current.decide('rec_1', 'approved');
    });

    expect(mocks.setDecision).toHaveBeenCalledWith({
      id: 'rec_1',
      status: 'approved',
    });
    expect(result.current.lastError).toBeNull();
  });

  it('reports a decide failure as an Arabic lastError', async () => {
    mocks.setDecision.mockRejectedValue(new Error('network'));
    const { result } = renderHook(() => useAdminData());

    await act(async () => {
      await result.current.decide('rec_1', 'rejected');
    });

    expect(result.current.lastError).toBe(
      'تعذر حفظ القرار — يرجى المحاولة مرة أخرى.',
    );
  });

  it('clears lastError via clearError', async () => {
    mocks.setDecision.mockRejectedValueOnce(new Error('network'));
    const { result } = renderHook(() => useAdminData());

    await act(async () => {
      await result.current.decide('rec_1', 'rejected');
    });
    expect(result.current.lastError).not.toBeNull();

    await act(async () => {
      result.current.clearError();
    });
    expect(result.current.lastError).toBeNull();
  });
});
