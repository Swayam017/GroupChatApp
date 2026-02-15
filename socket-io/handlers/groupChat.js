const Message = require("../../models/Message");

function registerGroupChat(io, socket) {

  socket.on("join_group", (groupId) => {
    socket.join(`group_${groupId}`);
  });

  socket.on("group_message", async (data) => {
    const saved = await Message.create({
      senderId: socket.user.id,
      groupId: data.groupId,
      content: data.content
    });

io.to(`group_${data.groupId}`).emit("receive_group_message", {
  senderId: socket.user.id,
  username: socket.user.name,
  content: data.content,
  type: data.type || "text",
  createdAt: saved.createdAt,
  groupId: data.groupId   
});

  });

}

module.exports = registerGroupChat;
