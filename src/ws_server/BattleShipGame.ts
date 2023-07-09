import { ShipInfo } from './types';

enum CellStatus {
  Empty,
  Ship,
}

type PlayersFieldState = Map<number, CellStatus[][]>;

export class BattleShipGame {
  gameId: number;
  fieldSize: number;
  private playersFields: PlayersFieldState;

  constructor(id: number, fieldSize: number) {
    this.gameId = id;
    this.fieldSize = fieldSize;
    this.playersFields = new Map();
  }

  addShips(indexPlayer: number, ships: ShipInfo[]) {
    const field = this.createField(ships);
    this.playersFields.set(indexPlayer, field);
    console.log(field);
  }

  isGameReady() {
    return this.playersFields.size === 2;
  }

  private createField(ships: ShipInfo[]) {
    const field = this.getEmptyField(this.fieldSize);

    ships.forEach((ship) => {
      const { x, y } = ship.position;
      const isVertical = ship.direction;

      for (let i = 0; i < ship.length; i++) {
        const shipY = isVertical ? y + i : y;
        const shipX = isVertical ? x : x + i;

        const coll = field[shipY];
        if (!coll || coll[shipX] === undefined) return;
        coll[shipX] = CellStatus.Ship;
      }
    });

    field.forEach((line) => console.log(line.toString()));
    return field;
  }

  private getEmptyField = (size: number): CellStatus[][] => {
    return [...Array(size)].map(() => Array(size).fill(CellStatus.Empty));
  };
}
