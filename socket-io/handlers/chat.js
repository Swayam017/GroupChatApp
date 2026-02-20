const Message = require("../../models/Message");

function registerChatHandlers(io, socket) {

  socket.on("chat-message", async (data) => {
    try {

      const savedMessage = await Message.create({
        senderId: socket.user.id,
        receiverId: data.receiverId,
        content: data.content
      });

      io.emit("newMessage", {
        id: savedMessage.id,
        senderId: socket.user.id,
        username: socket.user.name,   // include username
        receiverId: data.receiverId,
        content: data.content,
        createdAt: savedMessage.createdAt
      });

    } catch (err) {
      console.error("Chat handler error:", err);
    }
  });

}

module.exports = registerChatHandlers;
