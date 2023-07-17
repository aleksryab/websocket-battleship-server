import { WebSocket } from 'ws';
import { registeredClients } from '.';
import { deleteRoomWithUser, updateRoom } from '../rooms';
import { techDefeat } from '../games';

export const handleDisconnectedPlayer = (ws: WebSocket) => {
  const player = registeredClients.get(ws);
  if (!player) return;

  deleteRoomWithUser(player.index);
  updateRoom();
  techDefeat(player.index);
  registeredClients.delete(ws);
};
