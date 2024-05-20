"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const io = new socket_io_1.Server({
    // const io = new Server({
    cors: {
        // origin: ['http://localhost:3000', 'https://admin.socket.io'],
        origin: ['http://localhost:3000', 'http://192.168.0.82:3000'],
        credentials: true
    }
});
let onlineUsers = [];
io.on('connection', (socket) => {
    socket.on('newUser', (userId) => {
        console.log('newUser:', onlineUsers.some((user) => user.userId === userId));
        if (!onlineUsers.some((user) => user.userId === userId)) {
            onlineUsers.push({
                userId,
                socketId: socket.id
            });
        }
        const onlineUsersIdsArray = onlineUsers.map(user => user.userId);
        console.log('onlineUsers: ', onlineUsers);
        io.emit('getOnlineUsers', onlineUsersIdsArray);
        // clearTimeout(offlineTimeOut)
    });
    socket.on('sendMessage', (message) => {
        const user = onlineUsers.find((u) => u.userId === message.recipientId);
        if (!user)
            return;
        io.to(user.socketId).emit('getMessage', message);
        if (user) {
            // io.to(user.socketId).emit('get-notification', {
            //     senderId: message.senderId,
            //     senderName: message.senderName,
            //     isRead: false,
            //     date: new Date()
            // })
        }
    });
    socket.on('readMessages', ({ chatId, recipientId }) => {
        // console.log({ chatId, recipientId })
        const user = onlineUsers.find((u) => u.userId === recipientId);
        // console.log('read-messages: ', chatId, recipientId, user)
        if (user) {
            io.to(user.socketId).emit('getReadMessages', chatId);
        }
        // if (user) {
        //     // io.to(user.socketId).emit('get-notification', {
        //     //     senderId: message.senderId,
        //     //     senderName: message.senderName,
        //     //     isRead: false,
        //     //     date: new Date()
        //     // })
        // }
    });
    socket.on('createNewChat', ({ newChat, recipientId }) => {
        const user = onlineUsers.find((u) => u.userId === recipientId);
        // console.log('read-messages: ', chatId, recipientId, user)
        if (user) {
            io.to(user.socketId).emit('getNewChat', newChat);
        }
        // if (user) {
        //     // io.to(user.socketId).emit('get-notification', {
        //     //     senderId: message.senderId,
        //     //     senderName: message.senderName,
        //     //     isRead: false,
        //     //     date: new Date()
        //     // })
        // }
    });
    socket.on('removeOnlineUser', (userId) => {
        // console.log('remove-online-user', userId)
        onlineUsers = onlineUsers.filter((u) => u.socketId !== socket.id);
        io.emit('getRemoveOnlineUser', userId);
    });
    socket.on('drawToRecipient', ({ chatId, recipientId, x, y }) => {
        const user = onlineUsers.find((u) => u.userId === recipientId);
        if (user) {
            io.to(user.socketId).emit('getRecipientDraw', { chatId, x, y });
        }
    });
    socket.on('endDrawToRecipient', ({ chatId, recipientId }) => {
        const user = onlineUsers.find((u) => u.userId === recipientId);
        if (user) {
            io.to(user.socketId).emit('getEndDrawToRecipient', chatId);
        }
    });
    socket.on('typingTrigger', ({ chatId, recipientId }) => {
        const user = onlineUsers.find((u) => u.userId === recipientId);
        if (user) {
            io.to(user.socketId).emit('getTypingTrigger', chatId);
        }
    });
    socket.on('clearCanvasToRecipient', ({ chatId, recipientId }) => {
        const user = onlineUsers.find((u) => u.userId === recipientId);
        if (user) {
            io.to(user.socketId).emit('getClearRecipientCanvas', chatId);
        }
    });
    let offlineTimeOut;
    socket.on("disconnect", (reason) => {
        // offlineTimeOut = setTimeout(() => {
        //     onlineUsers = onlineUsers.filter((u) => u.socketId !== socket.id)
        //     io.emit('onlineUsers', onlineUsers)
        //
        // }, 10000)
        onlineUsers = onlineUsers.filter((u) => u.socketId !== socket.id);
        const onlineUsersIdsArray = onlineUsers.map(user => user.userId);
        io.emit('getOnlineUsers', onlineUsersIdsArray);
    });
});
io.listen(8001);
//# sourceMappingURL=index.js.map