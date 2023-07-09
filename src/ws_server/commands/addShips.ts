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
    players.forEach((it) => {
      const { index, ships } = it;
      if (!ships) return;

      const responseData: StartGameResponseData = {
        currentPlayerIndex: index,
        ships,
      };

      const response = getStringResponse(CommandTypes.StartGame, responseData);
      it.ws.send(response);
    });
  }
};
