import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { requireUserId, FORBIDDEN } from "./helpers";
import { Doc, Id } from "./_generated/dataModel";

const recordFields = {
  referenceNo: v.string(),
  date: v.string(),
  productName: v.string(),
  loanAmount: v.number(),
  netIncome: v.number(),
  durationYears: v.number(),
  monthlyInstallment: v.number(),
  totalWithInsurance: v.number(),
  status: v.union(
    v.literal("draft"),
    v.literal("pending"),
  ),
  notes: v.optional(v.string()),
  resultSnapshot: v.optional(v.any()),
};

export type LoanRecordInput = Omit<Doc<"loanRecords">, "_id" | "_creationTime" | "userId">;

export async function listMyHandler(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return [];
  }
  return await ctx.db
    .query("loanRecords")
    .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
    .collect();
}

export const listMy = query({
  args: {},
  handler: listMyHandler,
});

export async function createHandler(
  ctx: MutationCtx,
  args: { record: LoanRecordInput },
) {
  const userId = await requireUserId(ctx);
  if (args.record.status !== "draft" && args.record.status !== "pending") {
    throw FORBIDDEN;
  }
  return await ctx.db.insert("loanRecords", { ...args.record, userId });
}

export const create = mutation({
  args: { record: v.object(recordFields) },
  handler: createHandler,
});

export async function updateStatusHandler(
  ctx: MutationCtx,
  args: { id: string; status: "draft" | "pending" | "approved" | "rejected" },
) {
  const userId = await requireUserId(ctx);
  const row = await ctx.db.get(args.id as Id<"loanRecords">);
  if (row && row.userId === userId) {
    const allowed =
      row.status === "draft" && args.status === "pending";
    if (!allowed) {
      throw FORBIDDEN;
    }
    await ctx.db.patch(args.id as Id<"loanRecords">, { status: args.status });
  }
}

export const updateStatus = mutation({
  args: {
    id: v.id("loanRecords"),
    status: v.union(
      v.literal("draft"),
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
    ),
  },
  handler: updateStatusHandler,
});

export async function deleteDraftHandler(ctx: MutationCtx, args: { id: string }) {
  const userId = await requireUserId(ctx);
  const row = await ctx.db.get(args.id as Id<"loanRecords">);
  if (row && row.userId === userId && row.status === "draft") {
    await ctx.db.delete(args.id as Id<"loanRecords">);
  }
}

export const deleteDraft = mutation({
  args: { id: v.id("loanRecords") },
  handler: deleteDraftHandler,
});
