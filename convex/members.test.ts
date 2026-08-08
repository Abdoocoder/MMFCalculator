import { describe, expect, it, vi } from "vitest";
import {
  getMyProfileHandler,
  createOnSignupHandler,
  upsertMyProfileHandler,
} from "./members";
import { UNAUTHENTICATED } from "./helpers";
import { Doc } from "./_generated/dataModel";

type Row = Omit<Doc<"members">, "_id" | "_creationTime"> & { _id: string };

function makeCtx(rows: Row[], identity: { subject: string } | null) {
  return {
    auth: { getUserIdentity: vi.fn().mockResolvedValue(identity) },
    db: {
      query: (table: string) => ({
        withIndex: (name: string, pred?: (q: never) => unknown) => ({
          first: async () => rows[0] ?? null,
          collect: async () => rows,
        }),
      }),
      insert: vi.fn(async (_t: string, doc: Record<string, unknown>) => {
        const row = { _id: `mem_${rows.length + 1}`, ...doc } as Row;
        rows.push(row);
        return row._id;
      }),
      patch: vi.fn(async () => {}),
      get: async (id: string) => rows.find((r) => r._id === id) ?? null,
    },
  };
}

const baseProfile = {
  membershipNo: "12345",
  fullName: "أحمد محمود الشوابكة",
  nationalId: "9851023456",
  department: "مديرية الهندسة والمشاريع",
  jobTitle: "رئيس قسم التخطيط العمراني",
  netSalary: 200,
  currentDeductions: 0,
  phone: "0791234567",
  joinDate: "2018-04-15",
  activeLoanCount: 1,
  totalLoansPaid: 3,
};

describe("members functions", () => {
  it("getMyProfile returns null when signed out", async () => {
    const ctx = makeCtx([], null);
    await expect(getMyProfileHandler(ctx as never)).resolves.toBeNull();
  });

  it("getMyProfile returns the caller's row when signed in", async () => {
    const row: Row = { _id: "mem_1", userId: "user_1", ...baseProfile };
    const ctx = makeCtx([row], { subject: "user_1" });
    await expect(getMyProfileHandler(ctx as never)).resolves.toEqual(row);
  });

  it("createOnSignup throws when signed out", async () => {
    const ctx = makeCtx([], null);
    await expect(createOnSignupHandler(ctx as never, { profile: baseProfile })).rejects.toThrow(UNAUTHENTICATED);
  });

  it("createOnSignup inserts a row scoped to the caller and is idempotent", async () => {
    const ctx = makeCtx([], { subject: "user_1" });
    const id1 = await createOnSignupHandler(ctx as never, { profile: baseProfile });
    const id2 = await createOnSignupHandler(ctx as never, { profile: baseProfile });
    expect(id1).toBe(id2);
    expect(ctx.db.insert).toHaveBeenCalledTimes(1);
    expect(ctx.db.insert).toHaveBeenCalledWith("members", expect.objectContaining({ userId: "user_1" }));
  });

  it("upsertMyProfile patches an existing row and inserts a missing one", async () => {
    const row: Row = { _id: "mem_1", userId: "user_1", ...baseProfile };
    const ctx = makeCtx([row], { subject: "user_1" });
    await upsertMyProfileHandler(ctx as never, { profile: { ...baseProfile, phone: "0799999999" } });
    expect(ctx.db.patch).toHaveBeenCalledWith("mem_1", expect.objectContaining({ phone: "0799999999" }));

    const empty = makeCtx([], { subject: "user_2" });
    const id = await upsertMyProfileHandler(empty as never, { profile: baseProfile });
    expect(empty.db.insert).toHaveBeenCalledWith("members", expect.objectContaining({ userId: "user_2" }));
    expect(id).toContain("mem_");
  });
});
