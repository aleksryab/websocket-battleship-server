import { WebSocket } from 'ws';
import { gamesStorage, registeredClients, roomsStorage } from '../..';
import { deleteRoomWithUser } from '../rooms';
import { techDefeat } from '../games/techDefeat';
import { updateRoom } from '../rooms/updateRoom';

export const handleDisconnectedPlayer = (ws: WebSocket) => {
  const player = registeredClients.get(ws);
  if (!player) return;
  deleteRoomWithUser(player.index);
  updateRoom();
  techDefeat(player.index);
  registeredClients.delete(ws);

  console.log(registeredClients);
  console.log(roomsStorage);
  console.log(gamesStorage);
};
