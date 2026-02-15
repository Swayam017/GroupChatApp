const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const ArchivedMessage = sequelize.define("ArchivedMessage", {
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  receiverId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  groupId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.STRING,
    defaultValue: "text"
  }
}, {
  timestamps: true
});

module.exports = ArchivedMessage;
