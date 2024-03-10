const { Server } = require('socket.io')

const io = new Server({
    cors: {
        // origin: ['http://localhost:3000', 'https://admin.socket.io'],
        origin: ['http://localhost:3000', 'http://192.168.0.82:3000'],
        credentials: true
    }
})

let onlineUsers = []

const deleteBySocketId = function (userId) {
    this.splice(this.findIndex((s) => s.socketId === userId), 1)
}

Array.prototype.deleteBySocketId = deleteBySocketId

io.on('connection', (socket) => {
    console.log('new connection', socket.id)

    socket.on('newUser', (userId) => {
        if (!onlineUsers.some((user) => user.userId === userId)) {
            onlineUsers.push({
                userId,
                socketId: socket.id
            })

        }
        const onlineUsersIdsArray = onlineUsers.map(user => user.userId)
        // console.log('onlineUsers: ', onlineUsers)
        io.emit('onlineUsers', onlineUsersIdsArray)
        clearTimeout(offlineTimeOut)
    })

    socket.on('send-message', (message) => {
        const user = onlineUsers.find((u) => u.userId === message.recipientId)
        // console.log(message)
        console.log(message, user)

        if (!user) return
        // console.log(user)
        io.to(user.socketId).emit('get-message', message)

        if (user) {
            // io.to(user.socketId).emit('get-notification', {
            //     senderId: message.senderId,
            //     senderName: message.senderName,
            //     isRead: false,
            //     date: new Date()
            // })
        }
    })

    socket.on('read-messages', ({ chatId, recipientId }) => {
        console.log({ chatId, recipientId })

        const user = onlineUsers.find((u) => u.userId === recipientId)
        // console.log('read-messages: ', chatId, recipientId, user)
        if(user) {
            io.to(user.socketId).emit('mark-read-messages', chatId)
        }

        // if (user) {
        //     // io.to(user.socketId).emit('get-notification', {
        //     //     senderId: message.senderId,
        //     //     senderName: message.senderName,
        //     //     isRead: false,
        //     //     date: new Date()
        //     // })
        // }
    })

    socket.on('create-new-chat', ({ newChat, recipientId }) => {

        const user = onlineUsers.find((u) => u.userId === recipientId)
        // console.log('read-messages: ', chatId, recipientId, user)
        if(user) {
            io.to(user.socketId).emit('get-new-chat', newChat)
        }

        // if (user) {
        //     // io.to(user.socketId).emit('get-notification', {
        //     //     senderId: message.senderId,
        //     //     senderName: message.senderName,
        //     //     isRead: false,
        //     //     date: new Date()
        //     // })
        // }
    })

    socket.on('remove-online-user', (userId) => {
        console.log('remove-online-user', userId)
        onlineUsers = onlineUsers.filter((u) => u.socketId !== socket.id)
        io.emit('get-remove-online-user', userId)
    })

    socket.on('draw-to-recipient', ({recipientId, x, y}) => {
        const user = onlineUsers.find((u) => u.userId === recipientId)
        if(user) {
            io.to(user.socketId).emit('get-recipient-draw', {x, y})
        }
    })

    socket.on('end-draw-to-recipient', (recipientId) => {
        const user = onlineUsers.find((u) => u.userId === recipientId)
        if(user) {
            io.to(user.socketId).emit('get-end-recipient-draw')
        }
    })

    socket.on('typing-trigger', (recipientId) => {
        const user = onlineUsers.find((u) => u.userId === recipientId)
        if(user) {
            io.to(user.socketId).emit('get-typing-trigger')
        }
    })

    let offlineTimeOut
    socket.on("disconnect", (reason) => {
        // offlineTimeOut = setTimeout(() => {
        //     onlineUsers = onlineUsers.filter((u) => u.socketId !== socket.id)
        //     io.emit('onlineUsers', onlineUsers)
        //
        // }, 10000)
        onlineUsers = onlineUsers.filter((u) => u.socketId !== socket.id)
        const onlineUsersIdsArray = onlineUsers.map(user => user.userId)
        io.emit('onlineUsers', onlineUsersIdsArray)
    });
})


io.listen(8001)