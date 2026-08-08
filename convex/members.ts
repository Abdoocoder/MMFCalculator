import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { requireUserId } from "./helpers";

const memberProfileFields = {
  membershipNo: v.string(),
  fullName: v.string(),
  nationalId: v.string(),
  department: v.string(),
  jobTitle: v.string(),
  netSalary: v.number(),
  currentDeductions: v.number(),
  phone: v.string(),
  joinDate: v.string(),
  activeLoanCount: v.number(),
  totalLoansPaid: v.number(),
};

export async function getMyProfileHandler(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }
  return await ctx.db
    .query("members")
    .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
    .first();
}

export const getMyProfile = query({
  args: {},
  handler: getMyProfileHandler,
});

export async function createOnSignupHandler(
  ctx: MutationCtx,
  args: { profile: Record<string, unknown> },
) {
  const userId = await requireUserId(ctx);
  const existing = await ctx.db
    .query("members")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .first();
  if (existing) {
    return existing._id;
  }
  return await ctx.db.insert("members", { ...args.profile, userId });
}

export const createOnSignup = mutation({
  args: { profile: v.object(memberProfileFields) },
  handler: createOnSignupHandler,
});

export async function upsertMyProfileHandler(
  ctx: MutationCtx,
  args: { profile: Record<string, unknown> },
) {
  const userId = await requireUserId(ctx);
  const existing = await ctx.db
    .query("members")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .first();
  if (existing) {
    await ctx.db.patch(existing._id, args.profile);
    return existing._id;
  }
  return await ctx.db.insert("members", { ...args.profile, userId });
}

export const upsertMyProfile = mutation({
  args: { profile: v.object(memberProfileFields) },
  handler: upsertMyProfileHandler,
});
