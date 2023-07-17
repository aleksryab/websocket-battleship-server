import {
  AttackResult,
  Coordinates,
  GameId,
  PlayerId,
  ShipInfo,
} from '../types';
import { AttackStatus } from '../constants';
import {
  getAdjacentPositions,
  getCellFromField,
  getRandomCellFromField,
} from './utils';

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

type GameField = CellInfo[][];

interface PlayerState {
  field: GameField;
  shipsNumber: number;
}

type PlayersState = Map<PlayerId, PlayerState>;
type AttackTarget = Coordinates | null;

export class BattleShipGame {
  gameId: GameId;
  fieldSize: number;
  private gameQueue: PlayerId[];
  private playersState: PlayersState;

  constructor(id: number, fieldSize: number) {
    this.gameId = id;
    this.fieldSize = fieldSize;
    this.playersState = new Map();
    this.gameQueue = [];
  }

  addPlayer(indexPlayer: PlayerId) {
    this.gameQueue.push(indexPlayer);
  }

  addShips(indexPlayer: PlayerId, ships: ShipInfo[]) {
    const field = this.createField(ships);
    this.playersState.set(indexPlayer, { field, shipsNumber: ships.length });
  }

  isGameReady() {
    return this.playersState.size === PLAYERS_NUMBER;
  }

  attack(currentPlayer: PlayerId, target: AttackTarget) {
    if (currentPlayer !== this.whoseTurn()) return;

    const enemyState = this.getEnemyState();
    if (!enemyState) return;
    const enemyField = enemyState.field;

    const targetCell = target
      ? getCellFromField(enemyField, target.x, target.y)
      : this.getRandomTarget(enemyField);
    if (!targetCell || targetCell.isAttacked) return;

    const attackResults: AttackResult[] = [];
    const targetResult: AttackResult = {
      position: { x: targetCell.position.x, y: targetCell.position.y },
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
        enemyState.shipsNumber -= 1;

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

  isCurrentPlayerWin() {
    const enemyState = this.getEnemyState();
    return enemyState?.shipsNumber === 0;
  }

  private getRandomTarget(field: GameField): CellInfo {
    let target = null;

    while (!target) {
      const candidate = getRandomCellFromField(field);
      if (candidate && !candidate.isAttacked) target = candidate;
    }

    return target;
  }

  private getEnemyState() {
    const enemyIndex = this.gameQueue[1];
    if (enemyIndex === undefined) return;
    return this.playersState.get(enemyIndex);
  }

  private getAdjacentEmptyCells(field: GameField, shipCells: CellInfo[]) {
    const cells: Coordinates[] = [];

    shipCells.forEach((cell) => {
      const adjacentPositions = getAdjacentPositions(cell.position);

      adjacentPositions.forEach(({ x, y }) => {
        const cell = getCellFromField(field, x, y);

        if (cell && cell.status === CellStatus.Empty) {
          cell.isAttacked = true;
          cells.push({ x, y });
        }
      });
    });

    return cells;
  }

  private getShipCells(field: GameField, ship: ShipInfo) {
    const cells = [];
    const { position, direction, length } = ship;

    for (let i = 0; i < length; i++) {
      const shipY = direction ? position.y + i : position.y;
      const shipX = direction ? position.x : position.x + i;

      const cell = getCellFromField(field, shipX, shipY);
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

  private getEmptyField = (size: number): GameField => {
    const emptyCell: CellInfo = {
      isAttacked: false,
      status: CellStatus.Empty,
      position: { x: 0, y: 0 },
      ship: null,
    };

    return [...Array(size)].map((_, y) =>
      [...Array(size)].map((_, x) => ({ ...emptyCell, position: { x, y } })),
    );
  };
}
