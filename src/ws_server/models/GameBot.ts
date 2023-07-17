import { WebSocket } from 'ws';
import { AttackStatus, BOT_ID } from '../constants';
import { AttackResult, Coordinates, ShipInfo } from '../types';
import { BattleShipGame } from './BattleShipGame';
import { resultAttackBroadcast } from '../controllers/games/broadcasters';
import {
  Directions,
  getAdjacentPositions,
  getCellFromField,
  getDirections,
  getNewPosition,
  getOppositeDirection,
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

interface AttackHistory {
  firstTarget: Coordinates;
  lastTarget?: Coordinates | null;
  direction?: Directions;
  isLastHit?: boolean;
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

export class GameBot {
  private game: BattleShipGame;
  private playerClient: WebSocket;
  private enemyField: Field;
  private attackLine: Coordinates[];
  private attackHistory: AttackHistory | null;

  constructor(game: BattleShipGame, client: WebSocket) {
    this.game = game;
    this.playerClient = client;
    this.enemyField = this.generateField(CellStatus.Unknown);
    this.addShips();
    this.generateAttackLine();
    this.attackHistory = null;
  }

  tryMove() {
    const currentPlayer = this.game.whoseTurn();
    if (currentPlayer === BOT_ID) setTimeout(() => this.attack(), ATTACK_DELAY);
  }

  private addShips() {
    const ships = this.generateShips();
    this.game.addShips(BOT_ID, ships);
  }

  private generateShips(): ShipInfo[] {
    const ships: ShipInfo[] = [];
    const field = this.generateField(false);

    shipsSchema.forEach((schema) => {
      const { type, length, quantity } = schema;

      for (let i = 0; i < quantity; i++) {
        const ship = this.createShip(field, length, type);
        ships.push(ship);
      }
    });

    /* If you want to see the bot's field 😉
    field.forEach((row) => console.log(row.map((it) => Number(it.status)).toString()));
    */

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

  private generateAttackLine() {
    this.attackLine = [];
    const size = this.game.fieldSize;

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        this.attackLine.push({ x: i, y: j });
      }
    }

    shuffleArray(this.attackLine);
  }

  private attack() {
    const target = this.attackHistory
      ? this.getSmartTarget()
      : this.getRandomTarget();
    if (!target) return;

    const results = this.game.attack(BOT_ID, target);
    if (!results) return;
    this.HandleAttackResult(results);
    resultAttackBroadcast(this.playerClient, this.game.whoseTurn(), results);
  }

  private HandleAttackResult(results: AttackResult[]) {
    let isNextMove = false;
    let isKilled = false;

    results.forEach((result) => {
      const { position, status } = result;
      const target = getCellFromField(this.enemyField, position.x, position.y);
      if (!target) return;

      if (status === AttackStatus.miss) {
        target.status = CellStatus.Miss;
        if (this.attackHistory) this.attackHistory.isLastHit = false;
      }

      if (status === AttackStatus.shot) {
        isNextMove = true;
        target.status = CellStatus.Hit;

        if (this.attackHistory) {
          this.attackHistory.lastTarget = target.position;
        } else {
          this.attackHistory = { firstTarget: target.position };
        }
        this.attackHistory.isLastHit = true;
      }

      if (status === AttackStatus.killed) {
        isNextMove = true;
        isKilled = true;
        target.status = CellStatus.Hit;
        this.attackHistory = null;
      }
    });

    if (isKilled) {
      const isWin = this.game.isCurrentPlayerWin();
      if (isWin) {
        finishGame(this.game.gameId);
      } else {
        this.tryMove();
      }
    } else if (isNextMove) {
      this.tryMove();
    }
  }

  private getSmartTarget() {
    if (!this.attackHistory) return this.getRandomTarget();
    const directions = getDirections();
    let target = null;

    const prevDirection = this.attackHistory?.direction;
    let prevTarget =
      this.attackHistory.lastTarget || this.attackHistory.firstTarget;
    let smartDirection = null;

    if (prevDirection) {
      smartDirection = this.attackHistory.isLastHit
        ? prevDirection
        : getOppositeDirection(prevDirection);
    }

    while (!target && directions.length) {
      const direction = smartDirection ? smartDirection : directions.pop();
      if (direction === undefined) return this.getRandomTarget();

      const newPosition = getNewPosition(direction, prevTarget);
      const candidate = getCellFromField(
        this.enemyField,
        newPosition.x,
        newPosition.y,
      );

      if (candidate && candidate.status === CellStatus.Unknown) {
        target = candidate;
        this.attackHistory.direction = direction;
      } else {
        if (this.attackHistory.lastTarget) {
          prevTarget = this.attackHistory.firstTarget;
          this.attackHistory.lastTarget = null;
        } else {
          smartDirection = null;
        }
      }
    }

    return target ? target.position : this.getRandomTarget();
  }

  private getRandomTarget() {
    let target = null;

    while (!target) {
      const position = this.attackLine.pop();
      if (!position) return;

      const candidate = getCellFromField(
        this.enemyField,
        position.x,
        position.y,
      );
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
