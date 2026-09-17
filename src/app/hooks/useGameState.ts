import { useSyncExternalStore } from 'react';
import {
    getGameStateSnapshot,
    subscribeToGameState,
} from '../../game/simulation/gameStateStore';
import type { GameHudState } from '../../game/simulation/gameStateStore';

export function useGameState(): GameHudState {
    return useSyncExternalStore(
        subscribeToGameState,
        getGameStateSnapshot,
        getGameStateSnapshot,
    );
}