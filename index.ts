import { httpServer } from './src/http_server';

const HTTP_PORT = 8181;

httpServer.listen(HTTP_PORT);
console.log(`Static http server started on http://localhost:${HTTP_PORT}/`);
