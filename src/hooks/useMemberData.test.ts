import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { act } from 'react';
import { useMemberData } from './useMemberData';
import type { LoanRecord, MemberProfile } from '../types';
import { saveProfileMirror, saveRecordsMirror } from '../data/mirror';

const mocks = vi.hoisted(() => {
  const profileDoc = {
    _id: 'mem_1',
    userId: 'user_1',
    membershipNo: 'MDB-1001',
    fullName: 'أحمد محمود الشوابكة',
    nationalId: '9876543210',
    department: 'قسم الحاسوب',
    jobTitle: 'مطور برمجيات',
    netSalary: 850,
    currentDeductions: 120,
    phone: '0791112223',
    joinDate: '2020-03-15',
    activeLoanCount: 1,
    totalLoansPaid: 0,
  } as const;

  const recordDoc = {
    _id: 'rec_1',
    referenceNo: 'MDB-2026-1001',
    date: '2026-08-01',
    productName: 'مرابحة الأجهزة الكهربائية والإلكترونية',
    loanAmount: 500,
    netIncome: 200,
    durationYears: 1,
    monthlyInstallment: 48.16,
    totalWithInsurance: 577.88,
    status: 'draft',
    notes: undefined,
    resultSnapshot: null,
  } as const;

  return {
    profile: profileDoc as unknown as typeof profileDoc | null | undefined,
    records: [] as unknown[] | undefined,
    createRecord: vi.fn(),
    deleteDraft: vi.fn(),
    upsertProfile: vi.fn(),
  };
});

vi.mock('convex/react', async () => {
  const { getFunctionName } = await import('convex/server');
  return {
    useQuery: (ref: any) => {
      if (getFunctionName(ref) === 'loanRecords:listMy') return mocks.records;
      return mocks.profile;
    },
    useMutation: (ref: any) => {
      const name = getFunctionName(ref);
      if (name === 'loanRecords:create') return mocks.createRecord;
      if (name === 'loanRecords:deleteDraft') return mocks.deleteDraft;
      return mocks.upsertProfile;
    },
  };
});

const clientProfile: MemberProfile = {
  id: 'mem_1',
  membershipNo: 'MDB-1001',
  fullName: 'أحمد محمود الشوابكة',
  nationalId: '9876543210',
  department: 'قسم الحاسوب',
  jobTitle: 'مطور برمجيات',
  netSalary: 850,
  currentDeductions: 120,
  phone: '0791112223',
  joinDate: '2020-03-15',
  activeLoanCount: 1,
  totalLoansPaid: 0,
};

const clientRecord: LoanRecord = {
  id: 'rec_1',
  referenceNo: 'MDB-2026-1001',
  date: '2026-08-01',
  productName: 'مرابحة الأجهزة الكهربائية والإلكترونية',
  loanAmount: 500,
  netIncome: 200,
  durationYears: 1,
  monthlyInstallment: 48.16,
  totalWithInsurance: 577.88,
  status: 'draft',
};

beforeEach(() => {
  localStorage.clear();
  mocks.profile = {
    _id: 'mem_1',
    userId: 'user_1',
    membershipNo: 'MDB-1001',
    fullName: 'أحمد محمود الشوابكة',
    nationalId: '9876543210',
    department: 'قسم الحاسوب',
    jobTitle: 'مطور برمجيات',
    netSalary: 850,
    currentDeductions: 120,
    phone: '0791112223',
    joinDate: '2020-03-15',
    activeLoanCount: 1,
    totalLoansPaid: 0,
  } as const;
  mocks.records = [] as unknown[];
  mocks.createRecord.mockReset();
  mocks.deleteDraft.mockReset();
  mocks.upsertProfile.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('useMemberData', () => {
  it('seeds profile and records from the mirrors while queries are loading', () => {
    saveProfileMirror(clientProfile);
    saveRecordsMirror([clientRecord]);
    mocks.profile = undefined;
    mocks.records = undefined;

    const { result } = renderHook(() => useMemberData());
    expect(result.current.profile).toEqual(clientProfile);
    expect(result.current.records).toEqual([clientRecord]);
  });

  it('maps server docs to client shapes when queries resolve', () => {
    const { result } = renderHook(() => useMemberData());
    expect(result.current.profile).toEqual(clientProfile);
    expect(result.current.records).toEqual([]);
  });

  it('writes the resolved server profile/records back to the mirrors', async () => {
    const { result } = renderHook(() => useMemberData());
    expect(result.current.profile).toEqual(clientProfile);

    await waitFor(() => {
      const storedProfile = JSON.parse(localStorage.getItem('mmf-profile') ?? '');
      expect(storedProfile).toEqual(clientProfile);
    });
  });

  it('treats a definitive null profile as no profile', () => {
    mocks.profile = null;
    const { result } = renderHook(() => useMemberData());
    expect(result.current.profile).toBeNull();
  });

  it('reports a saveRecord failure as an Arabic lastError', async () => {
    mocks.createRecord.mockRejectedValue(new Error('network'));
    const { result } = renderHook(() => useMemberData());

    await act(async () => {
      await result.current.saveRecord(clientRecord);
    });

    expect(mocks.createRecord).toHaveBeenCalledWith({
      record: { ...clientRecord, id: undefined as never },
    });
    expect(result.current.lastError).toBe('تعذر حفظ الحسبة — يرجى المحاولة مرة أخرى.');
  });

  it('clears lastError after a successful saveRecord', async () => {
    mocks.createRecord.mockRejectedValueOnce(new Error('network'));
    const { result } = renderHook(() => useMemberData());

    await act(async () => {
      await result.current.saveRecord(clientRecord);
    });
    expect(result.current.lastError).not.toBeNull();

    await act(async () => {
      await result.current.saveRecord(clientRecord);
    });
    expect(result.current.lastError).toBeNull();
  });

  it('reports a deleteRecord failure as an Arabic lastError', async () => {
    mocks.deleteDraft.mockRejectedValue(new Error('network'));
    const { result } = renderHook(() => useMemberData());

    await act(async () => {
      await result.current.deleteRecord('rec_1');
    });

    expect(mocks.deleteDraft).toHaveBeenCalledWith({ id: 'rec_1' });
    expect(result.current.lastError).toBe('تعذر حذف الحسبة — يرجى المحاولة مرة أخرى.');
  });

  it('clears lastError after a successful deleteRecord', async () => {
    mocks.deleteDraft.mockRejectedValueOnce(new Error('network'));
    const { result } = renderHook(() => useMemberData());

    await act(async () => {
      await result.current.deleteRecord('rec_1');
    });
    expect(result.current.lastError).not.toBeNull();

    await act(async () => {
      await result.current.deleteRecord('rec_1');
    });
    expect(result.current.lastError).toBeNull();
  });

  it('reports an updateProfile failure as an Arabic lastError', async () => {
    mocks.upsertProfile.mockRejectedValue(new Error('network'));
    const { result } = renderHook(() => useMemberData());

    await act(async () => {
      await result.current.updateProfile(clientProfile);
    });

    expect(mocks.upsertProfile).toHaveBeenCalledWith({
      profile: { ...clientProfile, id: undefined as never },
    });
    expect(result.current.lastError).toBe('تعذر حفظ الملف الشخصي — يرجى المحاولة مرة أخرى.');
  });

  it('clears lastError after a successful updateProfile', async () => {
    mocks.upsertProfile.mockRejectedValueOnce(new Error('network'));
    const { result } = renderHook(() => useMemberData());

    await act(async () => {
      await result.current.updateProfile(clientProfile);
    });
    expect(result.current.lastError).not.toBeNull();

    await act(async () => {
      await result.current.updateProfile(clientProfile);
    });
    expect(result.current.lastError).toBeNull();
  });

  it('clears lastError via clearError without a new mutation', async () => {
    mocks.createRecord.mockRejectedValueOnce(new Error('network'));
    const { result } = renderHook(() => useMemberData());

    await act(async () => {
      await result.current.saveRecord(clientRecord);
    });
    expect(result.current.lastError).not.toBeNull();

    await act(async () => {
      result.current.clearError();
    });
    expect(result.current.lastError).toBeNull();
  });
});
