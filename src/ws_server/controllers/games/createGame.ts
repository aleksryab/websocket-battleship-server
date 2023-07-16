import { gamesStorage } from '../..';
import { GAME_FIELD_SIZE } from '../../constants';
import { BattleShipGame } from '../../models/BattleShipGame';
import { PlayerInRoom } from '../../types';

export const createGame = (playersInRoom: PlayerInRoom[]) => {
  const idGame = gamesStorage.size;
  const newGame = new BattleShipGame(idGame, GAME_FIELD_SIZE);

  playersInRoom.forEach((player) => newGame.addPlayer(player.index));
  const players = new Map(playersInRoom.map((user) => [user.index, user]));

  gamesStorage.set(idGame, { game: newGame, players });
  return idGame;
};
