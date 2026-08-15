import { describe, expect, it, vi } from "vitest";
import { getMyRoleHandler } from "./auth";

function makeCtx(identity: { subject: string; role?: string | null } | null) {
  return {
    auth: { getUserIdentity: vi.fn().mockResolvedValue(identity) },
  };
}

describe("getMyRole", () => {
  it("returns the admin role from the JWT claim", async () => {
    const ctx = makeCtx({ subject: "user_1", role: "admin" });
    await expect(getMyRoleHandler(ctx as never)).resolves.toBe("admin");
  });

  it("returns the member role from the JWT claim", async () => {
    const ctx = makeCtx({ subject: "user_1", role: "member" });
    await expect(getMyRoleHandler(ctx as never)).resolves.toBe("member");
  });

  it("returns null when the identity has no role claim", async () => {
    const ctx = makeCtx({ subject: "user_1" });
    await expect(getMyRoleHandler(ctx as never)).resolves.toBeNull();
  });

  it("returns null when signed out", async () => {
    const ctx = makeCtx(null);
    await expect(getMyRoleHandler(ctx as never)).resolves.toBeNull();
  });
});
