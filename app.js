require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
require("./models/Association");

const userRoutes = require("./routes/userRoutes");
const sequelize = require("./config/database");
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// REST APIs
app.use("/api", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/users", userRoutes);

const initSocket = require("./socket-io");

// Create HTTP server
const server = http.createServer(app);

initSocket(server);

// DB sync
sequelize.sync()
  .then(() => console.log("Database connected"))
  .catch(err => console.log(err));

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
