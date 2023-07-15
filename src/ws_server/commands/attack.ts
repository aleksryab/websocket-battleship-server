import { gamesStorage } from '..';
import { getStringResponse } from './utils';
import { CommandTypes } from '../constants';
import { AttackRequestData, AttackResult } from '../types';

type AttackType = 'random' | 'target';

export const attack = (type: AttackType, data: string) => {
  const { gameId, x, y, indexPlayer }: AttackRequestData = JSON.parse(data);

  const gameInfo = gamesStorage.get(gameId);
  if (!gameInfo) return;
  const { game, players } = gameInfo;

  const resultsAttack = game.attack(indexPlayer, x, y);
  if (!resultsAttack) return;

  players.forEach((player) => {
    resultsAttack.forEach((result: AttackResult) => {
      const response = getStringResponse(CommandTypes.Attack, result);
      player.ws.send(response);

      const turnResponse = getStringResponse(CommandTypes.Turn, {
        currentPlayer: game.whoseTurn(),
      });

      player.ws.send(turnResponse);
    });
  });

  if (!game.isCurrentPlayerWin()) return;
  const finishResponse = getStringResponse(CommandTypes.Finish, {
    winPlayer: indexPlayer,
  });
  players.forEach((player) => player.ws.send(finishResponse));
};
