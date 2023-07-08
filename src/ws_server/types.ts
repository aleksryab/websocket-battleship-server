import { WebSocket } from 'ws';
import { CommandTypes } from './constants';

interface PlayerInfo {
  index: number;
  name: string;
}

// export interface ExtWebSocket extends WebSocket {
//   id: string;
//   player: PlayerInfo;
// }

export type ClientsMap = Map<WebSocket, PlayerInfo>;

export type CommandTypesList = (typeof CommandTypes)[keyof typeof CommandTypes];

export interface Command {
  type: CommandTypesList;
  data: string;
  id: 0;
}

export interface PlayerRequestData {
  name: string;
  password: string;
}

export interface PlayerResponseData {
  name: string;
  index: number;
  error: boolean;
  errorText: string;
}

interface RoomData {
  roomId: number;
  roomUsers: PlayerInfo[];
}

export type UpdateRoomData = RoomData[];

export interface AddUserToRoomData {
  indexRoom: number;
}
