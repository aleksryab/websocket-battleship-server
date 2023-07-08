import { PlayerRequestData, PlayerResponseData } from '../types';
import { dataBase } from '../dataBase';
import { CommandTypes, ErrorMessages, PLAYER_NAME_LENGTH } from '../constants';
import { getStringResponse } from './utils';
import { registeredClients } from '..';
import { WebSocket } from 'ws';

const isNameValid = (name: unknown) => {
  return typeof name === 'string' && name.length >= PLAYER_NAME_LENGTH;
};

const authPlayer = (name: string, password: string) => {
  const player = dataBase.players.find((it) => it.name === name);

  if (player) {
    if (player.password !== password) return null;
    return player;
  }

  const index = dataBase.players.length;
  const newPlayer = { index, name, password: password.toString() };
  dataBase.players.push(newPlayer);
  return newPlayer;
};

export const regPlayer = (ws: WebSocket, data: string) => {
  const { name, password } = JSON.parse(data) as PlayerRequestData;
  const responseData: PlayerResponseData = {
    name,
    index: 0,
    error: false,
    errorText: '',
  };

  if (!isNameValid(name)) {
    responseData.error = true;
    responseData.errorText = ErrorMessages.InvalidName;
  } else {
    const player = authPlayer(name, password);

    if (player) {
      registeredClients.set(ws, { index: player.index, name });
      responseData.index = player.index;
    } else {
      responseData.error = true;
      responseData.errorText = ErrorMessages.AuthError;
    }
  }

  const response = getStringResponse(CommandTypes.Reg, responseData);
  ws.send(response);
};
