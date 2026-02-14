const { Server } = require("socket.io");
//const registerChatHandlers = require("./handlers/chat");
const socketMiddleware = require("./middleware");
const registerPersonalChat = require("./handlers/personal_chat");

function initSocket(server) {
  const io = new Server(server, {
    cors: { origin: "*" }
  });

  io.use(socketMiddleware);

  io.on("connection", (socket) => {
    console.log("User connected:", socket.user.name);

   // registerChatHandlers(io, socket);
      registerPersonalChat(io, socket);

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.user.name);
    });
  });
}

module.exports = initSocket;
