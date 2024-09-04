const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let users = []; // Array to keep track of users waiting to chat

app.use(express.static('public')); // Serve static files from 'public' directory

io.on('connection', (socket) => {
    console.log('A user connected');

    socket.on('register', (nickname) => {
        users.push({ id: socket.id, nickname });
        matchUsers();
    });

    socket.on('chatMessage', (data) => {
        io.to(data.targetSocketId).emit('chatMessage', { nickname: data.nickname, message: data.message });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
        users = users.filter(user => user.id !== socket.id);
        matchUsers();
    });
});

function matchUsers() {
    // Match users in pairs for chatting
    while (users.length >= 2) {
        const user1 = users.shift();
        const user2 = users.shift();
        
        io.to(user1.id).emit('chatMessage', { nickname: 'System', message: 'You are now paired with ' + user2.nickname });
        io.to(user2.id).emit('chatMessage', { nickname: 'System', message: 'You are now paired with ' + user1.nickname });
    }
}

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
