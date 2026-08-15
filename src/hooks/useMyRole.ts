import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';

export interface UseMyRoleResult {
  role: string | null;
  isAdmin: boolean;
}

/**
 * Single client-side source of truth for the caller's role. Reads the JWT
 * `role` claim through the `auth:getMyRole` query — never derived from
 * client-held publicMetadata, so the server and the UI cannot drift.
 */
export function useMyRole(): UseMyRoleResult {
  const role = useQuery(api.auth.getMyRole);
  return {
    role: role === undefined ? null : role,
    isAdmin: role === 'admin',
  };
}
