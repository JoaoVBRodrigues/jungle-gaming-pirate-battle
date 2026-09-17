
import { describe, expect, it } from "vitest";
import {
  addEnemyDefeatScore,
  createInitialScore,
} from "./scoreSystem";

describe("scoreSystem", () => {
  it("creates an initial score of zero", () => {
    const state = createInitialScore();

    expect(state.score).toBe(0);
  });

  it("adds one point for an enemy defeat", () => {
    const state = createInitialScore();

    const nextState = addEnemyDefeatScore(state);

    expect(nextState.score).toBe(1);
  });

  it("supports multiple enemy defeats", () => {
    let state = createInitialScore();

    state = addEnemyDefeatScore(state);
    state = addEnemyDefeatScore(state);
    state = addEnemyDefeatScore(state);

    expect(state.score).toBe(3);
  });

  it("preserves the original score state", () => {
    const state = createInitialScore();

    addEnemyDefeatScore(state);

    expect(state.score).toBe(0);
  });

  it("preserves additional state properties", () => {
    const state = {
      ...createInitialScore(),
      bonusMultiplier: 2,
    };

    const nextState = addEnemyDefeatScore(state);

    expect(nextState.score).toBe(1);
    expect(nextState.bonusMultiplier).toBe(2);
  });
});