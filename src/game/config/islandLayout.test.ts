import { describe, expect, it } from "vitest";
import { DEFAULT_ISLANDS } from "./islandLayout";

describe("islandLayout", () => {
  it("defines the default islands", () => {
    expect(DEFAULT_ISLANDS).toHaveLength(4);
  });

  it("assigns unique IDs to every island", () => {
    const islandIds = DEFAULT_ISLANDS.map(
      (island) => island.id,
    );

    expect(new Set(islandIds).size).toBe(islandIds.length);
  });

  it("defines valid island positions and radii", () => {
    for (const island of DEFAULT_ISLANDS) {
      expect(island.position.x).toBeGreaterThanOrEqual(0);
      expect(island.position.y).toBeGreaterThanOrEqual(0);
      expect(island.radius).toBeGreaterThan(0);
    }
  });
});