import { gamesStorage } from '..';
import { getStringResponse } from './utils';
import { CommandTypes } from '../constants';
import { AttackRequestData, AttackResult } from '../types';
import { updateWinners } from './updateWinners';
import { dataBase } from '../dataBase';

export const attack = (data: string) => {
  const { gameId, x, y, indexPlayer }: AttackRequestData = JSON.parse(data);

  const gameInfo = gamesStorage.get(gameId);
  if (!gameInfo) return;
  const { game, players } = gameInfo;

  const target = x === undefined || y === undefined ? null : { x, y };
  const resultsAttack = game.attack(indexPlayer, target);
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

  const winnerInDataBase = dataBase.winners.find(
    (winner) => winner.index === indexPlayer,
  );

  if (winnerInDataBase) {
    winnerInDataBase.wins += 1;
  } else {
    const player = dataBase.players.find(
      (player) => player.index === indexPlayer,
    );
    if (!player) return;
    dataBase.winners.push({ index: indexPlayer, name: player.name, wins: 1 });
  }

  players.forEach((player) => player.ws.send(finishResponse));
  updateWinners();
};
