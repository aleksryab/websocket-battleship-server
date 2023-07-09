import { WebSocket } from 'ws';
import { CommandTypes } from './constants';
import { BattleShipGame } from './BattleShipGame';
import { PlayerInRoom } from './dataBase';

interface PlayerInfo {
  index: number;
  name: string;
}

export type ClientsMap = Map<WebSocket, PlayerInfo>;

export interface Command {
  type: CommandTypes;
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

export interface ShipInfo {
  position: {
    x: number;
    y: number;
  };

  direction: boolean;
  length: number;
  type: 'small' | 'medium' | 'large' | 'huge';
}

export interface AddShipsRequestData {
  gameId: number;
  ships: ShipInfo[];
  indexPlayer: number;
}

export interface StartGameResponseData {
  ships: ShipInfo[];
  currentPlayerIndex: number;
}

interface PlayerInGameStorage extends PlayerInRoom {
  ships?: ShipInfo[];
}

interface GameInStorage {
  game: BattleShipGame;
  players: Map<number, PlayerInGameStorage>;
}

export type GamesStorage = Map<number, GameInStorage>;
