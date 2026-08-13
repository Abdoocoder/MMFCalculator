import type { Doc } from '../convex/_generated/dataModel';

export interface LoanProduct {
  id: string;
  name: string;
  profitRate: number; // e.g. 0.15 for 15%
  maxYears: number;
  description: string;
}

export interface CalculationInput {
  productId: string;
  loanAmount: number;
  netIncome: number;
  currentDeductions: number;
  durationYears: number;
}

export interface CalculationResult {
  netFinancing: number;
  profitRate: number; // percentage display e.g. 15
  annualProfit: number;
  totalProfit: number;
  totalPayable: number;
  annualInsurance: number;
  totalInsurance: number;
  totalWithInsurance: number;
  monthlyInstallment: number;
  maxInstallment: number;
  isEligible: boolean;
  dtiPercentage: number;
}

/**
 * Single source of truth for persisted record/profile shapes is the Convex
 * schema (convex/schema.ts) via the generated Doc<> types. The `id` field is a
 * client-only alias for `_id`; `userId`/`_creationTime` are server-managed.
 */
export type LoanRecord = Omit<
  Doc<'loanRecords'>,
  '_id' | '_creationTime' | 'userId' | 'resultSnapshot'
> & {
  id: string;
  resultSnapshot?: CalculationResult;
};

export type MemberProfile = Omit<
  Doc<'members'>,
  '_id' | '_creationTime' | 'userId'
> & {
  id: string;
};
