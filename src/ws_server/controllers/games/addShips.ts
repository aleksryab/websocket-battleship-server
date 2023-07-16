import { gamesStorage } from '../..';
import { AddShipsRequestData, StartGameResponseData } from '../../types';
import { CommandTypes } from '../../constants';
import { getStringResponse } from '../utils';
import { GameBot } from '../../models/GameBot';
import { turnBroadcast } from './broadcasters';

export const addShips = (data: string) => {
  const { gameId, ships, indexPlayer }: AddShipsRequestData = JSON.parse(data);

  const gameInfo = gamesStorage.get(gameId);
  if (!gameInfo) return;

  const { game, players } = gameInfo;
  const activePlayer = players.get(indexPlayer);
  if (!activePlayer || activePlayer instanceof GameBot) return;

  activePlayer.ships = ships;
  game.addShips(indexPlayer, ships);

  if (game.isGameReady()) {
    players.forEach((player) => {
      if (player instanceof GameBot || !player.ships) return;

      const responseData: StartGameResponseData = {
        currentPlayerIndex: player.index,
        ships: player.ships,
      };

      const response = getStringResponse(CommandTypes.StartGame, responseData);
      player.ws.send(response);

      const currentPlayer = game.whoseTurn();
      turnBroadcast(player.ws, currentPlayer);
    });
  }
};
