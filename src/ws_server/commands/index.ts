import { regPlayer } from './regPlayer';
import { createRoom } from './createRoom';
import { addUserToRoom } from './addUserToRoom';
import { WebSocket } from 'ws';
import { CommandTypes } from '../constants';
import { addShips } from './addShips';
import { attack } from './attack';

type CommandMap = Map<CommandTypes, (ws: WebSocket, data: string) => void>;

export const commandsMap: CommandMap = new Map([
  [CommandTypes.Reg, (ws, data) => regPlayer(ws, data)],
  [CommandTypes.CreateRoom, (ws) => createRoom(ws)],
  [CommandTypes.AddUserToRoom, (ws, data) => addUserToRoom(ws, data)],
  [CommandTypes.AddShips, (_, data) => addShips(data)],
  [CommandTypes.Attack, (_, data) => attack(data)],
]);
