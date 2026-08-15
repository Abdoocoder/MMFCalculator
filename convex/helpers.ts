import { ConvexError } from "convex/values";

export const UNAUTHENTICATED = new ConvexError("unauthenticated");
export const FORBIDDEN = new ConvexError("forbidden");

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

type IdentityWithRole = { subject: string; role?: string | null };

/**
 * Resolves the caller's role, or throws `UNAUTHENTICATED` when signed out
 * and `FORBIDDEN` when the identity lacks an admin role claim. The claim is
 * populated from Clerk user publicMetadata via the JWT template.
 */
export async function requireAdmin(ctx: {
  auth: { getUserIdentity: () => Promise<IdentityWithRole | null> };
}): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw UNAUTHENTICATED;
  }
  if (identity.role !== "admin") {
    throw FORBIDDEN;
  }
  return identity.role;
}
