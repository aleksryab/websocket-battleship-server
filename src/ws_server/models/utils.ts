import { GAME_FIELD_SIZE } from '../constants';
import { Coordinates } from '../types';

// include the MIN value and exclude the MAX value
export const generateRandom = (min = 0, max = GAME_FIELD_SIZE) => {
  return Math.floor(Math.random() * (max - min)) + min;
};

export const getCellFromField = <T>(field: T[][], x: number, y: number) => {
  const row = field[y];
  if (!row) return null;
  const cell = row[x];
  if (cell === undefined) return null;
  return cell;
};

export const getRandomCellFromField = <T>(field: T[][]) => {
  return getCellFromField(field, generateRandom(), generateRandom());
};

export const getAdjacentPositions = ({ x, y }: Coordinates): Coordinates[] => {
  return [
    { x: x + 1, y: y },
    { x: x - 1, y: y },
    { x: x, y: y + 1 },
    { x: x, y: y - 1 },
    { x: x + 1, y: y + 1 },
    { x: x + 1, y: y - 1 },
    { x: x - 1, y: y + 1 },
    { x: x - 1, y: y - 1 },
  ];
};

export const shuffleArray = (arr: unknown[]) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
};

export enum Directions {
  Up = 'up',
  Down = 'down',
  Left = 'left',
  Right = 'right',
}

export const directionsMap = new Map<
  Directions,
  (position: Coordinates) => Coordinates
>([
  [Directions.Up, ({ x, y }) => ({ x, y: y - 1 })],
  [Directions.Down, ({ x, y }) => ({ x, y: y + 1 })],
  [Directions.Left, ({ x, y }) => ({ x: x - 1, y })],
  [Directions.Right, ({ x, y }) => ({ x: x + 1, y })],
]);

export const getDirections = () => {
  const directions = [
    Directions.Up,
    Directions.Down,
    Directions.Left,
    Directions.Right,
  ];
  shuffleArray(directions);
  return directions;
};

export const getNewPosition = (
  direction: Directions,
  position: Coordinates,
) => {
  const directionCalculator = directionsMap.get(direction);
  return (directionCalculator && directionCalculator(position)) ?? position;
};

export const getOppositeDirection = (direction: Directions) => {
  switch (direction) {
    case Directions.Up:
      return Directions.Down;
    case Directions.Down:
      return Directions.Up;
    case Directions.Left:
      return Directions.Right;
    case Directions.Right:
      return Directions.Left;
    default:
      return direction;
  }
};
