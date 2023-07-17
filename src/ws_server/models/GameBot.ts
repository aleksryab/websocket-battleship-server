import { WebSocket } from 'ws';
import { AttackStatus, BOT_ID } from '../constants';
import { AttackResult, Coordinates, ShipInfo } from '../types';
import { BattleShipGame } from './BattleShipGame';

import { resultAttackBroadcast } from '../controllers/games/broadcasters';
import {
  getAdjacentPositions,
  getCellFromField,
  getRandomCellFromField,
  shuffleArray,
} from './utils';
import { finishGame } from '../controllers/games/finishGame';

const ATTACK_DELAY = 1000;

enum CellStatus {
  Unknown,
  Miss,
  Hit,
}

interface CellInfo {
  status: CellStatus | boolean;
  position: Coordinates;
}

type Field = CellInfo[][];

enum Directions {
  Up,
  Down,
  Left,
  Right,
}

interface LastHit {
  position: Coordinates;
  direction?: Directions;
}

type ShipType = ShipInfo['type'];
interface ShipSchema {
  type: ShipType;
  length: number;
  quantity: number;
}

const shipsSchema: ShipSchema[] = [
  { type: 'huge', length: 4, quantity: 1 },
  { type: 'large', length: 3, quantity: 2 },
  { type: 'medium', length: 2, quantity: 3 },
  { type: 'small', length: 1, quantity: 4 },
];

const directionsMap = new Map<
  Directions,
  (position: Coordinates) => Coordinates
>([
  [Directions.Up, ({ x, y }) => ({ x, y: y - 1 })],
  [Directions.Down, ({ x, y }) => ({ x, y: y + 1 })],
  [Directions.Left, ({ x, y }) => ({ x: x - 1, y })],
  [Directions.Right, ({ x, y }) => ({ x: x + 1, y })],
]);

export class GameBot {
  private game: BattleShipGame;
  private playerClient: WebSocket;
  private enemyField: Field;
  private lastHit: LastHit | null;

  constructor(game: BattleShipGame, client: WebSocket) {
    this.game = game;
    this.playerClient = client;
    this.enemyField = this.generateField(CellStatus.Unknown);
    this.addShips();
    this.lastHit = null;
  }

  tryMove() {
    const currentPlayer = this.game.whoseTurn();
    console.log('Turn: ', currentPlayer);
    if (currentPlayer === BOT_ID) setTimeout(() => this.attack(), ATTACK_DELAY);
  }

  private addShips() {
    const ships = this.generateShips();
    this.game.addShips(BOT_ID, ships);
  }

  private generateShips(): ShipInfo[] {
    console.log('Generate Ships -->');
    const ships: ShipInfo[] = [];
    const field = this.generateField(false);

    shipsSchema.forEach((schema) => {
      const { type, length, quantity } = schema;

      for (let i = 0; i < quantity; i++) {
        const ship = this.createShip(field, length, type);
        ships.push(ship);
      }
    });

    field.forEach((row) =>
      console.log(row.map((it) => Number(it.status)).toString()),
    );

    return ships;
  }

  private createShip(field: Field, length: number, type: ShipType) {
    let ship = null;

    while (!ship) {
      const position = getRandomCellFromField(field)?.position;
      const direction = Math.random() > 0.5;
      if (!position) continue;

      const candidate: ShipInfo = {
        position,
        direction,
        length,
        type,
      };

      if (this.isShipCanBeOnField(field, candidate)) ship = candidate;
    }

    return ship;
  }

  private isShipCanBeOnField(field: Field, ship: ShipInfo) {
    const { direction, length, position } = ship;
    const cells = [];

    for (let i = 0; i < length; i++) {
      const shipX = direction ? position.x : position.x + i;
      const shipY = direction ? position.y + i : position.y;

      const cell = getCellFromField(field, shipX, shipY);
      if (!cell || cell.status) return false;

      const adjacentCells = getAdjacentPositions(cell.position);
      const isPositionOccupied = adjacentCells.some(({ x, y }) => {
        const adjCell = getCellFromField(field, x, y);
        return adjCell && adjCell.status;
      });

      if (isPositionOccupied) return false;

      cells.push(cell);
    }

    cells.forEach((cell) => (cell.status = true));
    return true;
  }

  private attack() {
    console.log('Attack -->');
    const target = this.lastHit
      ? this.getSmartTarget()
      : this.getRandomTarget();

    console.log('Target: ', target);

    const results = this.game.attack(BOT_ID, target);
    if (!results) return;
    this.HandleAttackResult(results);
    resultAttackBroadcast(this.playerClient, this.game.whoseTurn(), results);
  }

  private HandleAttackResult(results: AttackResult[]) {
    results.forEach((result) => {
      const { position, status } = result;
      const target = getCellFromField(this.enemyField, position.x, position.y);
      if (!target) return;

      if (status === AttackStatus.miss) {
        target.status = CellStatus.Miss;
      }

      if (status === AttackStatus.shot) {
        target.status = CellStatus.Hit;
        this.lastHit = { position: target.position };
        this.tryMove();
      }

      if (status === AttackStatus.killed) {
        target.status = CellStatus.Hit;
        this.lastHit = null;

        const isWin = this.game.isCurrentPlayerWin();
        console.log('Is Win: ', isWin);
        console.log('Position: ', target.position);

        if (isWin) {
          finishGame(this.game.gameId);
        } else {
          this.tryMove();
        }
      }
    });
  }

  private getSmartTarget() {
    if (!this.lastHit) return this.getRandomTarget();
    let target = null;

    const directions = [
      Directions.Up,
      Directions.Down,
      Directions.Left,
      Directions.Right,
    ];

    shuffleArray(directions);

    console.log(directions);

    while (!target && directions.length) {
      const direction = directions.pop();

      if (direction === undefined) return this.getRandomTarget();
      const getPosition = directionsMap.get(direction);
      if (!getPosition) return this.getRandomTarget();

      const targePosition = getPosition(this.lastHit.position);
      const candidate = getCellFromField(
        this.enemyField,
        targePosition.x,
        targePosition.y,
      );

      if (candidate && candidate.status === CellStatus.Unknown) {
        target = candidate;
        this.lastHit.direction = direction;
      }
    }

    return target ? target.position : this.getRandomTarget();
  }

  private getRandomTarget() {
    let target = null;

    while (!target) {
      console.log('try');
      const candidate = getRandomCellFromField(this.enemyField);

      if (candidate && candidate.status === CellStatus.Unknown)
        target = candidate;
    }

    return target.position;
  }

  private generateField(defaultStatus: CellStatus | boolean) {
    const size = this.game.fieldSize;
    return [...Array(size)].map((_, y) =>
      [...Array(size)].map((_, x) => ({
        status: defaultStatus,
        position: { x, y },
      })),
    );
  }
}
