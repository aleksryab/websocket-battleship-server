import { WebSocket } from 'ws';
import { AttackResult, GameId, PlayerId, PlayerIndex } from '../../types';
import { getStringResponse } from '../utils';
import { CommandTypes } from '../../constants';

export const resultAttackBroadcast = (
  ws: WebSocket,
  currentPlayer: PlayerId | undefined,
  resultsAttack: AttackResult[],
) => {
  resultsAttack.forEach((result: AttackResult) => {
    const response = getStringResponse(CommandTypes.Attack, result);
    ws.send(response);
  });
  turnBroadcast(ws, currentPlayer);
};

export const turnBroadcast = (
  ws: WebSocket,
  currentPlayer: PlayerId | undefined,
) => {
  if (currentPlayer === undefined) return;
  const turnResponse = getStringResponse(CommandTypes.Turn, { currentPlayer });
  ws.send(turnResponse);
};

export const createGameBroadcast = (
  ws: WebSocket,
  idGame: GameId,
  idPlayer: PlayerIndex,
) => {
  const responseData = { idGame, idPlayer };
  const response = getStringResponse(CommandTypes.CreateGame, responseData);
  ws.send(response);
};
