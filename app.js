const Koa = require('koa');
const app = new Koa();
const path = require('path');
const fs = require('fs');

require('dotenv').config();
if (process.env.NODE_ENV === undefined) process.env.NODE_ENV = 'development';

app.use(require('koa-bodyparser')());
app.use(require('./routes').routes());

app.use(require('koa-static')(path.join(__dirname, '/dist')));

app.use(async (ctx) => {
    ctx.status = 404;
    ctx.redirect('/');
    return;
});

const server = require('http').createServer(app.callback());
const io = require('socket.io')(server);

const clientFile = fs.readFileSync("./node_modules/socket.io/client-dist/socket.io.min.js");
const clientMap = fs.readFileSync("./node_modules/socket.io/client-dist/socket.io.min.js.map");

server.sendFile = (filename, req, res) => {
  res.end(filename.endsWith(".map") ? clientMap : clientFile);
};

server.listen(8080);

server.on('connection', (socket) => {
  console.log("connected");
});

server.on('hello', (e) => { console.log("asdf"); });