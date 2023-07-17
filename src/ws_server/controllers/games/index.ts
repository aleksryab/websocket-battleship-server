import { GamesStorage } from '../../types';
import { createGame } from './createGame';
import { addShips } from './addShips';
import { attack } from './attack';
import { finishGame } from './finishGame';
import { singlePlay } from './singlePlay';
import { techDefeat } from './techDefeat';

export const gamesStorage: GamesStorage = new Map();

export { createGame, addShips, attack, finishGame, singlePlay, techDefeat };
