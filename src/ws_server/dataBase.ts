import { WebSocket } from 'ws';

export interface Player {
  index: number;
  name: string;
  password: string;
}

export interface PlayerInRoom {
  index: number;
  name: string;
  ws: WebSocket;
}

export interface Room {
  roomId: number;
  roomUsers: PlayerInRoom[];
}

export interface DataBase {
  players: Player[];
  rooms: Map<number, Room>;
}

export const dataBase: DataBase = {
  players: [],
  rooms: new Map(),
};
