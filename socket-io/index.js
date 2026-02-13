const { Server } = require("socket.io");
const registerChatHandlers = require("./handlers/chat");
const socketMiddleware = require("./middleware");

function initSocket(server) {
  const io = new Server(server, {
    cors: { origin: "*" }
  });

  io.use(socketMiddleware);

  io.on("connection", (socket) => {
    console.log("User connected:", socket.user.name);

    registerChatHandlers(io, socket);

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.user.name);
    });
  });
}

module.exports = initSocket;
