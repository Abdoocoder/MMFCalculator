import { query, QueryCtx } from "./_generated/server";

export async function getMyRoleHandler(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity || typeof identity.role !== "string") {
    return null;
  }
  return identity.role;
}

export const getMyRole = query({
  args: {},
  handler: getMyRoleHandler,
});
