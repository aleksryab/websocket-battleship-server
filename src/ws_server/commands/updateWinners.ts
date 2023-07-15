import { dataBase } from '../dataBase';
import { getStringResponse } from './utils';
import { CommandTypes } from '../constants';
import { registeredClients } from '..';
import { WebSocket } from 'ws';

export const updateWinners = (ws?: WebSocket) => {
  const responseData = dataBase.winners;
  const response = getStringResponse(CommandTypes.UpdateWinners, responseData);

  if (ws) {
    ws.send(response);
  } else {
    registeredClients.forEach((_, ws) => ws.send(response));
  }
};
