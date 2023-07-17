import { WebSocket } from 'ws';
import { gamesStorage, registeredClients } from '../..';
import { BattleShipGame } from '../../models/BattleShipGame';
import { BOT_ID, GAME_FIELD_SIZE } from '../../constants';
import { GameBot } from '../../models/GameBot';
import { createGameBroadcast } from './broadcasters';
import { deleteRoomWithUser } from '../rooms';
import { updateRoom } from '../rooms/updateRoom';

export const singlePlay = (ws: WebSocket) => {
  const player = registeredClients.get(ws);
  if (!player) return;
  const { index, name } = player;
  deleteRoomWithUser(index);
  updateRoom();

  const idGame = gamesStorage.size;
  const newGame = new BattleShipGame(idGame, GAME_FIELD_SIZE);
  const bot = new GameBot(newGame, ws);

  const players = new Map();
  players.set(player.index, { index, name, ws });
  players.set(BOT_ID, bot);
  newGame.addPlayer(index);
  newGame.addPlayer(BOT_ID);

  gamesStorage.set(idGame, { game: newGame, players });
  createGameBroadcast(ws, idGame, index);
};
