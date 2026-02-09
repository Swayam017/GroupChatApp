require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const sequelize = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// APIs
app.use("/api", authRoutes);
app.use("/api/chat", chatRoutes);

// 🔥 Create HTTP server
const server = http.createServer(app);

// 🔌 Attach Socket.io
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

// Make io accessible everywhere
app.set("io", io);

// Socket events
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// DB sync
sequelize.sync()
  .then(() => console.log("Database connected"))
  .catch(err => console.log(err));

// Start server
server.listen(3000, () => {
  console.log("Server running on port 3000");
});
