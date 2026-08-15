import { describe, expect, it, vi } from "vitest";
import { requireUserId, requireAdmin, UNAUTHENTICATED, FORBIDDEN } from "./helpers";

describe("requireUserId", () => {
  it("returns the Clerk subject when authenticated", async () => {
    const ctx = {
      auth: { getUserIdentity: vi.fn().mockResolvedValue({ subject: "user_1" }) },
    };
    await expect(requireUserId(ctx as never)).resolves.toBe("user_1");
  });

  it("throws UNAUTHENTICATED when there is no identity", async () => {
    const ctx = {
      auth: { getUserIdentity: vi.fn().mockResolvedValue(null) },
    };
    await expect(requireUserId(ctx as never)).rejects.toThrow(UNAUTHENTICATED);
  });
});

describe("requireAdmin", () => {
  it("returns the role when the identity carries an admin claim", async () => {
    const ctx = {
      auth: { getUserIdentity: vi.fn().mockResolvedValue({ subject: "user_1", role: "admin" }) },
    };
    await expect(requireAdmin(ctx as never)).resolves.toBe("admin");
  });

  it("throws FORBIDDEN when the identity is not an admin", async () => {
    const ctx = {
      auth: { getUserIdentity: vi.fn().mockResolvedValue({ subject: "user_1", role: "member" }) },
    };
    await expect(requireAdmin(ctx as never)).rejects.toThrow(FORBIDDEN);
  });

  it("throws FORBIDDEN when the identity has no role claim", async () => {
    const ctx = {
      auth: { getUserIdentity: vi.fn().mockResolvedValue({ subject: "user_1" }) },
    };
    await expect(requireAdmin(ctx as never)).rejects.toThrow(FORBIDDEN);
  });

  it("throws UNAUTHENTICATED when there is no identity", async () => {
    const ctx = {
      auth: { getUserIdentity: vi.fn().mockResolvedValue(null) },
    };
    await expect(requireAdmin(ctx as never)).rejects.toThrow(UNAUTHENTICATED);
  });
});
