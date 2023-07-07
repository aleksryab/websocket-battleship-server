import { CommandTypes } from './constants';

export type CommandTypesList = (typeof CommandTypes)[keyof typeof CommandTypes];

export interface Command {
  type: CommandTypesList;
  data: string;
  id: 0;
}

export interface PlayerRequestData {
  name: string;
  password: string;
}

export interface PlayerResponseData {
  name: string;
  index: number;
  error: boolean;
  errorText: string;
}
