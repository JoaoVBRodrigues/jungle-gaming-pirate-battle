export interface ScoreState {
  score: number;
}

export function createInitialScore(): ScoreState {
  return {
    score: 0,
  };
}

export function addEnemyDefeatScore<T extends ScoreState>(
  state: T,
): T {
  return {
    ...state,
    score: state.score + 1,
  };
}