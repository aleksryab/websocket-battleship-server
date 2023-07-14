import { AddShipsRequestData, StartGameResponseData } from '../types';
import { gamesStorage } from '..';
import { getStringResponse } from './utils';
import { CommandTypes } from '../constants';

export const addShips = (data: string) => {
  const { gameId, ships, indexPlayer }: AddShipsRequestData = JSON.parse(data);

  const gameInfo = gamesStorage.get(gameId);
  if (!gameInfo) return;

  const { game, players } = gameInfo;
  const currentPlayer = players.get(indexPlayer);
  if (!currentPlayer) return;

  currentPlayer.ships = ships;
  game.addShips(indexPlayer, ships);

  if (game.isGameReady()) {
    players.forEach((player) => {
      if (!player.ships) return;

      const responseData: StartGameResponseData = {
        currentPlayerIndex: player.index,
        ships: player.ships,
      };

      const response = getStringResponse(CommandTypes.StartGame, responseData);
      player.ws.send(response);
      const currentPlayer = game.whoseTurn();
      const turnResponse = getStringResponse(CommandTypes.Turn, {
        currentPlayer,
      });
      player.ws.send(turnResponse);
    });
  }
};
