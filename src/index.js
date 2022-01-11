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
  players: {},
  rooms: {}
};

sockets.on('connection', socket => {
  console.log(`${socket.id} conectado.`);

  const name = `Player_${socket.id.substring(0, 5)}`;
  game.players[socket.id] = { name };
  sendMessage(game.players[socket.id], 'entrou');
  refreshPlayers();

  socket.on('disconnect', () => {
    sendMessage(game.players[socket.id], 'saiu');
    delete game.players[socket.id];
    refreshPlayers();
  });

  socket.on('SendMessage', message => {
    sendMessage(game.players[socket.id], message);
  });

  socket.on('CreateRoom', () => {
    socket.join(socket.id);

    game.rooms[socket.id] = {
      player1: socket.id,
      player2: undefined
    };

    game.players[socket.id].room = socket.id;

    refreshPlayers();
    refreshRooms();
    sendMessage(game.players[socket.id], 'Criou uma sala');
  });
});

const sendMessage = (player, message) => {
  sockets.emit('ReceiveMessage', `${player.name}: ${message}`);
};

const refreshPlayers = () => {
  sockets.emit('PlayersRefresh', game.players);
};

const refreshRooms = () => {
  sockets.emit('RoomsRefresh', game.rooms);
};

server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
