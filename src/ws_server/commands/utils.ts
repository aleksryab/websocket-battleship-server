import { CommandTypesList } from '../types';

export const getStringResponse = (
  type: CommandTypesList,
  data: unknown,
): string => {
  return JSON.stringify({
    type,
    data: JSON.stringify(data),
    id: 0,
  });
};
