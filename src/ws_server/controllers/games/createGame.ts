import { GAME_FIELD_SIZE } from '../../constants';
import { PlayerInRoom } from '../../types';
import { BattleShipGame } from '../../models/BattleShipGame';
import { gamesStorage } from '.';

export const createGame = (playersInRoom: PlayerInRoom[]) => {
  const newGame = new BattleShipGame(GAME_FIELD_SIZE);

  playersInRoom.forEach((player) => newGame.addPlayer(player.index));
  const players = new Map(playersInRoom.map((user) => [user.index, user]));

  gamesStorage.set(newGame.gameId, { game: newGame, players });
  return newGame.gameId;
};
