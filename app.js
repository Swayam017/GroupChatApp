require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const sequelize = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const Message = require("./models/Message");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// REST APIs
app.use("/api", authRoutes);
app.use("/api/chat", chatRoutes);

// Create HTTP server
const server = http.createServer(app);

// Attach Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

// 🔥 Socket logic
io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // When client sends message
  socket.on("chat-message", async (data) => {
    try {
      console.log("Message received:", data);

      // Save to DB
      const savedMessage = await Message.create({
        senderId: data.senderId,
        receiverId: data.receiverId,
        content: data.content
      });

      // Broadcast to ALL clients
      io.emit("newMessage", savedMessage);

    } catch (err) {
      console.error("Socket error:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// DB sync
sequelize.sync()
  .then(() => console.log("Database connected"))
  .catch(err => console.log(err));

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
