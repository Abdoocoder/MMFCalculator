import { describe, expect, it, beforeEach, vi } from 'vitest';
import {
  isLoanRecordShape,
  isMemberProfileShape,
  loadProfileMirror,
  loadRecordsMirror,
  saveProfileMirror,
  saveRecordsMirror,
} from './mirror';
import type { LoanRecord, MemberProfile } from '../types';

const validProfile: MemberProfile = {
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

const validRecord: LoanRecord = {
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

describe('mirror', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('isMemberProfileShape accepts a full profile and rejects bad shapes', () => {
    expect(isMemberProfileShape(validProfile)).toBe(true);
    expect(isMemberProfileShape(null)).toBe(false);
    expect(isMemberProfileShape('not-an-object')).toBe(false);
    expect(isMemberProfileShape({ ...validProfile, netSalary: '850' })).toBe(false);
    expect(isMemberProfileShape({ ...validProfile, id: 42 })).toBe(false);
    expect(isMemberProfileShape({ ...validProfile, fullName: undefined })).toBe(false);
  });

  it('isLoanRecordShape accepts a full record and rejects bad shapes/statuses', () => {
    expect(isLoanRecordShape(validRecord)).toBe(true);
    expect(isLoanRecordShape(null)).toBe(false);
    expect(isLoanRecordShape([])).toBe(false);
    expect(isLoanRecordShape({ ...validRecord, loanAmount: '500' })).toBe(false);
    expect(isLoanRecordShape({ ...validRecord, status: 'cancelled' })).toBe(false);
    expect(isLoanRecordShape({ ...validRecord, referenceNo: undefined })).toBe(false);
  });

  it('round-trips a profile through saveProfileMirror/loadProfileMirror', () => {
    expect(loadProfileMirror()).toBeNull();
    saveProfileMirror(validProfile);
    expect(loadProfileMirror()).toEqual(validProfile);
  });

  it('saving a null profile clears the stored mirror', () => {
    saveProfileMirror(validProfile);
    saveProfileMirror(null);
    expect(localStorage.getItem('mmf-profile')).toBeNull();
    expect(loadProfileMirror()).toBeNull();
  });

  it('drops a malformed-but-valid JSON profile instead of crashing', () => {
    localStorage.setItem('mmf-profile', '{"id":"mem_1","fullName":123}');
    expect(loadProfileMirror()).toBeNull();
  });

  it('returns null for unparseable profile JSON', () => {
    localStorage.setItem('mmf-profile', '{not json');
    expect(loadProfileMirror()).toBeNull();
  });

  it('round-trips records through saveRecordsMirror/loadRecordsMirror', () => {
    expect(loadRecordsMirror()).toEqual([]);
    saveRecordsMirror([validRecord]);
    expect(loadRecordsMirror()).toEqual([validRecord]);
  });

  it('saving an empty records list clears the stored mirror', () => {
    saveRecordsMirror([validRecord]);
    saveRecordsMirror([]);
    expect(localStorage.getItem('mmf-records')).toBeNull();
    expect(loadRecordsMirror()).toEqual([]);
  });

  it('filters corrupt entries out of a mixed records array', () => {
    saveRecordsMirror([validRecord, { ...validRecord, id: 7 as unknown as string }]);
    expect(loadRecordsMirror()).toEqual([validRecord]);
  });

  it('returns [] when stored records value is not an array', () => {
    localStorage.setItem('mmf-records', '{"nope":true}');
    expect(loadRecordsMirror()).toEqual([]);
  });

  it('returns [] for unparseable records JSON', () => {
    localStorage.setItem('mmf-records', 'not-json');
    expect(loadRecordsMirror()).toEqual([]);
  });

  it('fails silently when storage writes are blocked', () => {
    const setItem = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });
    const removeItem = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });

    expect(() => saveProfileMirror(validProfile)).not.toThrow();
    expect(() => saveProfileMirror(null)).not.toThrow();
    expect(() => saveRecordsMirror([validRecord])).not.toThrow();
    expect(() => saveRecordsMirror([])).not.toThrow();

    setItem.mockRestore();
    removeItem.mockRestore();
  });
});
