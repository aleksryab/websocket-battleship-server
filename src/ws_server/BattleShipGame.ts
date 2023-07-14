import {
  AttackResult,
  AttackStatus,
  Coordinates,
  PlayerIndex,
  ShipInfo,
} from './types';

const PLAYERS_NUMBER = 2;

enum CellStatus {
  Empty,
  Ship,
  Hit,
}

interface CellInfo {
  isAttacked: boolean;
  status: CellStatus;
  position: Coordinates;
  ship: ShipInfo | null;
}

type PlayersFieldState = Map<PlayerIndex, CellInfo[][]>;

export class BattleShipGame {
  gameId: number;
  fieldSize: number;
  private gameQueue: PlayerIndex[];
  private playersFields: PlayersFieldState;

  constructor(id: number, fieldSize: number) {
    this.gameId = id;
    this.fieldSize = fieldSize;
    this.playersFields = new Map();
    this.gameQueue = [];
  }

  addShips(indexPlayer: PlayerIndex, ships: ShipInfo[]) {
    const field = this.createField(ships);
    this.playersFields.set(indexPlayer, field);
    this.gameQueue.push(indexPlayer);
  }

  isGameReady() {
    return this.playersFields.size === PLAYERS_NUMBER;
  }

  attack(currentPlayer: PlayerIndex, x: number, y: number) {
    if (currentPlayer !== this.whoseTurn()) return;
    const enemyFieldIndex = this.gameQueue[1];
    if (enemyFieldIndex === undefined) return;

    const enemyField = this.playersFields.get(enemyFieldIndex);
    if (!enemyField) return;

    const targetCell = this.getCell(enemyField, x, y);
    if (!targetCell || targetCell.isAttacked) return;

    const attackResults: AttackResult[] = [];
    const targetResult: AttackResult = {
      position: { x, y },
      currentPlayer,
      status: AttackStatus.miss,
    };

    attackResults.push(targetResult);

    if (targetCell.status === CellStatus.Empty) {
      this.gameQueue.shift();
      this.gameQueue.push(currentPlayer);
    } else {
      targetCell.status = CellStatus.Hit;

      if (!targetCell.ship) return;
      const shipCells = this.getShipCells(enemyField, targetCell.ship);

      const isKilled = !shipCells.some(
        (cell) => cell.status === CellStatus.Ship,
      );
      targetResult.status = isKilled ? AttackStatus.killed : AttackStatus.shot;

      if (isKilled) {
        shipCells.forEach((cell) => {
          attackResults.push({
            position: { x: cell.position.x, y: cell.position.y },
            currentPlayer,
            status: AttackStatus.killed,
          });
        });

        const emptyCells = this.getAdjacentEmptyCells(enemyField, shipCells);
        emptyCells.forEach((cell) => {
          attackResults.push({
            position: { x: cell.x, y: cell.y },
            currentPlayer,
            status: AttackStatus.miss,
          });
        });
      }
    }

    targetCell.isAttacked = true;
    return attackResults;
  }

  whoseTurn() {
    return this.gameQueue[0];
  }

  private getAdjacentEmptyCells(field: CellInfo[][], shipCells: CellInfo[]) {
    const cells: Coordinates[] = [];

    shipCells.forEach((cell) => {
      const { x, y } = cell.position;
      const adjacentCoordinates = [
        { emptyX: x + 1, emptyY: y },
        { emptyX: x - 1, emptyY: y },
        { emptyX: x, emptyY: y + 1 },
        { emptyX: x, emptyY: y - 1 },
        { emptyX: x + 1, emptyY: y + 1 },
        { emptyX: x + 1, emptyY: y - 1 },
        { emptyX: x - 1, emptyY: y + 1 },
        { emptyX: x - 1, emptyY: y - 1 },
      ];

      adjacentCoordinates.forEach(({ emptyX, emptyY }) => {
        const cell = this.getCell(field, emptyX, emptyY);
        if (cell && cell.status === CellStatus.Empty) {
          cell.isAttacked = true;
          cells.push({ x: emptyX, y: emptyY });
        }
      });
    });

    return cells;
  }

  private getShipCells(field: CellInfo[][], ship: ShipInfo) {
    const cells = [];
    const { position, direction, length } = ship;

    for (let i = 0; i < length; i++) {
      const shipY = direction ? position.y + i : position.y;
      const shipX = direction ? position.x : position.x + i;

      const cell = this.getCell(field, shipX, shipY);
      if (cell) cells.push(cell);
    }

    return cells;
  }

  private createField(ships: ShipInfo[]) {
    const field = this.getEmptyField(this.fieldSize);

    ships.forEach((ship) => {
      const shipCells = this.getShipCells(field, ship);
      shipCells.forEach((cell) => {
        cell.ship = ship;
        cell.status = CellStatus.Ship;
      });
    });
    return field;
  }

  private getCell(field: CellInfo[][], x: number, y: number): CellInfo | null {
    const row = field[y];
    if (!row) return null;
    const cell = row[x];
    if (cell === undefined) return null;
    return cell;
  }

  private getEmptyField = (size: number): CellInfo[][] => {
    const emptyCell: CellInfo = {
      isAttacked: false,
      status: CellStatus.Empty,
      position: { x: 0, y: 0 },
      ship: null,
    };

    return [...Array(size)].map((_, y) =>
      Array(size)
        .fill(null)
        .map((_, x) => ({ ...emptyCell, position: { x, y } })),
    );
  };
}
