import { WebSocket } from 'ws';
import { CommandTypes } from '../constants';
import { dataBase } from '../dataBase';
import { AddUserToRoomData } from '../types';
import { getStringResponse } from './utils';
import { registeredClients } from '..';

export const addUserToRoom = (ws: WebSocket, data: string) => {
  const { indexRoom } = JSON.parse(data) as AddUserToRoomData;
  const { rooms } = dataBase;
  const room = rooms.get(indexRoom);

  const client = registeredClients.get(ws);
  if (!client) return;

  const { index, name } = client;

  if (room?.roomUsers[0]?.index === index) return;
  room?.roomUsers.push({ index, name, ws });

  room?.roomUsers.forEach((user) => {
    const responseData = { idGame: 0, idPlayer: user.index };
    const response = getStringResponse(CommandTypes.CreateGame, responseData);
    user.ws.send(response);
  });
};
