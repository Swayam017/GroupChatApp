const Group = require("../models/Group");
const GroupMember = require("../models/GroupMember");
const User = require("../models/User");
const Message = require("../models/Message");


exports.createGroup = async (req, res) => {
  try {
    const { name } = req.body;

    const group = await Group.create({ name });

    await group.addUser(req.userId); // cleaner way

    res.json(group);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};


exports.getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;

    const messages = await Message.findAll({
      where: { groupId },
      include: {
        model: User,
        attributes: ["name"]
      },
      order: [["createdAt", "ASC"]]
    });

    const formatted = messages.map(m => ({
      senderId: m.senderId,
      username: m.User?.name,
      content: m.content,
      createdAt: m.createdAt,
      groupId: m.groupId
    }));

    res.json(formatted);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};


exports.addMember = async (req, res) => {
  const { groupId } = req.params;
  const { email } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) return res.status(404).json({ message: "User not found" });

  await GroupMember.create({
    UserId: user.id,
    GroupId: groupId
  });

  res.json({ message: "Member added" });
};
exports.getUserGroups = async (req, res) => {
  try {
    const groups = await Group.findAll({
      include: {
        model: User,
        where: { id: req.userId }
      }
    });

    res.json(groups);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};
