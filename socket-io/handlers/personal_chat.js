const Message = require("../../models/Message");

function registerPersonalChat(io, socket) {

  // Join room
  socket.on("join_room", (room) => {
    socket.join(room);
    console.log(`User ${socket.user.name} joined room ${room}`);
  });

  // Send private message
  socket.on("new_message", async (data) => {
    try {

      if (!data.room || !data.receiverId || !data.content) return;

      const savedMessage = await Message.create({
        senderId: socket.user.id,   // secure
        receiverId: data.receiverId,
        content: data.content
      });

      io.to(data.room).emit("receive_message", {
        id: savedMessage.id,
        senderId: socket.user.id,
        username: socket.user.name,
        receiverId: data.receiverId,
        content: data.content,
        createdAt: savedMessage.createdAt
      });

    } catch (err) {
      console.error("Personal chat error:", err);
    }
  });

}

module.exports = registerPersonalChat;
