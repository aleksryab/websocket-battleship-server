import { WebSocket } from 'ws';
import { PlayerRequestData, PlayerResponseData } from '../../types';
import { db } from '../../models/DataBase';
import {
  CommandTypes,
  ErrorMessages,
  PLAYER_NAME_MIN_LENGTH,
} from '../../constants';
import { getStringResponse } from '../utils';
import { updateRoom } from '../rooms';
import { updateWinners } from './updateWinners';
import { registeredClients } from '.';

const isNameValid = (name: unknown) => {
  return typeof name === 'string' && name.length >= PLAYER_NAME_MIN_LENGTH;
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
    const player = db.authPlayer(name, password);

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
  updateRoom(ws);
  updateWinners(ws);
};
