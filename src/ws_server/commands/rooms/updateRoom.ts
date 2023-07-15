import { WebSocket } from 'ws';
import { registeredClients, roomsStorage } from '../..';
import { CommandTypes } from '../../constants';
import { UpdateRoomData } from '../../types';
import { getStringResponse } from '../utils';

export const updateRoom = (ws?: WebSocket) => {
  const responseData: UpdateRoomData = [...roomsStorage.values()].map(
    ({ roomId, roomUsers }) => ({
      roomId,
      roomUsers: roomUsers.map(({ name, index }) => ({ name, index })),
    }),
  );

  const response = getStringResponse(CommandTypes.UpdateRoom, responseData);

  if (ws) {
    ws.send(response);
  } else {
    registeredClients.forEach((_, ws) => ws.send(response));
  }
};
