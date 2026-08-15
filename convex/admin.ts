import { mutation, query, MutationCtx, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin, FORBIDDEN } from "./helpers";
import { Id } from "./_generated/dataModel";

export async function listApplicationsHandler(ctx: QueryCtx) {
  await requireAdmin(ctx);
  const records = await ctx.db
    .query("loanRecords")
    .filter((q) => q.neq(q.field("status"), "draft"))
    .collect();
  return await Promise.all(
    records.map(async (record) => ({
      record,
      member: (await ctx.db.query("members").withIndex("by_userId", (q) => q.eq("userId", record.userId)).first()) ?? null,
    })),
  );
}

export const listApplications = query({
  args: {},
  handler: listApplicationsHandler,
});

export async function setDecisionHandler(
  ctx: MutationCtx,
  args: { id: Id<"loanRecords">; status: "approved" | "rejected" },
) {
  await requireAdmin(ctx);
  const row = await ctx.db.get(args.id);
  if (!row || row.status === "draft") {
    return;
  }
  if (args.status !== "approved" && args.status !== "rejected") {
    throw FORBIDDEN;
  }
  await ctx.db.patch(args.id, { status: args.status });
}

export const setDecision = mutation({
  args: {
    id: v.id("loanRecords"),
    status: v.union(v.literal("approved"), v.literal("rejected")),
  },
  handler: setDecisionHandler,
});
