import { WebSocketServer } from 'ws';
import { ClientsMap, Command, GamesStorage } from './types';
import { commandsMap } from './commands';

export const registeredClients: ClientsMap = new Map();
export const gamesStorage: GamesStorage = new Map();

export const startWsServer = (port: number) => {
  const wsServer = new WebSocketServer({ port }, () =>
    console.log(`WebSocket server started on ${port} port`),
  );

  wsServer.on('connection', (ws) => {
    console.log(`A client just connected`);
    ws.on('message', (message) => {
      try {
        console.log(message.toString());
        const { type, data }: Command = JSON.parse(message.toString());

        const action = commandsMap.get(type);
        if (action) action(ws, data);
      } catch (err) {
        console.error(err);
      }
    });

    ws.on('close', () => {
      registeredClients.delete(ws);
    });

    ws.on('error', console.error);
  });
};
