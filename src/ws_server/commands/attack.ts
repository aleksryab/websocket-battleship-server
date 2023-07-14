import { gamesStorage } from '..';
import { getStringResponse } from './utils';
import { CommandTypes } from '../constants';
import { AttackRequestData, AttackResult } from '../types';

export const attack = (data: string) => {
  const { gameId, x, y, indexPlayer }: AttackRequestData = JSON.parse(data);

  const gameInfo = gamesStorage.get(gameId);
  if (!gameInfo) return;

  const resultsAttack = gameInfo.game.attack(indexPlayer, x, y);
  if (!resultsAttack) return;

  gameInfo.players.forEach((player) => {
    resultsAttack.forEach((result: AttackResult) => {
      const response = getStringResponse(CommandTypes.Attack, result);
      player.ws.send(response);

      const turnResponse = getStringResponse(CommandTypes.Turn, {
        currentPlayer: gameInfo.game.whoseTurn(),
      });

      player.ws.send(turnResponse);
    });
  });
};
