import { describe, expect, it } from "vitest";

import { pageWindow } from "@/components/orders/pager";

describe("pageWindow", () => {
  it("shows every page when there are few", () => {
    expect(pageWindow(1, 3)).toEqual([1, 2, 3]);
  });

  it("collapses distant pages into gaps around the current page", () => {
    expect(pageWindow(5, 10)).toEqual([1, "gap", 4, 5, 6, "gap", 10]);
  });

  it("does not add a gap for adjacent pages", () => {
    expect(pageWindow(2, 5)).toEqual([1, 2, 3, "gap", 5]);
  });
});
