import { WebSocket } from 'ws';
import { AttackStatus, CommandTypes } from './constants';
import { BattleShipGame } from './BattleShipGame';

export type PlayerIndex = number;
export type RoomId = number;
export type GameId = number;

interface PlayerInfo {
  index: PlayerIndex;
  name: string;
}

export type ClientsMap = Map<WebSocket, PlayerInfo>;
export type RoomsMap = Map<RoomId, Room>;
export type GamesStorage = Map<PlayerIndex, GameInStorage>;

export interface Command {
  type: CommandTypes;
  data: string;
  id: 0;
}

export interface PlayerInRoom {
  index: PlayerIndex;
  name: string;
  ws: WebSocket;
}

export interface Room {
  roomId: RoomId;
  creator: PlayerIndex;
  roomUsers: PlayerInRoom[];
}

export interface PlayerRequestData {
  name: string;
  password: string;
}

export interface PlayerResponseData {
  name: string;
  index: PlayerIndex;
  error: boolean;
  errorText: string;
}

interface RoomData {
  roomId: RoomId;
  roomUsers: PlayerInfo[];
}

export type UpdateRoomData = RoomData[];

export interface AddUserToRoomData {
  indexRoom: RoomId;
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
  gameId: GameId;
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

export interface GameInStorage {
  game: BattleShipGame;
  players: Map<PlayerIndex, PlayerInGameStorage>;
}

export interface TurnResponseData {
  currentPlayer: PlayerIndex;
}

export interface AttackRequestData {
  gameId: GameId;
  x?: number;
  y?: number;
  indexPlayer: PlayerIndex;
}

export interface AttackResult {
  position: Coordinates;
  currentPlayer: PlayerIndex;
  status: AttackStatus;
}
