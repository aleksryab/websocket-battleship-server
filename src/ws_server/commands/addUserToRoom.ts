import { WebSocket } from 'ws';
import { CommandTypes } from '../constants';
import { dataBase } from '../dataBase';
import { AddUserToRoomData } from '../types';
import { getStringResponse } from './utils';
import { gamesStorage, registeredClients } from '..';
import { BattleShipGame } from '../BattleShipGame';

export const addUserToRoom = (ws: WebSocket, data: string) => {
  const { indexRoom } = JSON.parse(data) as AddUserToRoomData;
  const room = dataBase.rooms.get(indexRoom);

  const client = registeredClients.get(ws);
  if (!client || !room) return;

  const { index, name } = client;

  if (room.roomUsers[0]?.index === index) return;
  room.roomUsers.push({ index, name, ws });

  const idGame = gamesStorage.size;
  const newGame = new BattleShipGame(idGame, 10);

  const players = new Map(room.roomUsers.map((user) => [user.index, user]));
  gamesStorage.set(idGame, { game: newGame, players });

  room?.roomUsers.forEach((user) => {
    const responseData = { idGame, idPlayer: user.index };
    const response = getStringResponse(CommandTypes.CreateGame, responseData);
    user.ws.send(response);
  });
};
