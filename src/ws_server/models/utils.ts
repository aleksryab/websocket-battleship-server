import { GAME_FIELD_SIZE } from '../constants';

export const generateRandom = (min = 0, max = GAME_FIELD_SIZE - 1) => {
  return Math.floor(Math.random() * (max - min)) + min;
};

export const getCellFromField = <T>(field: T[][], x: number, y: number) => {
  const row = field[y];
  if (!row) return null;
  const cell = row[x];
  if (cell === undefined) return null;
  return cell;
};

export const shuffleArray = (arr: unknown[]) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
};
