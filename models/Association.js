const User = require("./User");
const Group = require("./Group");
const GroupMember = require("./GroupMember");
const Message = require("./Message");

/* ===== MANY TO MANY (Users <-> Groups) ===== */

User.belongsToMany(Group, { through: GroupMember });
Group.belongsToMany(User, { through: GroupMember });

/* ===== PERSONAL MESSAGES ===== */

User.hasMany(Message, { foreignKey: "senderId" });
Message.belongsTo(User, { foreignKey: "senderId" });

/* ===== GROUP MESSAGES ===== */

Group.hasMany(Message, { foreignKey: "groupId" });
Message.belongsTo(Group, { foreignKey: "groupId" });
