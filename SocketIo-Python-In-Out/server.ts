import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as Client } from 'socket.io-client';

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: '*',
  },
});

const pythonSocket = Client('http://localhost:5000');

io.on('connection', (socket) => {
  console.log('a user connected');

  socket.on('message', (data) => {
    console.log('message from client:', data);
    pythonSocket.emit('message', data);
  });

  pythonSocket.on('message', (data) => {
    console.log('message from Python server:', data);
    socket.emit('message', data);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

httpServer.listen(3000, () => {
  console.log('Node.js server listening on port 3000');
});