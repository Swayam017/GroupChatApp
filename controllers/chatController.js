const Message = require("../models/Message");
const { Op } = require("sequelize");

exports.sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;

    const message = await Message.create({
      senderId,
      receiverId,
      content
    });

    // 🔥 Emit real-time message
    const io = req.app.get("io");
    io.emit("newMessage", message);

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getMessages = async (req, res) => {
  const { userId, otherUserId } = req.params;

  const messages = await Message.findAll({
    where: {
      [Op.or]: [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId }
      ]
    },
    order: [["createdAt", "ASC"]]
  });

  res.json(messages);
};
