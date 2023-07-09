import { WebSocket } from 'ws';
import { registeredClients } from '..';
import { CommandTypes } from '../constants';
import { Room, dataBase } from '../dataBase';
import { UpdateRoomData } from '../types';
import { getStringResponse } from './utils';

export const createRoom = (ws: WebSocket) => {
  const { rooms } = dataBase;
  const client = registeredClients.get(ws);
  if (!client) return;

  const { index, name } = client;
  const roomId = Date.now();

  const newRoom: Room = {
    roomId,
    roomUsers: [{ index, name, ws }],
  };
  rooms.set(roomId, newRoom);

  const responseData: UpdateRoomData = [
    { roomId, roomUsers: [{ index, name }] },
  ];
  const response = getStringResponse(CommandTypes.UpdateRoom, responseData);
  registeredClients.forEach((_, client) => client.send(response));
};
