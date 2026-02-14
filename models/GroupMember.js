const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const GroupMember = sequelize.define("GroupMember", {});

module.exports = GroupMember;
