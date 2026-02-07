require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const sequelize = require("./config/database");
const authRoutes = require("./routes/authRoutes");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// APIs
app.use("/api", authRoutes);

sequelize.sync()
  .then(() => console.log("Database connected"))
  .catch(err => console.log(err));

  app.listen(3000, () => {
  console.log("Server running on port 3000");
});


module.exports = app;
