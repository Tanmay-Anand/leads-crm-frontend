import { describe, expect, it } from "vitest"

import { checkPermission, grants } from "./permission-policy"

/**
 * `grants()`'s hierarchy truth table - none of this is reachable by clicking through the UI, and
 * every reference bug this port fixes (the null-sentinel confusion, the async-`some` guard) lives
 * in exactly this layer of "does this permission set satisfy this requirement" logic.
 */
describe("grants", () => {
  it("denies a parent resource from only a child permission", () => {
    expect(grants(["view:master-data/tags"], "view:master-data")).toBe(false)
  })

  it("lets a bare parent permission wildcard any child resource", () => {
    expect(grants(["view:master-data"], "view:master-data/lead-statuses")).toBe(true)
  })

  it("denies a sibling child even when the parent is held for a different action", () => {
    expect(grants(["view:master-data", "update:master-data/tags"], "update:master-data/lead-statuses")).toBe(false)
  })

  it("allows an exact match on a top-level, non-nested resource", () => {
    expect(grants(["view:leads"], "view:leads")).toBe(true)
  })

  it("denies when nothing in the set relates to the requirement", () => {
    expect(grants(["view:projects"], "view:leads")).toBe(false)
  })
})

describe("checkPermission", () => {
  it("denies while loading, regardless of what permissions eventually turn out to be", () => {
    expect(checkPermission({ status: "loading" }, "view", "leads")).toBe(false)
  })

  it("denies when unauthenticated", () => {
    expect(checkPermission({ status: "unauthenticated" }, "view", "leads")).toBe(false)
  })

  it("allows everything when unrestricted, without consulting a permission list", () => {
    expect(checkPermission({ status: "unrestricted" }, "delete", "roles")).toBe(true)
  })

  it("denies an action whose required view prerequisite is absent", () => {
    const state = { status: "restricted" as const, permissions: ["update:leads"] }
    expect(checkPermission(state, "update", "leads")).toBe(false)
  })

  it("allows an action once both it and its view prerequisite are held", () => {
    const state = { status: "restricted" as const, permissions: ["view:leads", "update:leads"] }
    expect(checkPermission(state, "update", "leads")).toBe(true)
  })

  it("never requires a prerequisite for view itself", () => {
    const state = { status: "restricted" as const, permissions: ["view:leads"] }
    expect(checkPermission(state, "view", "leads")).toBe(true)
  })
})
