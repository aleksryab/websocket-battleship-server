import { httpServer } from './src/http_server';
import { startWsServer } from './src/ws_server';

const HTTP_PORT = 8181;
const WS_PORT = 3000;

httpServer.listen(HTTP_PORT, () =>
  console.log(`Static http server started on http://localhost:${HTTP_PORT}`),
);

startWsServer(WS_PORT);
