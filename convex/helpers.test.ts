import { describe, expect, it, vi } from "vitest";
import { requireUserId, UNAUTHENTICATED } from "./helpers";

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
