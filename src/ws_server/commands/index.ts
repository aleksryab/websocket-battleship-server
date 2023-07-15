import { WebSocket } from 'ws';
import { CommandTypes } from '../constants';
import { regPlayer } from './players/regPlayer';
import { createRoom } from './rooms/createRoom';
import { addUserToRoom } from './rooms/addUserToRoom';
import { addShips } from './games/addShips';
import { attack } from './games/attack';

type CommandMap = Map<CommandTypes, (ws: WebSocket, data: string) => void>;

export const commandsMap: CommandMap = new Map([
  [CommandTypes.Reg, (ws, data) => regPlayer(ws, data)],
  [CommandTypes.CreateRoom, (ws) => createRoom(ws)],
  [CommandTypes.AddUserToRoom, (ws, data) => addUserToRoom(ws, data)],
  [CommandTypes.AddShips, (_, data) => addShips(data)],
  [CommandTypes.Attack, (_, data) => attack(data)],
  [CommandTypes.RandomAttack, (_, data) => attack(data)],
]);
