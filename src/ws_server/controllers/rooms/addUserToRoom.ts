import { WebSocket } from 'ws';
import { registeredClients, roomsStorage } from '../..';
import { AddUserToRoomData } from '../../types';
import { updateRoom } from './updateRoom';
import { createGame } from '../games/createGame';
import { createGameBroadcast } from '../games/broadcasters';

export const addUserToRoom = (ws: WebSocket, data: string) => {
  const { indexRoom }: AddUserToRoomData = JSON.parse(data);
  const room = roomsStorage.get(indexRoom);

  const client = registeredClients.get(ws);
  if (!client || !room) return;

  const { index, name } = client;

  if (room.roomUsers[0]?.index === index) return;
  room.roomUsers.push({ index, name, ws });

  const idGame = createGame(room.roomUsers);

  room.roomUsers.forEach((user) => {
    createGameBroadcast(user.ws, idGame, user.index);

    roomsStorage.forEach((room) => {
      if (room.creator === user.index) roomsStorage.delete(room.roomId);
    });
  });

  roomsStorage.delete(indexRoom);
  updateRoom();
};
