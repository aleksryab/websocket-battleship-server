import { WebSocket } from 'ws';
import { registeredClients } from '../..';
import { db } from '../../models/DataBase';
import { CommandTypes } from '../../constants';
import { getStringResponse } from '../utils';

export const updateWinners = (ws?: WebSocket) => {
  const responseData = db.winners;
  const response = getStringResponse(CommandTypes.UpdateWinners, responseData);

  if (ws) {
    ws.send(response);
  } else {
    registeredClients.forEach((_, ws) => ws.send(response));
  }
};
