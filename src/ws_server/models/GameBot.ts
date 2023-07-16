import { WebSocket } from 'ws';
import { AttackStatus, BOT_ID } from '../constants';
import { AttackResult, Coordinates } from '../types';
import { BattleShipGame } from './BattleShipGame';
import { testShips } from './test';
import { resultAttackBroadcast } from '../controllers/games/broadcasters';
import { generateRandom, getCellFromField, shuffleArray } from './utils';
import { finishGame } from '../controllers/games/finishGame';

const ATTACK_DELAY = 1000;

enum CellStatus {
  Unknown,
  Miss,
  Hit,
}

interface CellInfo {
  status: CellStatus;
  position: Coordinates;
}

type EnemyField = CellInfo[][];

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
  private enemyField: EnemyField;
  private lastHit: LastHit | null;

  constructor(game: BattleShipGame, client: WebSocket) {
    this.game = game;
    this.playerClient = client;
    this.generateEnemyField();
    this.lastHit = null;
  }

  generateShips() {
    this.game.addShips(BOT_ID, testShips);
  }

  tryMove() {
    const currentPlayer = this.game.whoseTurn();
    console.log('Turn: ', currentPlayer);
    if (currentPlayer === BOT_ID) setTimeout(() => this.attack(), ATTACK_DELAY);
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

      const candidate = getCellFromField(
        this.enemyField,
        generateRandom(),
        generateRandom(),
      );

      if (candidate && candidate.status === CellStatus.Unknown)
        target = candidate;
    }

    return target.position;
  }

  private generateEnemyField() {
    const size = this.game.fieldSize;
    this.enemyField = [...Array(size)].map((_, y) =>
      [...Array(size)].map((_, x) => ({
        status: CellStatus.Unknown,
        position: { x, y },
      })),
    );
  }
}
