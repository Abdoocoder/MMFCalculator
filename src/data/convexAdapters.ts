import type { CalculationResult, LoanRecord, MemberProfile } from '../types';
import type { Doc } from '../../convex/_generated/dataModel';

type ProfileDoc = Doc<'members'>;
type RecordDoc = Doc<'loanRecords'>;

export function toMemberProfile(doc: ProfileDoc): MemberProfile {
  const { _id, _creationTime: _createdAt, userId: _userId, ...rest } = doc;
  return { ...rest, id: _id };
}

export function toLoanRecord(doc: RecordDoc): LoanRecord {
  const { _id, _creationTime: _createdAt, userId: _userId, ...rest } = doc;
  return {
    ...rest,
    id: _id,
    resultSnapshot: rest.resultSnapshot as CalculationResult | undefined,
  };
}

export function toMemberProfileInput(profile: MemberProfile) {
  const { id: _id, ...rest } = profile;
  return rest;
}

export function toLoanRecordInput(record: LoanRecord) {
  const { id: _id, ...rest } = record;
  return rest as Omit<LoanRecord, 'id' | 'status'> & { status: 'draft' | 'pending' };
}
