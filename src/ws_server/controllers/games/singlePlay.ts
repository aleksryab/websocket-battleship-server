import { WebSocket } from 'ws';
import { BattleShipGame } from '../../models/BattleShipGame';
import { BOT_ID, GAME_FIELD_SIZE } from '../../constants';
import { GameBot } from '../../models/GameBot';
import { createGameBroadcast } from './broadcasters';
import { deleteRoomWithUser, updateRoom } from '../rooms';
import { registeredClients } from '../players';
import { gamesStorage } from '.';

export const singlePlay = (ws: WebSocket) => {
  const player = registeredClients.get(ws);
  if (!player) return;
  const { index, name } = player;
  deleteRoomWithUser(index);
  updateRoom();

  const newGame = new BattleShipGame(GAME_FIELD_SIZE);
  const bot = new GameBot(newGame, ws);

  const players = new Map();
  players.set(player.index, { index, name, ws });
  players.set(BOT_ID, bot);
  newGame.addPlayer(index);
  newGame.addPlayer(BOT_ID);

  gamesStorage.set(newGame.gameId, { game: newGame, players });
  createGameBroadcast(ws, newGame.gameId, index);
};
