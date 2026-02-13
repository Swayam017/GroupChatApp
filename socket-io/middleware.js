const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function socketMiddleware(socket, next) {
  try {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication error"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.userId);

    if (!user) {
      return next(new Error("User not found"));
    }

    socket.user = user;   // 🔥 attach full user

    next();
  } catch (err) {
    next(new Error("Authentication error"));
  }
}

module.exports = socketMiddleware;
