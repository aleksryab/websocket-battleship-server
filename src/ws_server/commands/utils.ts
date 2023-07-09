import { CommandTypes } from '../constants';

export const getStringResponse = (
  type: CommandTypes,
  data: unknown,
): string => {
  return JSON.stringify({
    type,
    data: JSON.stringify(data),
    id: 0,
  });
};
