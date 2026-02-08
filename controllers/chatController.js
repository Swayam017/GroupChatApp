const Message = require("../models/Message");
const { Op } = require("sequelize");

// Send message
exports.sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, content } = req.body;

    const message = await Message.create({
      senderId,
      receiverId,
      content
    });

    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get chat history
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
