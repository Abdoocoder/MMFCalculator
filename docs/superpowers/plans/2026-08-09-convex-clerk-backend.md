# Convex Backend + Clerk Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the MMF Calculator's member app (`#app`) a real backend and identity: Clerk handles sign-in, Convex stores each member's profile and loan records scoped to their Clerk `userId`, while the landing page and its live calculator stay fully public.

**Architecture:** A Vite React SPA where `ClerkProvider` wraps `ConvexProviderWithClerk` (`convex/react-clerk`) at the root. The `LandingGate` hash switch stays: `/` renders the public landing, `#app` renders an `AuthGate` that shows a sign-in screen (signed out), a sign-up form (first login), or the member `<App />` (signed in with a profile row). All member data moves out of `localStorage` into Convex tables `members` and `loanRecords`, indexed by `userId`; Convex functions read `ctx.auth.getUserIdentity().subject` for the Clerk user id.

**Tech Stack:** React 19, Vite 6, TypeScript, Tailwind 4, Vitest + Testing Library (jsdom), Convex (`convex`, `convex/react`, `convex/react-clerk`, `convex/server`), Clerk (`@clerk/clerk-react`).

**Setup prerequisite (one-time, manual — requires accounts):**
1. Create a Clerk application at https://dashboard.clerk.com and copy its **Publishable Key**.
2. Run `npx convex dev` from the repo root once; log in via the browser prompt and create a project. Copy the printed `VITE_CONVEX_URL` (e.g. `https://happy-fox-123.convex.cloud`). This also generates `convex/_generated/` types.
3. In the Convex dashboard, configure the Clerk JWT issuer as `CLERK_JWT_ISSUER_DOMAIN` (e.g. `https://your-app.clerk.accounts.dev`) — see https://docs.convex.dev/auth/clerk#configuring-dev-and-prod-instances.
4. Create `.env.local` with all three values (see Task 1). `.env*` is already gitignored; `.env.example` is committed.

---

## File Structure

- **Create** `convex/schema.ts` — Convex schema: `members`, `loanRecords` tables + indexes
- **Create** `convex/auth.config.ts` — Clerk JWT provider config
- **Create** `convex/helpers.ts` — shared auth guard helpers (testable pure logic)
- **Create** `convex/members.ts` — profile query + mutations (exported handlers for tests)
- **Create** `convex/loanRecords.ts` — record query + mutations (exported handlers for tests)
- **Create** `convex/members.test.ts`, `convex/loanRecords.test.ts` — Convex function unit tests with a fake `ctx`
- **Create** `src/vite-env.d.ts` — `ImportMetaEnv` typing for the new env vars
- **Create** `src/auth/AuthGate.tsx` — gates the `#app` surface (loading / sign-in / sign-up / app)
- **Create** `src/auth/SignInScreen.tsx` — sign-in screen using Clerk's `openSignIn()` modal
- **Create** `src/auth/SignUpForm.tsx` — first-login profile form → `members.createOnSignup`
- **Create** `src/auth/AuthGate.test.tsx`, `src/auth/SignInScreen.test.tsx`, `src/auth/SignUpForm.test.tsx`
- **Modify** `src/main.tsx` — add `ClerkProvider` + `ConvexProviderWithClerk`
- **Modify** `src/landing/LandingGate.tsx` — `#app` renders `<AuthGate><App /></AuthGate>`
- **Modify** `src/landing/LandingGate.test.tsx` — mock `AuthGate` passthrough + Convex hooks
- **Modify** `src/App.tsx` — replace localStorage profile/records with Convex hooks
- **Modify** `src/App.test.tsx` — rewrite persistence tests to mock Convex hooks
- **Modify** `.env.example` — document the new env vars
- **Modify** `VERSION` (→ `0.3.0.0`), `CHANGELOG.md`, `PRODUCT.md`, `TODOS.md`

Not changing: `LoanCalculator`, `LiveCalculator`, `HomeDashboard`, `ApplicationsHistory`, `ProfileSettings`, `PrintVoucherModal`, landing files, `data/mockData.ts` (still used as the seed/default inputs for the public calculator).

---

### Task 1: Install dependencies and add env typing

**Files:**
- Modify: `package.json`
- Modify: `.env.example`
- Create: `src/vite-env.d.ts`

- [ ] **Step 1: Install packages**

Run:

```bash
npm install convex @clerk/clerk-react
```

Expected: `convex` and `@clerk/clerk-react` added to `dependencies`.

- [ ] **Step 2: Update `.env.example`**

Replace the file content with:

```bash
# Convex: printed by `npx convex dev` (e.g. https://happy-fox-123.convex.cloud)
VITE_CONVEX_URL="MY_CONVEX_URL"

# Clerk: Publishable Key from https://dashboard.clerk.com (pk_test_...)
VITE_CLERK_PUBLISHABLE_KEY="MY_CLERK_PUBLISHABLE_KEY"

# Convex dashboard -> Auth config -> Clerk JWT issuer domain (e.g. https://your-app.clerk.accounts.dev)
CLERK_JWT_ISSUER_DOMAIN="MY_CLERK_JWT_ISSUER_DOMAIN"

# AI Studio injects these at runtime from user secrets (unchanged)
GEMINI_API_KEY="MY_GEMINI_API_KEY"
APP_URL="MY_APP_URL"
```

- [ ] **Step 3: Create `src/vite-env.d.ts`**

```ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONVEX_URL: string;
  readonly VITE_CLERK_PUBLISHABLE_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

- [ ] **Step 4: Verify**

Run: `npm run lint` and `npm test`
Expected: typecheck passes (with `VITE_CONVEX_URL`/`VITE_CLERK_PUBLISHABLE_KEY` now typed); all existing 65 tests still pass.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json .env.example src/vite-env.d.ts
git commit -m "chore(deps): add convex and @clerk/clerk-react; type new env vars"
```

---

### Task 2: Convex schema and Clerk auth config

**Files:**
- Create: `convex/schema.ts`
- Create: `convex/auth.config.ts`

- [ ] **Step 1: Create `convex/schema.ts`**

```ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  members: defineTable({
    userId: v.string(),
    membershipNo: v.string(),
    fullName: v.string(),
    nationalId: v.string(),
    department: v.string(),
    jobTitle: v.string(),
    netSalary: v.number(),
    currentDeductions: v.number(),
    phone: v.string(),
    joinDate: v.string(),
    activeLoanCount: v.number(),
    totalLoansPaid: v.number(),
  })
    .index("by_userId", ["userId"])
    .index("by_membershipNo", ["membershipNo"]),

  loanRecords: defineTable({
    userId: v.string(),
    referenceNo: v.string(),
    date: v.string(),
    productName: v.string(),
    loanAmount: v.number(),
    netIncome: v.number(),
    durationYears: v.number(),
    monthlyInstallment: v.number(),
    totalWithInsurance: v.number(),
    status: v.union(
      v.literal("draft"),
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
    ),
    notes: v.optional(v.string()),
    resultSnapshot: v.optional(v.any()),
  })
    .index("by_userId", ["userId"])
    .index("by_referenceNo", ["referenceNo"]),
});
```

- [ ] **Step 2: Create `convex/auth.config.ts`**

```ts
import { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      // Convex dashboard -> Auth config -> "Clerk JWT issuer domain"
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
```

- [ ] **Step 3: Regenerate Convex types**

Run: `npx convex dev` (keep it running in a second terminal during development) — or `npx convex codegen` if the dev server is already running.
Expected: `convex/_generated/` is regenerated with `server.ts`, `api.ts`, `dataModel.ts` reflecting the new tables.

- [ ] **Step 4: Verify**

Run: `npm run lint`
Expected: no type errors (schema + auth.config compile; `convex/tsconfig.json` may be generated by the CLI — commit it if it appears).

- [ ] **Step 5: Commit**

```bash
git add convex/
git commit -m "feat(convex): schema for members and loanRecords with Clerk JWT auth config"
```

---

### Task 3: Shared auth guard helper

**Files:**
- Create: `convex/helpers.ts`

- [ ] **Step 1: Write the failing test**

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run convex/helpers.test.ts`
Expected: FAIL — module not found (`./helpers` does not exist).

- [ ] **Step 3: Write the implementation**

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run convex/helpers.test.ts`
Expected: PASS (both cases).

- [ ] **Step 5: Commit**

```bash
git add convex/helpers.ts convex/helpers.test.ts
git commit -m "feat(convex): shared requireUserId auth guard helper"
```

---

### Task 4: Convex members functions

**Files:**
- Create: `convex/members.ts`
- Create: `convex/members.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it, vi } from "vitest";
import {
  getMyProfileHandler,
  createOnSignupHandler,
  upsertMyProfileHandler,
} from "./members";
import { UNAUTHENTICATED } from "./helpers";
import { Doc } from "./_generated/dataModel";

type Row = Doc<"members"> & { _id: string };

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
      insert: async (_t: string, doc: Record<string, unknown>) => {
        const row = { _id: `mem_${rows.length + 1}`, ...doc } as Row;
        rows.push(row);
        return row._id;
      },
      patch: async () => {},
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run convex/members.test.ts`
Expected: FAIL — module `./members` does not exist.

- [ ] **Step 3: Write the implementation**

```ts
import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { requireUserId } from "./helpers";

const memberProfileFields = {
  membershipNo: v.string(),
  fullName: v.string(),
  nationalId: v.string(),
  department: v.string(),
  jobTitle: v.string(),
  netSalary: v.number(),
  currentDeductions: v.number(),
  phone: v.string(),
  joinDate: v.string(),
  activeLoanCount: v.number(),
  totalLoansPaid: v.number(),
};

export async function getMyProfileHandler(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return null;
  }
  return await ctx.db
    .query("members")
    .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
    .first();
}

export const getMyProfile = query({
  args: {},
  handler: getMyProfileHandler,
});

export async function createOnSignupHandler(
  ctx: MutationCtx,
  args: { profile: Record<string, unknown> },
) {
  const userId = await requireUserId(ctx);
  const existing = await ctx.db
    .query("members")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .first();
  if (existing) {
    return existing._id;
  }
  return await ctx.db.insert("members", { ...args.profile, userId });
}

export const createOnSignup = mutation({
  args: { profile: v.object(memberProfileFields) },
  handler: createOnSignupHandler,
});

export async function upsertMyProfileHandler(
  ctx: MutationCtx,
  args: { profile: Record<string, unknown> },
) {
  const userId = await requireUserId(ctx);
  const existing = await ctx.db
    .query("members")
    .withIndex("by_userId", (q) => q.eq("userId", userId))
    .first();
  if (existing) {
    await ctx.db.patch(existing._id, args.profile);
    return existing._id;
  }
  return await ctx.db.insert("members", { ...args.profile, userId });
}

export const upsertMyProfile = mutation({
  args: { profile: v.object(memberProfileFields) },
  handler: upsertMyProfileHandler,
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run convex/members.test.ts`
Expected: PASS (all cases).

- [ ] **Step 5: Commit**

```bash
git add convex/members.ts convex/members.test.ts
git commit -m "feat(convex): members profile query and mutations scoped to Clerk userId"
```

---

### Task 5: Convex loanRecords functions

**Files:**
- Create: `convex/loanRecords.ts`
- Create: `convex/loanRecords.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
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
      insert: async (_t: string, doc: Record<string, unknown>) => {
        const row = { _id: `rec_${rows.length + 1}`, ...doc } as Row;
        rows.push(row);
        return row._id;
      },
      patch: async () => {},
      delete: async () => {},
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run convex/loanRecords.test.ts`
Expected: FAIL — module `./loanRecords` does not exist.

- [ ] **Step 3: Write the implementation**

```ts
import { mutation, query, QueryCtx, MutationCtx } from "./_generated/server";
import { v } from "convex/values";
import { requireUserId } from "./helpers";

const recordFields = {
  referenceNo: v.string(),
  date: v.string(),
  productName: v.string(),
  loanAmount: v.number(),
  netIncome: v.number(),
  durationYears: v.number(),
  monthlyInstallment: v.number(),
  totalWithInsurance: v.number(),
  status: v.union(
    v.literal("draft"),
    v.literal("pending"),
    v.literal("approved"),
    v.literal("rejected"),
  ),
  notes: v.optional(v.string()),
  resultSnapshot: v.optional(v.any()),
};

export async function listMyHandler(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    return [];
  }
  return await ctx.db
    .query("loanRecords")
    .withIndex("by_userId", (q) => q.eq("userId", identity.subject))
    .collect();
}

export const listMy = query({
  args: {},
  handler: listMyHandler,
});

export async function createHandler(
  ctx: MutationCtx,
  args: { record: Record<string, unknown> },
) {
  const userId = await requireUserId(ctx);
  return await ctx.db.insert("loanRecords", { ...args.record, userId });
}

export const create = mutation({
  args: { record: v.object(recordFields) },
  handler: createHandler,
});

export async function updateStatusHandler(
  ctx: MutationCtx,
  args: { id: string; status: "draft" | "pending" | "approved" | "rejected" },
) {
  const userId = await requireUserId(ctx);
  const row = await ctx.db.get(args.id);
  if (row && row.userId === userId) {
    await ctx.db.patch(args.id, { status: args.status });
  }
}

export const updateStatus = mutation({
  args: {
    id: v.id("loanRecords"),
    status: v.union(
      v.literal("draft"),
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
    ),
  },
  handler: updateStatusHandler,
});

export async function deleteDraftHandler(ctx: MutationCtx, args: { id: string }) {
  const userId = await requireUserId(ctx);
  const row = await ctx.db.get(args.id);
  if (row && row.userId === userId && row.status === "draft") {
    await ctx.db.delete(args.id);
  }
}

export const deleteDraft = mutation({
  args: { id: v.id("loanRecords") },
  handler: deleteDraftHandler,
});
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run convex/loanRecords.test.ts`
Expected: PASS (all cases).

- [ ] **Step 5: Commit**

```bash
git add convex/loanRecords.ts convex/loanRecords.test.ts
git commit -m "feat(convex): loan records query and mutations scoped to Clerk userId"
```

---

### Task 6: Sign-in screen

**Files:**
- Create: `src/auth/SignInScreen.tsx`
- Create: `src/auth/SignInScreen.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SignInScreen from "./SignInScreen";

const openSignIn = vi.fn();
vi.mock("@clerk/clerk-react", () => ({
  useClerk: () => ({ openSignIn }),
}));

describe("SignInScreen", () => {
  it("prompts members to sign in and opens the Clerk modal", () => {
    render(<SignInScreen />);
    expect(screen.getByText(/تسجيل الدخول/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /تسجيل الدخول/i }));
    expect(openSignIn).toHaveBeenCalled();
  });

  it("offers a link back to the public landing", () => {
    render(<SignInScreen />);
    const link = screen.getByRole("link", { name: /الرئيسية/i });
    expect(link).toHaveAttribute("href", "/");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/auth/SignInScreen.test.tsx`
Expected: FAIL — module `./SignInScreen` does not exist.

- [ ] **Step 3: Write the implementation**

```tsx
import { useClerk } from "@clerk/clerk-react";

export default function SignInScreen() {
  const { openSignIn } = useClerk();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-canvas dark:bg-canvas-dark p-6 font-tajawal">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-primary dark:text-primary-soft mb-2">
          منطقة الأعضاء
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-300 max-w-md leading-relaxed">
          سجّل الدخول للوصول إلى الحاسبة الكاملة، سجلّاتك، وطلبات التمويل بالمرابحة.
        </p>
      </div>
      <button
        type="button"
        onClick={() => openSignIn()}
        className="bg-primary text-white px-8 py-3 rounded-lg font-bold text-base hover:bg-primary-hover transition-all active:scale-95 cursor-pointer"
      >
        تسجيل الدخول
      </button>
      <a href="/" className="text-sm text-gray-500 dark:text-gray-400 underline hover:text-primary transition-colors">
        العودة إلى الصفحة الرئيسية
      </a>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/auth/SignInScreen.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/auth/SignInScreen.tsx src/auth/SignInScreen.test.tsx
git commit -m "feat(auth): member sign-in screen opening the Clerk modal"
```

---

### Task 7: First-login sign-up form

**Files:**
- Create: `src/auth/SignUpForm.tsx`
- Create: `src/auth/SignUpForm.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import SignUpForm from "./SignUpForm";

const createOnSignup = vi.fn().mockResolvedValue("mem_1");
vi.mock("convex/react", () => ({
  useMutation: () => createOnSignup,
}));

describe("SignUpForm", () => {
  it("submits the profile to members.createOnSignup", async () => {
    const user = userEvent.setup();
    render(<SignUpForm />);
    await user.type(screen.getByLabelText(/الرقم العضوي/), "12345");
    await user.type(screen.getByLabelText(/الاسم الكامل/), "أحمد الشوابكة");
    await user.type(screen.getByLabelText(/الرقم الوطني/), "9851023456");
    await user.type(screen.getByLabelText(/المديرية\/الدائرة/), "الهندسة");
    await user.type(screen.getByLabelText(/المسمى الوظيفي/), "رئيس قسم");
    await user.clear(screen.getByLabelText(/صافي الراتب/));
    await user.type(screen.getByLabelText(/صافي الراتب/), "200");
    await user.type(screen.getByLabelText(/رقم الهاتف/), "0791234567");
    await user.click(screen.getByRole("button", { name: /إنشاء الملف/ }));

    expect(createOnSignup).toHaveBeenCalledWith({
      profile: expect.objectContaining({
        membershipNo: "12345",
        fullName: "أحمد الشوابكة",
        nationalId: "9851023456",
        netSalary: 200,
        phone: "0791234567",
      }),
    });
    await screen.findByText(/تم إنشاء ملفك بنجاح/i);
  });

  it("validates required fields before submitting", async () => {
    const user = userEvent.setup();
    render(<SignUpForm />);
    await user.click(screen.getByRole("button", { name: /إنشاء الملف/ }));
    expect(createOnSignup).not.toHaveBeenCalled();
    expect(screen.getAllByText(/مطلوب/).length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/auth/SignUpForm.test.tsx`
Expected: FAIL — module `./SignUpForm` does not exist.

- [ ] **Step 3: Write the implementation**

```tsx
import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";

const EMPTY = {
  membershipNo: "",
  fullName: "",
  nationalId: "",
  department: "",
  jobTitle: "",
  netSalary: "",
  currentDeductions: "0",
  phone: "",
  joinDate: new Date().toISOString().split("T")[0],
  activeLoanCount: 0,
  totalLoansPaid: 0,
};

export default function SignUpForm() {
  const createOnSignup = useMutation(api.members.createOnSignup);
  const [form, setForm] = useState({ ...EMPTY });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const required: (keyof typeof EMPTY)[] = [
    "membershipNo",
    "fullName",
    "nationalId",
    "department",
    "jobTitle",
    "netSalary",
    "phone",
  ];

  const set = (field: keyof typeof EMPTY, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    const missing: Record<string, boolean> = {};
    for (const key of required) {
      if (!String(form[key]).trim()) missing[key] = true;
    }
    setErrors(missing);
    if (Object.keys(missing).length > 0) return;

    setSubmitting(true);
    await createOnSignup({
      profile: {
        membershipNo: form.membershipNo.trim(),
        fullName: form.fullName.trim(),
        nationalId: form.nationalId.trim(),
        department: form.department.trim(),
        jobTitle: form.jobTitle.trim(),
        netSalary: Number(form.netSalary),
        currentDeductions: Number(form.currentDeductions || 0),
        phone: form.phone.trim(),
        joinDate: form.joinDate,
        activeLoanCount: 0,
        totalLoansPaid: 0,
      },
    });
    setSubmitting(false);
    setDone(true);
  };

  const inputCls =
    "w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary text-sm text-gray-900 dark:text-gray-100";

  const fields: { key: keyof typeof EMPTY; label: string; type?: string }[] = [
    { key: "membershipNo", label: "الرقم العضوي", type: "text" },
    { key: "fullName", label: "الاسم الكامل", type: "text" },
    { key: "nationalId", label: "الرقم الوطني", type: "text" },
    { key: "department", label: "المديرية/الدائرة", type: "text" },
    { key: "jobTitle", label: "المسمى الوظيفي", type: "text" },
    { key: "netSalary", label: "صافي الراتب (دينار)", type: "number" },
    { key: "phone", label: "رقم الهاتف", type: "text" },
  ];

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas dark:bg-canvas-dark p-6 font-tajawal">
        <div className="bg-white dark:bg-surface-dark p-8 rounded-xl border border-line dark:border-gray-800 shadow-sm text-center max-w-md">
          <p className="text-lg font-bold text-primary dark:text-primary-soft mb-1">
            تم إنشاء ملفك بنجاح
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            أهلاً بك في منطقة الأعضاء. يمكنك الآن بدء الحسابات وتقديم الطلبات.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-canvas dark:bg-canvas-dark flex items-center justify-center p-4 font-tajawal">
      <div className="w-full max-w-lg bg-white dark:bg-surface-dark rounded-xl border border-line dark:border-gray-800 shadow-sm p-6 sm:p-8">
        <h1 className="text-xl font-bold text-primary dark:text-primary-soft mb-1 text-center">
          أكمل ملفك العضوي
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mb-6">
          هذه المعلومات تُنشئ ملفك لدى الجمعية ويمكنك تعديلها لاحقاً.
        </p>
        <form
          className="flex flex-col gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit();
          }}
        >
          {fields.map(({ key, label, type }) => (
            <div key={key} className="flex flex-col gap-1.5">
              <label htmlFor={`signup-${key}`} className="text-xs font-bold text-gray-700 dark:text-gray-300 text-right">
                {label}
              </label>
              <input
                id={`signup-${key}`}
                type={type ?? "text"}
                value={String(form[key])}
                onChange={(e) => set(key, e.target.value)}
                className={inputCls}
                dir={type === "number" ? "ltr" : undefined}
              />
              {errors[key] && (
                <span className="text-xs text-rose-600 dark:text-rose-400">هذا الحقل مطلوب</span>
              )}
            </div>
          ))}
          <button
            type="submit"
            disabled={submitting}
            className="mt-2 bg-primary text-white py-3 rounded-lg font-bold text-base hover:bg-primary-hover transition-all active:scale-95 cursor-pointer disabled:opacity-60"
          >
            {submitting ? "جارٍ الإنشاء..." : "إنشاء الملف"}
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/auth/SignUpForm.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/auth/SignUpForm.tsx src/auth/SignUpForm.test.tsx
git commit -m "feat(auth): first-login member sign-up form backed by members.createOnSignup"
```

---

### Task 8: AuthGate

**Files:**
- Create: `src/auth/AuthGate.tsx`
- Create: `src/auth/AuthGate.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import AuthGate from "./AuthGate";

const mocks = vi.hoisted(() => ({
  isLoaded: true,
  isSignedIn: true,
  profile: { _id: "mem_1", userId: "user_1" },
}));

vi.mock("@clerk/clerk-react", () => ({
  useAuth: () => ({ isLoaded: mocks.isLoaded, isSignedIn: mocks.isSignedIn }),
}));

vi.mock("convex/react", () => ({
  useQuery: () => mocks.profile,
}));

vi.mock("./SignInScreen", () => ({
  default: () => <div data-testid="sign-in-screen" />,
}));

vi.mock("./SignUpForm", () => ({
  default: () => <div data-testid="sign-up-form" />,
}));

describe("AuthGate", () => {
  beforeEach(() => {
    mocks.isLoaded = true;
    mocks.isSignedIn = true;
    mocks.profile = { _id: "mem_1", userId: "user_1" };
  });

  it("shows a loading screen while Clerk is not loaded", () => {
    mocks.isLoaded = false;
    render(
      <AuthGate>
        <div data-testid="member-app" />
      </AuthGate>,
    );
    expect(screen.getByText(/جارٍ التحميل/)).toBeInTheDocument();
    expect(screen.queryByTestId("member-app")).not.toBeInTheDocument();
  });

  it("shows the sign-in screen when signed out", () => {
    mocks.isSignedIn = false;
    render(
      <AuthGate>
        <div data-testid="member-app" />
      </AuthGate>,
    );
    expect(screen.getByTestId("sign-in-screen")).toBeInTheDocument();
  });

  it("shows the sign-up form on first login (no profile row yet)", () => {
    mocks.profile = null;
    render(
      <AuthGate>
        <div data-testid="member-app" />
      </AuthGate>,
    );
    expect(screen.getByTestId("sign-up-form")).toBeInTheDocument();
  });

  it("renders the member app when signed in with a profile", () => {
    render(
      <AuthGate>
        <div data-testid="member-app" />
      </AuthGate>,
    );
    expect(screen.getByTestId("member-app")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/auth/AuthGate.test.tsx`
Expected: FAIL — module `./AuthGate` does not exist.

- [ ] **Step 3: Write the implementation**

```tsx
import { ReactNode } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import SignInScreen from "./SignInScreen";
import SignUpForm from "./SignUpForm";

export default function AuthGate({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const profile = useQuery(api.members.getMyProfile);

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas dark:bg-canvas-dark font-tajawal">
        <p className="text-sm text-gray-600 dark:text-gray-300">جارٍ التحميل...</p>
      </div>
    );
  }

  if (!isSignedIn) {
    return <SignInScreen />;
  }

  if (profile === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas dark:bg-canvas-dark font-tajawal">
        <p className="text-sm text-gray-600 dark:text-gray-300">جارٍ تحميل بياناتك...</p>
      </div>
    );
  }

  if (profile === null) {
    return <SignUpForm />;
  }

  return <>{children}</>;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/auth/AuthGate.test.tsx`
Expected: PASS (all four states).

- [ ] **Step 5: Commit**

```bash
git add src/auth/AuthGate.tsx src/auth/AuthGate.test.tsx
git commit -m "feat(auth): AuthGate gates the member area behind Clerk + profile row"
```

---

### Task 9: Wire providers into main.tsx

**Files:**
- Modify: `src/main.tsx`

- [ ] **Step 1: Update `src/main.tsx`**

Replace the whole file:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider, useAuth } from '@clerk/clerk-react';
import { ConvexReactClient } from 'convex/react';
import { ConvexProviderWithClerk } from 'convex/react-clerk';
import LandingGate from './landing/LandingGate.tsx';
import './index.css';

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <LandingGate />
      </ConvexProviderWithClerk>
    </ClerkProvider>
  </StrictMode>,
);
```

- [ ] **Step 2: Verify**

Run: `npm run lint`
Expected: no type errors.

- [ ] **Step 3: Commit**

```bash
git add src/main.tsx
git commit -m "feat(auth): wrap app in ClerkProvider and ConvexProviderWithClerk"
```

---

### Task 10: Guard the #app surface in LandingGate

**Files:**
- Modify: `src/landing/LandingGate.tsx`
- Modify: `src/landing/LandingGate.test.tsx`

- [ ] **Step 1: Update `src/landing/LandingGate.tsx`**

Replace the whole file:

```tsx
import { useCallback, useEffect, useState } from 'react';
import App from '../App';
import AuthGate from '../auth/AuthGate';
import LandingPage from './LandingPage';

const APP_HASH = '#app';

/**
 * Single-HTML-entry gate: the landing page renders at `/`, and the member app
 * mounts at the `#app` hash route behind the Clerk/Convex AuthGate. Switching
 * hashes swaps surfaces and resets scroll.
 */
export default function LandingGate() {
  const [isApp, setIsApp] = useState(() => window.location.hash === APP_HASH);

  useEffect(() => {
    const onHashChange = () => {
      setIsApp(window.location.hash === APP_HASH);
      window.scrollTo(0, 0);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const launchApp = useCallback(() => {
    window.location.hash = APP_HASH;
  }, []);

  if (isApp) {
    return (
      <AuthGate>
        <App />
      </AuthGate>
    );
  }
  return <LandingPage onLaunchApp={launchApp} />;
}
```

- [ ] **Step 2: Rewrite `src/landing/LandingGate.test.tsx`**

```tsx
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LandingGate from './LandingGate';

vi.mock('../auth/AuthGate', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="auth-gate">{children}</div>
  ),
}));

vi.mock('convex/react', () => ({
  useQuery: () => ({ _id: 'mem_1', userId: 'user_1' }),
  useMutation: () => vi.fn(),
}));

const matchMediaMock = (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
});

beforeEach(() => {
  localStorage.clear();
  document.documentElement.className = '';
  window.location.hash = '';
  vi.stubGlobal('matchMedia', matchMediaMock);
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
});

afterEach(() => {
  window.location.hash = '';
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('LandingGate', () => {
  it('renders the landing page by default', () => {
    render(<LandingGate />);
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('mounts the member app through the AuthGate when the hash is #app', async () => {
    render(<LandingGate />);
    window.location.hash = '#app';
    await waitFor(() => expect(screen.getByTestId('auth-gate')).toBeInTheDocument());
    expect(screen.getByText(/نسبة الربح المعتمدة/)).toBeInTheDocument();
  });

  it('launches the app from the top-bar CTA through the AuthGate', async () => {
    render(<LandingGate />);
    fireEvent.click(screen.getByRole('button', { name: 'افتح الحاسبة' }));
    await waitFor(() => expect(screen.getByTestId('auth-gate')).toBeInTheDocument());
  });

  it('returns to the landing when the hash is cleared', async () => {
    render(<LandingGate />);
    window.location.hash = '#app';
    await waitFor(() => expect(screen.getByTestId('auth-gate')).toBeInTheDocument());

    window.location.hash = '';
    await waitFor(() => expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument());
  });
});
```

Note: `App` also calls Convex hooks, which the `convex/react` mock above satisfies (`useQuery` returns a fake profile, `useMutation` a no-op).

- [ ] **Step 3: Run tests to verify**

Run: `npx vitest run src/landing/LandingGate.test.tsx`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/landing/LandingGate.tsx src/landing/LandingGate.test.tsx
git commit -m "feat(auth): route the #app surface through AuthGate"
```

---

### Task 11: Move App.tsx data to Convex

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`

- [ ] **Step 1: Rewrite the data layer in `src/App.tsx`**

Replace the imports and the state/persistence block (lines 6–17, 19–42, 44–88) as follows.

Imports — remove `INITIAL_MEMBER_PROFILE`, `INITIAL_LOAN_RECORDS`, and the `loadState`/`saveState`/`loadRawState` helpers; add Convex hooks:

```tsx
import { useMutation, useQuery } from 'convex/react';
import { api } from '../convex/_generated/api';
```

Replace the `darkMode` init and the three `useState` blocks:

```tsx
export default function App() {
  const [activeTab, setActiveTab] = useState<string>('calculator');
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const stored = (() => {
      try {
        return localStorage.getItem('mmf-dark-mode');
      } catch {
        return null;
      }
    })();
    return stored !== null
      ? stored === 'true'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const profile = useQuery(api.members.getMyProfile) ?? null;
  const records = useQuery(api.loanRecords.listMy) ?? [];

  const createRecord = useMutation(api.loanRecords.create);
  const updateRecordStatus = useMutation(api.loanRecords.updateStatus);
  const deleteRecord = useMutation(api.loanRecords.deleteDraft);
  const upsertProfile = useMutation(api.members.upsertMyProfile);

  // Selected record for direct printing modal
  const [printModalRecord, setPrintModalRecord] = useState<LoanRecord | null>(null);

  // Synchronize dark mode class on HTML root and persist it (local preference only)
  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    try {
      localStorage.setItem('mmf-dark-mode', String(darkMode));
    } catch {
      /* storage blocked — fail silently */
    }
  }, [darkMode]);

  const handleSaveRecord = async (newRecord: LoanRecord) => {
    await createRecord({
      record: {
        referenceNo: newRecord.referenceNo,
        date: newRecord.date,
        productName: newRecord.productName,
        loanAmount: newRecord.loanAmount,
        netIncome: newRecord.netIncome,
        durationYears: newRecord.durationYears,
        monthlyInstallment: newRecord.monthlyInstallment,
        totalWithInsurance: newRecord.totalWithInsurance,
        status: newRecord.status,
        notes: newRecord.notes,
        resultSnapshot: newRecord.resultSnapshot,
      },
    });
  };

  const handleDeleteRecord = async (id: string) => {
    await deleteRecord({ id });
  };

  const handleUpdateProfile = async (updatedProfile: MemberProfile) => {
    await upsertProfile({
      profile: {
        membershipNo: updatedProfile.membershipNo,
        fullName: updatedProfile.fullName,
        nationalId: updatedProfile.nationalId,
        department: updatedProfile.department,
        jobTitle: updatedProfile.jobTitle,
        netSalary: updatedProfile.netSalary,
        currentDeductions: updatedProfile.currentDeductions,
        phone: updatedProfile.phone,
        joinDate: updatedProfile.joinDate,
        activeLoanCount: updatedProfile.activeLoanCount,
        totalLoansPaid: updatedProfile.totalLoansPaid,
      },
    });
  };
```

Remove the two persistence `useEffect`s for profile/records (they no longer exist). The rest of `App.tsx` (JSX, handlers wiring, print modal) is unchanged — `profile` and `records` are still passed down to the same components.

- [ ] **Step 2: Run the existing App tests to see the expected failures**

Run: `npx vitest run src/App.test.tsx`
Expected: FAIL — tests still reference localStorage-driven behavior and real `App` now needs Convex/Clerk context.

- [ ] **Step 3: Rewrite `src/App.test.tsx`**

```tsx
import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';
import type { CalculationResult, LoanRecord, MemberProfile } from './types';

const mocks = vi.hoisted(() => ({
  profile: {
    id: 'mem_1',
    membershipNo: '12345',
    fullName: 'أحمد محمود الشوابكة',
    nationalId: '9851023456',
    department: 'مديرية الهندسة والمشاريع',
    jobTitle: 'رئيس قسم التخطيط العمراني',
    netSalary: 200,
    currentDeductions: 0,
    phone: '0791234567',
    joinDate: '2018-04-15',
    activeLoanCount: 1,
    totalLoansPaid: 3,
  } satisfies MemberProfile,
  records: [] as LoanRecord[],
}));

const mutations = vi.hoisted(() => ({
  createRecord: vi.fn().mockResolvedValue('rec_1'),
  updateRecordStatus: vi.fn().mockResolvedValue(undefined),
  deleteRecord: vi.fn().mockResolvedValue(undefined),
  upsertProfile: vi.fn().mockResolvedValue('mem_1'),
}));

vi.mock('convex/react', () => ({
  useQuery: () => mocks.profile,
  useMutation: () => vi.fn(),
}));

const matchMediaMock = (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
});

beforeEach(() => {
  localStorage.clear();
  document.documentElement.className = '';
  vi.stubGlobal('matchMedia', matchMediaMock);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('App dark mode and Convex-backed data', () => {
  it('renders the calculator with the profile from Convex', () => {
    render(<App />);
    expect(screen.getAllByText(mocks.profile.fullName).length).toBeGreaterThan(0);
    expect(screen.getByText(/نسبة الربح المعتمدة/)).toBeInTheDocument();
  });

  it('initializes dark mode from the stored raw string', () => {
    localStorage.setItem('mmf-dark-mode', 'true');
    const first = render(<App />);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    first.unmount();

    localStorage.setItem('mmf-dark-mode', 'false');
    render(<App />);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('toggles dark mode and persists the raw boolean strings', async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(localStorage.getItem('mmf-dark-mode')).toBe('false');

    await user.click(screen.getByRole('button', { name: 'تغيير المظهر' }));
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('mmf-dark-mode')).toBe('true');

    await user.click(screen.getByRole('button', { name: 'تغيير المظهر' }));
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('mmf-dark-mode')).toBe('false');
  });

  it('opens the print modal for a saved record using its stored result snapshot', async () => {
    mocks.records = [
      {
        id: 'rec_9000',
        referenceNo: 'MDB-2026-7777',
        date: '2026-08-01',
        productName: 'مرابحة الأجهزة الكهربائية والإلكترونية',
        loanAmount: 500,
        netIncome: 200,
        durationYears: 1,
        monthlyInstallment: 48.16,
        totalWithInsurance: 577.88,
        status: 'draft',
        resultSnapshot: {
          netFinancing: 500,
          profitRate: 42,
          annualProfit: 0,
          totalProfit: 0,
          totalPayable: 0,
          annualInsurance: 0,
          totalInsurance: 0,
          totalWithInsurance: 0,
          monthlyInstallment: 123.45,
          maxInstallment: 80,
          isEligible: true,
          dtiPercentage: 0,
        } satisfies CalculationResult,
      },
    ];

    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole('button', { name: 'السجلات' }));
    await user.click(screen.getByRole('button', { name: 'طباعة' }));

    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/MDB-2026-7777/)).toBeInTheDocument();
    expect(within(dialog).getByText('42%')).toBeInTheDocument();
    expect(within(dialog).getByText(/123.45/)).toBeInTheDocument();

    fireKeyEscape();
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});

function fireKeyEscape() {
  const { fireEvent } = require('@testing-library/react');
  fireEvent.keyDown(window, { key: 'Escape' });
}
```

Adjust `useMutation` in the mock to dispatch by name so `handleSaveRecord` etc. exercise real calls:

```tsx
vi.mock('convex/react', () => ({
  useQuery: () => mocks.profile,
  useMutation: (name: string) => {
    if (name === 'loanRecords:create') return mutations.createRecord;
    if (name === 'loanRecords:updateStatus') return mutations.updateRecordStatus;
    if (name === 'loanRecords:deleteDraft') return mutations.deleteRecord;
    return mutations.upsertProfile;
  },
}));
```

- [ ] **Step 4: Run tests to verify**

Run: `npx vitest run src/App.test.tsx`
Expected: PASS (dark mode + render + print paths).

- [ ] **Step 5: Run the full suite**

Run: `npm test`
Expected: all tests pass. Fix any component tests that relied on `App`'s old localStorage state shape.

- [ ] **Step 6: Commit**

```bash
git add src/App.tsx src/App.test.tsx
git commit -m "feat(convex): back member app data with Convex queries and mutations"
```

---

### Task 12: Version bump and docs

**Files:**
- Modify: `VERSION`
- Modify: `CHANGELOG.md`
- Modify: `PRODUCT.md`
- Modify: `TODOS.md`

- [ ] **Step 1: Bump `VERSION`**

Write `0.3.0.0` (overwrite).

- [ ] **Step 2: Add a `CHANGELOG.md` entry**

Insert at the top (under `# Changelog`):

```markdown
## [0.3.0.0] - 2026-08-09

### Added

- Member identity via Clerk: the member area at `#app` now requires sign-in, with a first-login sign-up form that creates the member's profile row.
- A Convex backend with `members` and `loanRecords` tables, each scoped by the signed-in member's Clerk user id (`ctx.auth.getUserIdentity().subject`).
- Serverless functions: profile query/upsert/sign-up, and loan-record list/create/status-update/delete-draft, all guarded against unauthenticated callers.
- `.env` wiring for `VITE_CONVEX_URL`, `VITE_CLERK_PUBLISHABLE_KEY`, `CLERK_JWT_ISSUER_DOMAIN`, with typed `ImportMetaEnv`.

### Changed

- `main.tsx` wraps the app in `ClerkProvider` + `ConvexProviderWithClerk`.
- The `#app` surface is routed through an `AuthGate` (loading → sign-in → sign-up → app).
- Member profile and loan records are read from and written to Convex instead of `localStorage`; only the dark-mode preference stays local.
- The landing page and its public calculator remain open to everyone.
```

- [ ] **Step 3: Update `PRODUCT.md`**

Add/update a "Backend & Auth" section:

```markdown
## Backend & Auth

- **Identity:** Clerk — the member area requires sign-in; first login prompts a profile sign-up form.
- **Data:** Convex — `members` and `loanRecords` tables scoped to the Clerk user id.
- **Public surface:** the landing page and its live Murabaha calculator need no account.
```

- [ ] **Step 4: Update `TODOS.md`**

Mark the Convex + Clerk backend as done in the current milestone; add a future item: "Admin/association review role to approve or reject applications (status pending → approved/rejected)."

- [ ] **Step 5: Verify**

Run: `npm run lint` and `npm test`
Expected: typecheck clean; full suite green.

- [ ] **Step 6: Commit**

```bash
git add VERSION CHANGELOG.md PRODUCT.md TODOS.md
git commit -m "chore: bump to 0.3.0.0 with Convex + Clerk backend notes"
```

---

### Task 13: Final verification

- [ ] **Step 1: Full build**

Run: `npm run build`
Expected: production build succeeds.

- [ ] **Step 2: Typecheck**

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 3: Full test suite + coverage**

Run: `npm test` and `npx vitest run --coverage`
Expected: all tests pass; coverage at or above the previous baseline (92.28% stmts).

- [ ] **Step 4: Manual smoke (needs real Convex + Clerk projects)**

Run: `npm run dev`
Expected:
- `/` shows the landing; calculator works without login.
- Clicking "افتح الحاسبة" opens the sign-in screen when signed out.
- After Clerk sign-in, the sign-up form appears; submitting creates the member row.
- The member app shows the signed-in member's profile and records; saving/submitting a calculation persists to Convex and survives a reload.

---

## Self-Review

**Spec coverage:**
- Public calc + landing stay open → Tasks 9–10 (providers + AuthGate only guard `#app`); Task 12 changelog.
- Everything else (member area) behind Clerk → Tasks 6–8 (`SignInScreen`, `SignUpForm`, `AuthGate`), Task 10.
- Profile + loan records in Convex → Tasks 4–5 (functions), Task 11 (`App.tsx`).
- Members only, no admin role → explicitly out of scope in design + TODOS future item.
- Onboarding = sign-up form on first login → Task 7.
- Same PR #1, no new PR, v0.3.0.0 → Task 12.

**Placeholder scan:** no TBD/TODO in code steps; every code step contains full code; every mutation/query has a matching test.

**Type consistency:**
- Convex function names referenced by components match the definitions: `api.members.getMyProfile`, `api.members.createOnSignup`, `api.members.upsertMyProfile`, `api.loanRecords.listMy`, `api.loanRecords.create`, `api.loanRecords.updateStatus`, `api.loanRecords.deleteDraft`.
- `useMutation` dispatch names in `App.test.tsx` follow Convex's generated `functionReference` id format (`table:functionName`); verify against the generated `_generated/api.ts` and adjust the mock matcher if the id format differs (it includes the `table:` prefix for table functions).
- `LoanRecord.id` is not part of the Convex payload (Convex uses `_id`); the create mutation strips it in `App.tsx`.
