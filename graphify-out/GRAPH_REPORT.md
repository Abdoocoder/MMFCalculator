# Graph Report - .  (2026-08-14)

## Corpus Check
- Corpus is ~28,013 words - fits in a single context window. You may not need a graph.

## Summary
- 417 nodes · 657 edges · 28 communities (21 shown, 7 thin omitted)
- Extraction: 93% EXTRACTED · 6% INFERRED · 0% AMBIGUOUS · INFERRED: 42 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Member App Screens|Member App Screens]]
- [[_COMMUNITY_Product History & Design Docs|Product History & Design Docs]]
- [[_COMMUNITY_Convex Mutation Handlers|Convex Mutation Handlers]]
- [[_COMMUNITY_Convex Data Model & Auth|Convex Data Model & Auth]]
- [[_COMMUNITY_Public Landing Experience|Public Landing Experience]]
- [[_COMMUNITY_Ledger Bookkeeping Logic|Ledger Bookkeeping Logic]]
- [[_COMMUNITY_Dependency & Tooling Stack|Dependency & Tooling Stack]]
- [[_COMMUNITY_Auth Screens & Gate|Auth Screens & Gate]]
- [[_COMMUNITY_Star Field Geometry|Star Field Geometry]]
- [[_COMMUNITY_TypeScript Compiler Config|TypeScript Compiler Config]]
- [[_COMMUNITY_Print Voucher Modal|Print Voucher Modal]]
- [[_COMMUNITY_Convex Schema Types|Convex Schema Types]]
- [[_COMMUNITY_Convex Context Types|Convex Context Types]]
- [[_COMMUNITY_App Metadata & Permissions|App Metadata & Permissions]]
- [[_COMMUNITY_Testing & CI Conventions|Testing & CI Conventions]]
- [[_COMMUNITY_Build & Module Config|Build & Module Config]]
- [[_COMMUNITY_Vite Env Types|Vite Env Types]]
- [[_COMMUNITY_Member Profile Validator|Member Profile Validator]]
- [[_COMMUNITY_Convex Server Builders|Convex Server Builders]]
- [[_COMMUNITY_QueryMutation Contexts|Query/Mutation Contexts]]
- [[_COMMUNITY_Convex API Utility|Convex API Utility]]
- [[_COMMUNITY_Loan Product Type|Loan Product Type]]
- [[_COMMUNITY_Calculation Input Type|Calculation Input Type]]

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 16 edges
2. `CalculationInput` - 15 edges
3. `LOAN_PRODUCTS` - 15 edges
4. `calculateLoan()` - 14 edges
5. `MemberProfile` - 13 edges
6. `LandingPage` - 13 edges
7. `formatJODNumber()` - 12 edges
8. `LoanCalculator()` - 10 edges
9. `requireUserId()` - 9 edges
10. `LoanRecord` - 9 edges

## Surprising Connections (you probably didn't know these)
- `LoanRecord` --semantically_similar_to--> `LoanRecordInput type`  [INFERRED] [semantically similar]
  src/types.ts → convex/loanRecords.ts
- `MemberProfile` --semantically_similar_to--> `MemberProfileInput type`  [INFERRED] [semantically similar]
  src/types.ts → convex/members.ts
- `loadState shape validation (P2)` --semantically_similar_to--> `localStorage offline mirror`  [INFERRED] [semantically similar]
  TODOS.md → docs/superpowers/specs/2026-08-09-convex-clerk-frontend-migration-design.md
- `Draft-only delete semantics` --semantically_similar_to--> `Admin/association review role (P2)`  [INFERRED] [semantically similar]
  docs/superpowers/specs/2026-08-09-convex-clerk-frontend-migration-design.md → TODOS.md
- `Public Calculator Surface Design` --references--> `v0.3.0.0 — Convex + Clerk backend`  [AMBIGUOUS]
  docs/superpowers/specs/2026-08-09-public-calculator-surface-design.md → CHANGELOG.md

## Hyperedges (group relationships)
- **Loan record lifecycle (create, list, update status, delete draft)** — schema_loanrecords, loanrecords_listmy, loanrecords_create, loanrecords_updatestatus, loanrecords_deletedraft, schema_statusunion [INFERRED 0.85]
- **Member profile management (get, create on signup, upsert)** — schema_members, members_getmyprofile, members_createonsignup, members_upsertmyprofile [INFERRED 0.85]
- **Clerk identity scoping for Convex mutations** — authconfig_authconfig, helpers_requireuserid, helpers_unauthenticated, loanrecords_createhandler, members_upsertmyprofilehandler [INFERRED 0.85]
- **Single-Entry Hash-Gated Landing Flow** — landing_landinggate, landing_landinggate_apphash, landing_landingpage, src_app [EXTRACTED 1.00]
- **Star Certification Notation Visual Language** — landing_star_eightpointstarpath, landing_starfield_starseal, landing_starfield_starfield, landing_livecalculator, landing_ledgersection, landing_landingpage [INFERRED 0.85]
- **Live Loan Calculation Data Flow** — landing_landingpage, landing_livecalculator, landing_ledgersection, utils_loancalculator_calculateloan, landing_ledger_buildledger [INFERRED 0.85]
- **Loan Application Lifecycle** — components_loancalculator_loancalculator, components_printvouchermodal_printvouchermodal, components_applicationshistory_applicationshistory, utils_loancalculator_calculateloan [INFERRED 0.85]
- **Member Authentication and Onboarding** — auth_authgate_authgate, auth_signinscreen_signinscreen, auth_signupform_signupform [EXTRACTED 0.95]
- **Member App Navigation Shell** — components_homedashboard_homedashboard, components_sidebar_sidebar, components_bottomnav_bottomnav, components_header_header [INFERRED 0.75]
- **Convex + Clerk authenticated member backend** — specs_2026_08_09_convex_clerk_backend_design_members_table, specs_2026_08_09_convex_clerk_backend_design_loanrecords_table, specs_2026_08_09_convex_clerk_backend_design_convex_functions, specs_2026_08_09_convex_clerk_backend_design_requireuserid, specs_2026_08_09_convex_clerk_backend_design_authgate, specs_2026_08_09_convex_clerk_backend_design_signinscreen, specs_2026_08_09_convex_clerk_backend_design_signupform, specs_2026_08_09_convex_clerk_backend_design_provider_wiring, specs_2026_08_09_convex_clerk_backend_design_convex_auth_config [EXTRACTED 1.00]
- **Two-surface public calculator vs member app split** — product_public_vs_member_surfaces, specs_2026_08_09_public_calculator_surface_design_publiccalculatorpage, specs_2026_08_09_public_calculator_surface_design_landinggate, index_html, specs_2026_08_09_convex_clerk_backend_design_authgate [EXTRACTED 1.00]
- **Member-data frontend migration data flow** — specs_2026_08_09_convex_clerk_frontend_migration_design_usememberdata, specs_2026_08_09_convex_clerk_frontend_migration_design_convexadapters, specs_2026_08_09_convex_clerk_frontend_migration_design_offline_mirror, specs_2026_08_09_convex_clerk_backend_design_convex_functions [EXTRACTED 1.00]

## Communities (28 total, 7 thin omitted)

### Community 0 - "Member App Screens"
Cohesion: 0.06
Nodes (49): SignUpForm(), SignUpForm Test Suite, ApplicationsHistory(), ApplicationsHistoryProps, onDeleteRecord, onPrintRecord, records, search (+41 more)

### Community 1 - "Product History & Design Docs"
Cohesion: 0.06
Nodes (46): Changelog, v0.1.0.0 — persistence, design tokens, strict TS, CI, v0.2.0.0 — Financing Notation landing, v0.3.0.0 — Convex + Clerk backend, Landing HTML Entry, Convex Backend + Clerk Auth Implementation Plan, Product Overview, Greater Madaba Municipality Employees Association (+38 more)

### Community 2 - "Convex Mutation Handlers"
Cohesion: 0.07
Nodes (34): requireUserId(), ctx, UNAUTHENTICATED, create, createHandler(), deleteDraft, deleteDraftHandler(), listMy (+26 more)

### Community 3 - "Convex Data Model & Auth"
Cohesion: 0.09
Nodes (38): App tests, Convex Clerk JWT auth config, DataModel type, Doc type, Id type, requireUserId, UNAUTHENTICATED ConvexError, helpers tests (+30 more)

### Community 4 - "Public Landing Experience"
Cohesion: 0.08
Nodes (30): ASSOCIATION_ANNOUNCEMENTS, INITIAL_LOAN_RECORDS, LandingGate, APP_HASH Constant, launchApp Callback, LandingGate Tests, LandingPage, DEFAULT_INPUT (+22 more)

### Community 5 - "Ledger Bookkeeping Logic"
Cohesion: 0.09
Nodes (28): buildLedger(), formatJOD(), LedgerBook, LedgerLine, ledger Tests, book, inconsistent, input (+20 more)

### Community 6 - "Dependency & Tooling Stack"
Cohesion: 0.06
Nodes (32): dependencies, @clerk/clerk-react, convex, lucide-react, react, react-dom, @tailwindcss/vite, vite (+24 more)

### Community 7 - "Auth Screens & Gate"
Cohesion: 0.09
Nodes (13): AuthGate(), mocks, AuthGate Test Suite, SignInScreen(), link, openSignIn, SignInScreen Test Suite, EMPTY (+5 more)

### Community 8 - "Star Field Geometry"
Cohesion: 0.17
Nodes (18): eightPointStarPath(), StarGeometry, starLatticeDataUri(), starTilePath(), _, corners, cornerSubpaths, decoded (+10 more)

### Community 9 - "TypeScript Compiler Config"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, allowJs, experimentalDecorators, isolatedModules, jsx, lib, module (+9 more)

### Community 10 - "Print Voucher Modal"
Cohesion: 0.13
Nodes (12): buttons, dialog, first, input, printSpy, profile, { props }, { props, utils } (+4 more)

### Community 11 - "Convex Schema Types"
Cohesion: 0.33
Nodes (4): DataModel, Doc, Id, TableNames

### Community 12 - "Convex Context Types"
Cohesion: 0.33
Nodes (5): ActionCtx, DatabaseReader, DatabaseWriter, MutationCtx, QueryCtx

### Community 13 - "App Metadata & Permissions"
Cohesion: 0.40
Nodes (4): description, majorCapabilities, name, requestFramePermissions

### Community 14 - "Testing & CI Conventions"
Cohesion: 0.60
Nodes (5): Agent Conventions (AGENTS.md), Testing Guide (TESTING.md), Unit/integration/smoke/E2E test layers, 100% coverage vibe-coding safety, CI Test Workflow

### Community 15 - "Build & Module Config"
Cohesion: 0.40
Nodes (4): MMFCalculator app metadata, package.json (project manifest), @/* path alias, HMR disabled during agent edits

## Ambiguous Edges - Review These
- `Public Calculator Surface Design` → `v0.3.0.0 — Convex + Clerk backend`  [AMBIGUOUS]
  docs/superpowers/specs/2026-08-09-public-calculator-surface-design.md · relation: references

## Knowledge Gaps
- **203 isolated node(s):** `target`, `experimentalDecorators`, `useDefineForClassFields`, `module`, `lib` (+198 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **7 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `Public Calculator Surface Design` and `v0.3.0.0 — Convex + Clerk backend`?**
  _Edge tagged AMBIGUOUS (relation: references) - confidence is low._
- **Why does `CalculationInput` connect `Ledger Bookkeeping Logic` to `Member App Screens`, `Print Voucher Modal`, `Public Landing Experience`?**
  _High betweenness centrality (0.024) - this node is a cross-community bridge._
- **Why does `LandingPage` connect `Public Landing Experience` to `Star Field Geometry`, `Ledger Bookkeeping Logic`?**
  _High betweenness centrality (0.018) - this node is a cross-community bridge._
- **Why does `LOAN_PRODUCTS` connect `Public Landing Experience` to `Member App Screens`, `Ledger Bookkeeping Logic`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `LOAN_PRODUCTS` (e.g. with `INITIAL_LOAN_RECORDS` and `ASSOCIATION_ANNOUNCEMENTS`) actually correct?**
  _`LOAN_PRODUCTS` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `target`, `experimentalDecorators`, `useDefineForClassFields` to the rest of the system?**
  _206 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Member App Screens` be split into smaller, more focused modules?**
  _Cohesion score 0.06233538191395961 - nodes in this community are weakly interconnected._