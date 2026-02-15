const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Message = sequelize.define("Message", {
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
  }
});

module.exports = Message;
