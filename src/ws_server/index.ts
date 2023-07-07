import { WebSocketServer } from 'ws';
import { Command } from './types';
import { actionsMap } from './actions';

export const startWsServer = (port: number) => {
  const wsServer = new WebSocketServer({ port }, () =>
    console.log(`WebSocket server started on ${port} port`),
  );

  wsServer.on('connection', (ws) => {
    console.log(`A client just connected`);

    ws.on('error', console.error);

    ws.on('message', (message) => {
      console.log('received: %s', message);

      try {
        const command: Command = JSON.parse(message.toString());
        console.log(command);
        const action = actionsMap.get(command.type);

        if (action) {
          const response = action(command);
          console.log(response);
          ws.send(response);
        }
      } catch (err) {
        console.error(err);
      }
    });
  });
};
