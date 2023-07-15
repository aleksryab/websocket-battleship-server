import { PlayerIndex } from '../types';

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

export class DataBase {
  players: Player[];
  winners: Winner[];

  constructor() {
    this.players = [];
    this.winners = [];
  }

  authPlayer(name: string, password: string) {
    const player = this.players.find((player) => player.name === name);

    if (player) {
      if (player.password !== password) return null;
      return player;
    }

    const newPlayer = this.addPlayer(name, password);
    return newPlayer;
  }

  addPlayer(name: string, password: string) {
    const index = this.players.length;
    const newPlayer = { index, name, password: password.toString() };
    this.players.push(newPlayer);
    return newPlayer;
  }

  updateWinner(winnerIndex: PlayerIndex) {
    const winner = this.winners.find((winner) => winner.index === winnerIndex);

    if (winner) {
      winner.wins += 1;
    } else {
      const player = this.players.find(
        (player) => player.index === winnerIndex,
      );
      if (!player) return;

      this.winners.push({ index: winnerIndex, name: player.name, wins: 1 });
    }
  }
}

export const db = new DataBase();
