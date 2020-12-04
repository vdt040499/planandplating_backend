const http = require('http');
const app = require('./app');

const port = process.env.PORT || 1111;

const server = http.createServer(app);

server.listen(port);
