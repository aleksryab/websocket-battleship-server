import { regPlayer } from './regPlayer';
import { createRoom } from './createRoom';
import { addUserToRoom } from './addUserToRoom';
import { WebSocket } from 'ws';
import { CommandTypes } from '../constants';

// export { regPlayer, createRoom, addUserToRoom };

export const commandsMap = new Map([
  [CommandTypes.Reg, (ws: WebSocket, data: string) => regPlayer(ws, data)],
  [CommandTypes.CreateRoom, (ws: WebSocket) => createRoom(ws)],
  [
    CommandTypes.AddUserToRoom,
    (ws: WebSocket, data: string) => addUserToRoom(ws, data),
  ],
]);
