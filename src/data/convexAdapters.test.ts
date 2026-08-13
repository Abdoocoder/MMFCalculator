import { describe, expect, it } from 'vitest';
import type { Doc } from '../../convex/_generated/dataModel';
import {
  toLoanRecord,
  toLoanRecordInput,
  toMemberProfile,
  toMemberProfileInput,
} from './convexAdapters';
import type { LoanRecord, MemberProfile, CalculationResult } from '../types';

const profileDoc = {
  _id: 'members-abc123' as Doc<'members'>['_id'],
  _creationTime: 1754049600000,
  userId: 'user_123',
  membershipNo: 'M-100',
  fullName: 'أحمد محمد',
  nationalId: '1234567890',
  department: 'التخطيط',
  jobTitle: 'مهندس',
  netSalary: 800,
  currentDeductions: 120,
  phone: '0770000000',
  joinDate: '2020-01-01',
  activeLoanCount: 1,
  totalLoansPaid: 3,
};

const recordDoc = {
  _id: 'loanRecords-xyz789' as Doc<'loanRecords'>['_id'],
  _creationTime: 1754049600000,
  userId: 'user_123',
  referenceNo: 'MDB-20260801-120000-123',
  date: '2026-08-01',
  productName: 'مرابحة الأثاث',
  loanAmount: 1200,
  netIncome: 350,
  durationYears: 2,
  monthlyInstallment: 65.65,
  totalWithInsurance: 1575.6,
  status: 'pending' as const,
  notes: 'ملاحظة',
  resultSnapshot: { monthlyInstallment: 65.65 } as CalculationResult,
};

describe('convexAdapters', () => {
  it('toMemberProfile maps _id to id and strips server-only fields', () => {
    const profile: MemberProfile = toMemberProfile(profileDoc);
    expect(profile.id).toBe('members-abc123');
    expect(profile.membershipNo).toBe('M-100');
    expect(profile.fullName).toBe('أحمد محمد');
    expect(profile).not.toHaveProperty('_id');
    expect(profile).not.toHaveProperty('_creationTime');
    expect(profile).not.toHaveProperty('userId');
  });

  it('toLoanRecord maps _id to id and keeps resultSnapshot', () => {
    const record: LoanRecord = toLoanRecord(recordDoc);
    expect(record.id).toBe('loanRecords-xyz789');
    expect(record.referenceNo).toBe('MDB-20260801-120000-123');
    expect(record.resultSnapshot).toEqual({ monthlyInstallment: 65.65 });
    expect(record).not.toHaveProperty('_id');
    expect(record).not.toHaveProperty('userId');
  });

  it('toLoanRecord tolerates a record without a resultSnapshot', () => {
    const { resultSnapshot: _snap, ...noSnapshot } = recordDoc;
    const record = toLoanRecord(noSnapshot);
    expect(record.id).toBe('loanRecords-xyz789');
    expect(record.resultSnapshot).toBeUndefined();
  });

  it('toMemberProfileInput strips id for the mutation payload', () => {
    const profile: MemberProfile = toMemberProfile(profileDoc);
    const input = toMemberProfileInput(profile);
    expect(input).not.toHaveProperty('id');
    expect(input.membershipNo).toBe('M-100');
    expect(input.netSalary).toBe(800);
  });

  it('toLoanRecordInput strips id for the mutation payload', () => {
    const record: LoanRecord = toLoanRecord(recordDoc);
    const input = toLoanRecordInput(record);
    expect(input).not.toHaveProperty('id');
    expect(input.referenceNo).toBe('MDB-20260801-120000-123');
    expect(input.status).toBe('pending');
    expect(input.resultSnapshot).toEqual({ monthlyInstallment: 65.65 });
  });
});
