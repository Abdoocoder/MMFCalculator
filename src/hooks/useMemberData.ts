import { useCallback, useEffect, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import type { LoanRecord, MemberProfile } from '../types';
import {
  toLoanRecord,
  toMemberProfile,
  toLoanRecordInput,
  toMemberProfileInput,
} from '../data/convexAdapters';
import {
  loadProfileMirror,
  loadRecordsMirror,
  saveProfileMirror,
  saveRecordsMirror,
} from '../data/mirror';

export interface UseMemberDataResult {
  profile: MemberProfile | null;
  records: LoanRecord[];
  saveRecord: (record: LoanRecord) => Promise<void>;
  deleteRecord: (id: string) => Promise<void>;
  updateProfile: (profile: MemberProfile) => Promise<void>;
  lastError: string | null;
  clearError: () => void;
}

/**
 * Central data hook for the authenticated member app.
 *
 * Reads come from Convex (reactive). localStorage mirrors (mmf-profile /
 * mmf-records) are used ONLY as an offline/cold-start fallback: when a query
 * is still loading (undefined) we seed from the mirror; a definitive server
 * value wins and is written back to the mirror; a definitive null/[] clears it.
 */
export function useMemberData(): UseMemberDataResult {
  const profileDoc = useQuery(api.members.getMyProfile);
  const recordDocs = useQuery(api.loanRecords.listMy);

  const createRecord = useMutation(api.loanRecords.create);
  const deleteDraft = useMutation(api.loanRecords.deleteDraft);
  const upsertProfile = useMutation(api.members.upsertMyProfile);

  const [lastError, setLastError] = useState<string | null>(null);

  // Seed from mirrors only once, on cold start.
  const [mirrorProfile] = useState<MemberProfile | null>(() => loadProfileMirror());
  const [mirrorRecords] = useState<LoanRecord[]>(() => loadRecordsMirror());

  const profile: MemberProfile | null =
    profileDoc === undefined
      ? mirrorProfile
      : profileDoc === null
        ? null
        : toMemberProfile(profileDoc);

  const records: LoanRecord[] =
    recordDocs === undefined ? mirrorRecords : recordDocs.map(toLoanRecord);

  // Mirror writes happen in effects so rendering stays side-effect free.
  useEffect(() => {
    if (profileDoc === undefined) return;
    saveProfileMirror(profile);
  }, [profileDoc, profile]);

  useEffect(() => {
    if (recordDocs === undefined) return;
    saveRecordsMirror(records);
  }, [recordDocs, records]);

  const saveRecord = useCallback(
    async (record: LoanRecord) => {
      try {
        await createRecord({ record: toLoanRecordInput(record) });
        setLastError(null);
      } catch {
        setLastError('تعذر حفظ الحسبة — يرجى المحاولة مرة أخرى.');
      }
    },
    [createRecord],
  );

  const deleteRecord = useCallback(
    async (id: string) => {
      try {
        await deleteDraft({ id: id as Id<'loanRecords'> });
        setLastError(null);
      } catch {
        setLastError('تعذر حذف الحسبة — يرجى المحاولة مرة أخرى.');
      }
    },
    [deleteDraft],
  );

  const updateProfile = useCallback(
    async (profile: MemberProfile) => {
      try {
        await upsertProfile({ profile: toMemberProfileInput(profile) });
        setLastError(null);
      } catch {
        setLastError('تعذر حفظ الملف الشخصي — يرجى المحاولة مرة أخرى.');
      }
    },
    [upsertProfile],
  );

  return { profile, records, saveRecord, deleteRecord, updateProfile, lastError, clearError: () => setLastError(null) };
}
