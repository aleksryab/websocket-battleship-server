import { WebSocket } from 'ws';
import { CommandTypes } from './constants';
import { BattleShipGame } from './BattleShipGame';
import { PlayerInRoom } from './dataBase';

export type PlayerIndex = number;

interface PlayerInfo {
  index: PlayerIndex;
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

export interface Coordinates {
  x: number;
  y: number;
}

export interface ShipInfo {
  position: Coordinates;
  direction: boolean;
  length: number;
  type: 'small' | 'medium' | 'large' | 'huge';
}

export interface AddShipsRequestData {
  gameId: number;
  ships: ShipInfo[];
  indexPlayer: PlayerIndex;
}

export interface StartGameResponseData {
  ships: ShipInfo[];
  currentPlayerIndex: PlayerIndex;
}

interface PlayerInGameStorage extends PlayerInRoom {
  ships?: ShipInfo[];
}

interface GameInStorage {
  game: BattleShipGame;
  players: Map<PlayerIndex, PlayerInGameStorage>;
}

export type GamesStorage = Map<PlayerIndex, GameInStorage>;

export interface TurnResponseData {
  currentPlayer: PlayerIndex;
}

export interface AttackRequestData {
  gameId: number;
  x: number;
  y: number;
  indexPlayer: PlayerIndex;
}

export enum AttackStatus {
  miss = 'miss',
  killed = 'killed',
  shot = 'shot',
}

export interface AttackResult {
  position: Coordinates;
  currentPlayer: PlayerIndex;
  status: AttackStatus;
}
