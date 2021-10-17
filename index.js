const io = require('socket.io')(8900, {
    cors: {
        origin: ['http://localhost:3000','http://localhost:3001']
    }
})

let users = []

const addUser = (userId, socketId) => {
    !users.some(user => user.userId === userId) &&
    users.push({ userId, socketId })
}

const removeUser = (socketId) => {
    users = users.filter(user => user.socketId !== socketId)
}

const getUser = (userId) => users.find(user => user.userId === userId)

io.on("connection", (socket) => {
    console.log("a user connected"); 

    socket.on("addUser", (userId) => {
        addUser(userId, socket.id)
        io.emit("getUsers", users)
    })

    socket.on("sendMessage", ({senderId, receiverId, text}) => {
        const user = getUser(receiverId)
        if (user) {
            io.to(user.socketId).emit("getMessage", {
                senderId, text
            })
        }
    })

    socket.on("sendConversation", ({senderId, receiverId, currentChat}) => {
        const user = getUser(receiverId)
        if (user) {
            io.to(user.socketId).emit("getConversation", {
                senderId, currentChat
            })
        }
    })

    socket.on("disconnect", () => {
        console.log("a user disconnected");
        removeUser(socket.id)
        io.emit("getUsers", users)
    })
})

