const User = require("./User");
const Group = require("./Group");
const GroupMember = require("./GroupMember");
const Message = require("./Message");

/* ========= GROUP ASSOCIATIONS ========= */

// Many-to-Many (Users <-> Groups)
User.belongsToMany(Group, { through: GroupMember });
Group.belongsToMany(User, { through: GroupMember });

/* ========= MESSAGE ASSOCIATIONS ========= */

// Personal Messages
User.hasMany(Message, { foreignKey: "senderId" });
Message.belongsTo(User, { foreignKey: "senderId" });

// Group Messages
Group.hasMany(Message, { foreignKey: "groupId" });
Message.belongsTo(Group, { foreignKey: "groupId" });
