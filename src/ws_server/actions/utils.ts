import { Command, CommandTypesList } from '../types';

export const getResponseTemplate = (type: CommandTypesList): Command => {
  return {
    type,
    data: '',
    id: 0,
  };
};
