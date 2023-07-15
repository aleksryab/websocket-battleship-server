import { PlayerIndex } from './types';

export interface Player {
  index: PlayerIndex;
  name: string;
  password: string;
}

export interface Winner {
  index: PlayerIndex;
  name: string;
  wins: number;
}

export interface DataBase {
  players: Player[];
  winners: Winner[];
}

export const dataBase: DataBase = {
  players: [],
  winners: [],
};
