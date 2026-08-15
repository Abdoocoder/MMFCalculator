import { useCallback, useMemo, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import type { AdminApplication } from '../types';
import { toLoanRecord } from '../data/convexAdapters';

export interface UseAdminDataResult {
  applications: AdminApplication[];
  decide: (id: string, status: 'approved' | 'rejected') => Promise<void>;
  lastError: string | null;
  clearError: () => void;
}

/**
 * Admin-only data hook for the review screen. `applications` is reactive
 * (Convex query); `decide` issues the admin approval/rejection mutation.
 * `enabled` gates the query on `useMyRole().isAdmin`: when false, Convex's
 * `"skip"` sentinel suppresses the query entirely, so non-admins never hit
 * the server-side FORBIDDEN error (which `useQuery` would re-throw and
 * blank the whole app, since there is no error boundary).
 */
export function useAdminData(enabled = true): UseAdminDataResult {
  const applicationDocs = useQuery(api.admin.listApplications, enabled ? {} : 'skip');
  const setDecision = useMutation(api.admin.setDecision);

  const [lastError, setLastError] = useState<string | null>(null);

  const applications = useMemo<AdminApplication[]>(
    () =>
      applicationDocs === undefined
        ? []
        : applicationDocs.map(({ record, member }) => ({
            record: toLoanRecord(record),
            member: member
              ? {
                  membershipNo: member.membershipNo,
                  fullName: member.fullName,
                  department: member.department,
                  phone: member.phone,
                }
              : null,
          })),
    [applicationDocs],
  );

  const decide = useCallback(
    async (id: string, status: 'approved' | 'rejected') => {
      try {
        await setDecision({ id: id as Id<'loanRecords'>, status });
        setLastError(null);
      } catch {
        setLastError('تعذر حفظ القرار — يرجى المحاولة مرة أخرى.');
      }
    },
    [setDecision],
  );

  return {
    applications,
    decide,
    lastError,
    clearError: () => setLastError(null),
  };
}
