import type { LoanRecord, MemberProfile } from '../types';

const PROFILE_KEY = 'mmf-profile';
const RECORDS_KEY = 'mmf-records';

const RECORD_STATUSES = ['draft', 'pending', 'approved', 'rejected'];

export function isMemberProfileShape(value: unknown): value is MemberProfile {
  if (typeof value !== 'object' || value === null) return false;
  const p = value as Record<string, unknown>;
  return (
    typeof p.id === 'string' &&
    typeof p.membershipNo === 'string' &&
    typeof p.fullName === 'string' &&
    typeof p.nationalId === 'string' &&
    typeof p.department === 'string' &&
    typeof p.jobTitle === 'string' &&
    typeof p.netSalary === 'number' &&
    typeof p.currentDeductions === 'number' &&
    typeof p.phone === 'string' &&
    typeof p.joinDate === 'string' &&
    typeof p.activeLoanCount === 'number' &&
    typeof p.totalLoansPaid === 'number'
  );
}

export function isLoanRecordShape(value: unknown): value is LoanRecord {
  if (typeof value !== 'object' || value === null) return false;
  const r = value as Record<string, unknown>;
  return (
    typeof r.id === 'string' &&
    typeof r.referenceNo === 'string' &&
    typeof r.date === 'string' &&
    typeof r.productName === 'string' &&
    typeof r.loanAmount === 'number' &&
    typeof r.netIncome === 'number' &&
    typeof r.durationYears === 'number' &&
    typeof r.monthlyInstallment === 'number' &&
    typeof r.totalWithInsurance === 'number' &&
    typeof r.status === 'string' &&
    RECORD_STATUSES.includes(r.status)
  );
}

function readRaw(key: string): unknown {
  const raw = localStorage.getItem(key);
  if (raw === null) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

/**
 * Validated localStorage reads — malformed-but-valid JSON can no longer blank
 * the app: bad entries are dropped instead of crashing the profile/records.
 */
export function loadProfileMirror(): MemberProfile | null {
  const parsed = readRaw(PROFILE_KEY);
  return isMemberProfileShape(parsed) ? parsed : null;
}

export function loadRecordsMirror(): LoanRecord[] {
  const parsed = readRaw(RECORDS_KEY);
  if (!Array.isArray(parsed)) return [];
  return parsed.filter(isLoanRecordShape);
}

export function saveProfileMirror(profile: MemberProfile | null): void {
  try {
    if (profile === null) {
      localStorage.removeItem(PROFILE_KEY);
    } else {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    }
  } catch {
    /* storage blocked — fail silently */
  }
}

export function saveRecordsMirror(records: LoanRecord[]): void {
  try {
    if (records.length === 0) {
      localStorage.removeItem(RECORDS_KEY);
    } else {
      localStorage.setItem(RECORDS_KEY, JSON.stringify(records));
    }
  } catch {
    /* storage blocked — fail silently */
  }
}
