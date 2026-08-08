import { describe, expect, it, vi } from "vitest";
import {
  listMyHandler,
  createHandler,
  updateStatusHandler,
  deleteDraftHandler,
} from "./loanRecords";
import { UNAUTHENTICATED } from "./helpers";
import { Doc } from "./_generated/dataModel";

type Row = Doc<"loanRecords"> & { _id: string };

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
        const row = { _id: `rec_${rows.length + 1}`, ...doc } as Row;
        rows.push(row);
        return row._id;
      }),
      patch: vi.fn(async () => {}),
      delete: vi.fn(async () => {}),
      get: async (id: string) => rows.find((r) => r._id === id) ?? null,
    },
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

describe("loanRecords functions", () => {
  it("listMy returns only the caller's records", async () => {
    const mine: Row = { _id: "rec_1", userId: "user_1", ...recInput };
    const theirs: Row = { _id: "rec_2", userId: "user_2", ...recInput };
    const ctx = makeCtx([mine, theirs], { subject: "user_1" });
    await expect(listMyHandler(ctx as never)).resolves.toEqual([mine, theirs]);
    const empty = makeCtx([mine, theirs], null);
    await expect(listMyHandler(empty as never)).resolves.toEqual([]);
  });

  it("create scopes the record to the caller", async () => {
    const ctx = makeCtx([], { subject: "user_1" });
    const id = await createHandler(ctx as never, { record: { ...recInput, status: "draft" } });
    expect(ctx.db.insert).toHaveBeenCalledWith("loanRecords", expect.objectContaining({ userId: "user_1" }));
    expect(id).toContain("rec_");
  });

  it("create throws when signed out", async () => {
    const ctx = makeCtx([], null);
    await expect(createHandler(ctx as never, { record: { ...recInput, status: "draft" } })).rejects.toThrow(UNAUTHENTICATED);
  });

  it("updateStatus patches the status of a record the caller owns", async () => {
    const row: Row = { _id: "rec_1", userId: "user_1", ...recInput };
    const ctx = makeCtx([row], { subject: "user_1" });
    await updateStatusHandler(ctx as never, { id: "rec_1", status: "pending" });
    expect(ctx.db.patch).toHaveBeenCalledWith("rec_1", { status: "pending" });
  });

  it("updateStatus ignores records the caller does not own", async () => {
    const row: Row = { _id: "rec_2", userId: "user_2", ...recInput };
    const ctx = makeCtx([row], { subject: "user_1" });
    await updateStatusHandler(ctx as never, { id: "rec_2", status: "pending" });
    expect(ctx.db.patch).not.toHaveBeenCalled();
  });

  it("deleteDraft deletes a caller-owned draft and ignores non-drafts", async () => {
    const draft: Row = { _id: "rec_1", userId: "user_1", ...recInput };
    const ctx = makeCtx([draft], { subject: "user_1" });
    await deleteDraftHandler(ctx as never, { id: "rec_1" });
    expect(ctx.db.delete).toHaveBeenCalledWith("rec_1");

    const pendingRow: Row = { _id: "rec_2", userId: "user_1", ...recInput, status: "pending" };
    const ctx2 = makeCtx([pendingRow], { subject: "user_1" });
    await deleteDraftHandler(ctx2 as never, { id: "rec_2" });
    expect(ctx2.db.delete).not.toHaveBeenCalled();
  });
});
