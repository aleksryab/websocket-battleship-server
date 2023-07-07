import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';

const frontBasePath = '/front';
const indexHtmlPath = path.join(frontBasePath, 'index.html');

export const httpServer = http.createServer(function (req, res) {
  const __dirname = path.resolve(path.dirname(''));
  const sourcePath = req.url === '/' ? indexHtmlPath : frontBasePath + req.url;
  const absoluteSourcePath = path.join(__dirname, sourcePath);

  fs.readFile(absoluteSourcePath, function (err, data) {
    if (err) {
      res.writeHead(404);
      res.end(JSON.stringify(err));
      return;
    }

    res.writeHead(200);
    res.end(data);
  });
});
