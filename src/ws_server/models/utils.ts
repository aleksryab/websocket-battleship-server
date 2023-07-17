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
