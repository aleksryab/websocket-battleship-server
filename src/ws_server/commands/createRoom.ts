import { WebSocket } from 'ws';
import { registeredClients, roomsStorage } from '..';
import { Room } from '../types';
import { updateRoom } from './updateRoom';

export const createRoom = (ws: WebSocket) => {
  const client = registeredClients.get(ws);
  if (!client) return;

  const { index, name } = client;
  const roomId = Date.now();

  const newRoom: Room = {
    roomId,
    roomUsers: [{ index, name, ws }],
  };

  roomsStorage.set(roomId, newRoom);
  updateRoom();
};
