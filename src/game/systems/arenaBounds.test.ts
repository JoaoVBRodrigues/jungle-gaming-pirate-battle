
import { describe, expect, it } from "vitest";
import {
  clampPlayerPosition,
  type ArenaBounds,
} from "./arenaBounds";

describe("clampPlayerPosition", () => {
  const bounds: ArenaBounds = {
    width: 800,
    height: 600,
    paddingX: 20,
    paddingY: 25,
  };

  it("keeps a position inside the padded arena", () => {
    const result = clampPlayerPosition(
      { x: 400, y: 300 },
      bounds,
    );

    expect(result).toEqual({
      x: 400,
      y: 300,
    });
  });

  it("clamps positions beyond the left and top edges", () => {
    const result = clampPlayerPosition(
      { x: -50, y: -20 },
      bounds,
    );

    expect(result).toEqual({
      x: 20,
      y: 25,
    });
  });

  it("clamps positions beyond the right and bottom edges", () => {
    const result = clampPlayerPosition(
      { x: 900, y: 700 },
      bounds,
    );

    expect(result).toEqual({
      x: 780,
      y: 575,
    });
  });
});