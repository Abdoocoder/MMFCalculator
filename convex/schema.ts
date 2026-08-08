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
