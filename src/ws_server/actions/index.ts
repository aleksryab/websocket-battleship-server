import { CommandTypes } from '../constants';
import { Command } from '../types';
import { regPlayer } from './regPlayer';

export const actionsMap = new Map([
  [CommandTypes.Reg, (req: Command) => regPlayer(req)],
]);
