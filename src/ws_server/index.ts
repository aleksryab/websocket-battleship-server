import { WebSocketServer } from 'ws';
import { Command } from './types';
import { commandsMap } from './controllers';
import { handleDisconnectedPlayer } from './controllers/players';

export const startWsServer = (port: number) => {
  const wsServer = new WebSocketServer({ port }, () =>
    console.log(`WebSocket server started on ${port} port`),
  );

  wsServer.on('connection', (ws) => {
    ws.on('message', (message) => {
      try {
        const { type, data }: Command = JSON.parse(message.toString());
        const action = commandsMap.get(type);
        if (action) action(ws, data);
      } catch (err) {
        console.error(err);
      }
    });

    ws.on('close', () => {
      handleDisconnectedPlayer(ws);
    });

    ws.on('error', console.error);
  });
};
