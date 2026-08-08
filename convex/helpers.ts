import { ConvexError } from "convex/values";

export const UNAUTHENTICATED = new ConvexError("unauthenticated");

/**
 * Resolves the caller's Clerk user id (the JWT `subject`), or throws
 * `UNAUTHENTICATED` when the request has no verified identity.
 */
export async function requireUserId(ctx: {
  auth: { getUserIdentity: () => Promise<{ subject: string } | null> };
}): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw UNAUTHENTICATED;
  }
  return identity.subject;
}
