import { WebSocket } from 'ws';
import { Room } from '../../types';
import { updateRoom } from './updateRoom';
import { registeredClients } from '../players';
import { roomsStorage } from '.';

export const createRoom = (ws: WebSocket) => {
  const client = registeredClients.get(ws);
  if (!client) return;

  const { index, name } = client;
  const roomId = Date.now();

  const isUserCreatedRoom = [...roomsStorage.values()].some(
    (room) => room.creator === index,
  );
  if (isUserCreatedRoom) return;

  const newRoom: Room = {
    roomId,
    creator: index,
    roomUsers: [{ index, name, ws }],
  };

  roomsStorage.set(roomId, newRoom);
  updateRoom();
};
