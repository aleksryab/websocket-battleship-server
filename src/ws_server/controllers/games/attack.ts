import { AttackRequestData } from '../../types';
import { GameBot } from '../../models/GameBot';
import { resultAttackBroadcast } from './broadcasters';
import { finishGame } from './finishGame';
import { gamesStorage } from '.';

export const attack = (data: string) => {
  const { gameId, x, y, indexPlayer }: AttackRequestData = JSON.parse(data);

  const gameInfo = gamesStorage.get(gameId);
  if (!gameInfo) return;
  const { game, players } = gameInfo;

  const target = x === undefined || y === undefined ? null : { x, y };
  const resultsAttack = game.attack(indexPlayer, target);
  if (!resultsAttack) return;

  const currentPlayer = game.whoseTurn();

  players.forEach((player) => {
    if (player instanceof GameBot) {
      player.tryMove();
      return;
    }
    resultAttackBroadcast(player.ws, currentPlayer, resultsAttack);
  });

  if (game.isCurrentPlayerWin()) finishGame(gameId);
};
