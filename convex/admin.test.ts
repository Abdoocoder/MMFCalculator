import { describe, expect, it, vi } from "vitest";
import { listApplicationsHandler, setDecisionHandler } from "./admin";
import { UNAUTHENTICATED, FORBIDDEN } from "./helpers";
import { Doc, Id } from "./_generated/dataModel";

type RecordRow = Omit<Doc<"loanRecords">, "_id" | "_creationTime"> & { _id: string };
type MemberRow = Omit<Doc<"members">, "_id" | "_creationTime"> & { _id: string };

function makeCtx(
  recordRows: RecordRow[],
  memberRows: MemberRow[],
  identity: { subject: string; role?: string | null } | null,
) {
  const query = (table: string) => ({
    withIndex: (name: string, pred?: (q: never) => unknown) => ({
      first: async () =>
        table === "members" ? memberRows[0] ?? null : null,
      collect: async () =>
        table === "loanRecords"
          ? recordRows
          : table === "members"
            ? memberRows
            : [],
    }),
    filter: (pred: (q: never) => unknown) => ({
      collect: async () =>
        table === "loanRecords"
          ? recordRows.filter((r) => r.status !== "draft")
          : [],
    }),
  });
  const db: Record<string, unknown> = {
    query,
    get: async (id: string) =>
      recordRows.find((r) => r._id === id) ??
      memberRows.find((m) => m._id === id) ??
      null,
    patch: vi.fn(async () => {}),
  };
  return {
    auth: { getUserIdentity: vi.fn().mockResolvedValue(identity) },
    db,
  };
}

const recInput = {
  referenceNo: "MDB-2026-0842",
  date: "2026-08-01",
  productName: "مرابحة الأجهزة الكهربائية والإلكترونية",
  loanAmount: 500,
  netIncome: 200,
  durationYears: 1,
  monthlyInstallment: 48.16,
  totalWithInsurance: 577.88,
  status: "draft",
  notes: "حسبة محفوظة",
} as const;

const memberInput = {
  membershipNo: "001",
  fullName: "أحمد العبدالله",
  nationalId: "9000000000",
  department: "الإدارة المالية",
  jobTitle: "محاسب",
  netSalary: 800,
  currentDeductions: 0,
  phone: "0790000000",
  joinDate: "2020-01-01",
  activeLoanCount: 0,
  totalLoansPaid: 0,
} as const;

describe("listApplications", () => {
  it("returns non-draft records joined with the member profile", async () => {
    const rec: RecordRow = { _id: "rec_1", userId: "user_1", ...recInput, status: "pending" };
    const draftRec: RecordRow = { _id: "rec_2", userId: "user_2", ...recInput, status: "draft" };
    const member: MemberRow = { _id: "mem_1", userId: "user_1", ...memberInput };
    const ctx = makeCtx([rec, draftRec], [member], { subject: "admin_1", role: "admin" });
    const result = await listApplicationsHandler(ctx as never);
    expect(result).toHaveLength(1);
    expect(result[0].record._id).toBe("rec_1");
    expect(result[0].member).toEqual(
      expect.objectContaining({
        fullName: "أحمد العبدالله",
        membershipNo: "001",
        department: "الإدارة المالية",
        phone: "0790000000",
      }),
    );
  });

  it("returns a null member when the profile is missing", async () => {
    const rec: RecordRow = { _id: "rec_1", userId: "user_1", ...recInput, status: "approved" };
    const ctx = makeCtx([rec], [], { subject: "admin_1", role: "admin" });
    const result = await listApplicationsHandler(ctx as never);
    expect(result).toHaveLength(1);
    expect(result[0].member).toBeNull();
  });

  it("throws FORBIDDEN for non-admins", async () => {
    const ctx = makeCtx([], [], { subject: "user_1", role: "member" });
    await expect(listApplicationsHandler(ctx as never)).rejects.toThrow(FORBIDDEN);
  });

  it("throws UNAUTHENTICATED when signed out", async () => {
    const ctx = makeCtx([], [], null);
    await expect(listApplicationsHandler(ctx as never)).rejects.toThrow(UNAUTHENTICATED);
  });
});

describe("setDecision", () => {
  it("approves a pending application", async () => {
    const rec: RecordRow = { _id: "rec_1", userId: "user_1", ...recInput, status: "pending" };
    const ctx = makeCtx([rec], [], { subject: "admin_1", role: "admin" });
    await setDecisionHandler(ctx as never, { id: "rec_1" as Id<"loanRecords">, status: "approved" });
    expect(ctx.db.patch).toHaveBeenCalledWith("rec_1", { status: "approved" });
  });

  it("rejects a pending application", async () => {
    const rec: RecordRow = { _id: "rec_1", userId: "user_1", ...recInput, status: "pending" };
    const ctx = makeCtx([rec], [], { subject: "admin_1", role: "admin" });
    await setDecisionHandler(ctx as never, { id: "rec_1" as Id<"loanRecords">, status: "rejected" });
    expect(ctx.db.patch).toHaveBeenCalledWith("rec_1", { status: "rejected" });
  });

  it("allows reversing an existing decision", async () => {
    const rec: RecordRow = { _id: "rec_1", userId: "user_1", ...recInput, status: "approved" };
    const ctx = makeCtx([rec], [], { subject: "admin_1", role: "admin" });
    await setDecisionHandler(ctx as never, { id: "rec_1" as Id<"loanRecords">, status: "rejected" });
    expect(ctx.db.patch).toHaveBeenCalledWith("rec_1", { status: "rejected" });
  });

  it("allows approving a previously rejected application", async () => {
    const rec: RecordRow = { _id: "rec_1", userId: "user_1", ...recInput, status: "rejected" };
    const ctx = makeCtx([rec], [], { subject: "admin_1", role: "admin" });
    await setDecisionHandler(ctx as never, { id: "rec_1" as Id<"loanRecords">, status: "approved" });
    expect(ctx.db.patch).toHaveBeenCalledWith("rec_1", { status: "approved" });
  });

  it("throws FORBIDDEN for non-admins", async () => {
    const ctx = makeCtx([], [], { subject: "user_1", role: "member" });
    await expect(
      setDecisionHandler(ctx as never, { id: "rec_1" as Id<"loanRecords">, status: "approved" }),
    ).rejects.toThrow(FORBIDDEN);
  });

  it("throws UNAUTHENTICATED when signed out", async () => {
    const ctx = makeCtx([], [], null);
    await expect(
      setDecisionHandler(ctx as never, { id: "rec_1" as Id<"loanRecords">, status: "approved" }),
    ).rejects.toThrow(UNAUTHENTICATED);
  });

  it("throws FORBIDDEN for an invalid status passed directly to the handler", async () => {
    const rec: RecordRow = { _id: "rec_1", userId: "user_1", ...recInput, status: "pending" };
    const ctx = makeCtx([rec], [], { subject: "admin_1", role: "admin" });
    await expect(
      setDecisionHandler(ctx as never, {
        id: "rec_1" as Id<"loanRecords">,
        status: "draft" as "approved",
      }),
    ).rejects.toThrow(FORBIDDEN);
  });

  it("no-ops when the application does not exist", async () => {
    const ctx = makeCtx([], [], { subject: "admin_1", role: "admin" });
    await setDecisionHandler(ctx as never, { id: "rec_missing" as Id<"loanRecords">, status: "approved" });
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });
});
