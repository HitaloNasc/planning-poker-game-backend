import express from 'express';
const app = express();

import http from 'http';
const server = http.createServer(app);

import { Server } from 'socket.io';
const sockets = new Server(server);

import * as dotenv from 'dotenv';
dotenv.config();
const PORT = process.env.BACKEND_PORT; //eslint-disable-line


app.get('/', (req, res) => res.send('Hello, world!'));

const game = {
  players: {}
};

sockets.on('connection', socket => {
  console.log(`${socket.id} conectado.`);

  const name = `Player_${socket.id.substring(0, 5)}`;
  game.players[socket.id] = { name };
  refreshPlayers();

  socket.on('disconnect', () => {
    delete game.players[socket.id];
    refreshPlayers();
  });
});

const refreshPlayers = () => {
  sockets.emit('PlayersRefresh', game.players);
};

server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
