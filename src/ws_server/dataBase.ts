export interface Player {
  index: number;
  name: string;
  password: string;
}

export interface DataBase {
  players: Player[];
}

export const dataBase: DataBase = {
  players: [],
};
