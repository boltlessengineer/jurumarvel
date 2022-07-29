const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
let users = [];

app.use("/assets", express.static(__dirname + "/assets"));

app.get("/", (_, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/login", (_, res) => {
  res.sendFile(__dirname + "/login.html");
});

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("send-username", (username) => {
    const user = {
      id: socket.id,
      name: username,
      pos: 0,
    };
    if (
      users.filter((u) => u.id == user.id).length == 0 &&
      users.filter((u) => u.name == username).length == 0
    ) {
      users.push(user);
      socket.broadcast.emit("user-entered", user);
    } else {
      console.log("username username");
      socket.emit("username-exists", username);
    }
    socket.emit("data", { users: users });
  });

  socket.on("roll-dice", (dice) => {
    // users[users.findIndex((u) => u.id == socket.id)].name = user.name;
    users[users.findIndex((u) => u.id == socket.id)].pos += dice;
    if (users[users.findIndex((u) => u.id == socket.id)].pos < 0) {
      users[users.findIndex((u) => u.id == socket.id)].pos = 0;
    }
    io.emit("user-update", users[users.findIndex((u) => u.id == socket.id)]);
  });

  socket.on("disconnect", () => {
    io.emit("user-quite", socket.id);
    users = users.filter((u) => u.id != socket.id);
    console.log("user disconnected");
  });
});

server.listen(3000, () => {
  console.log("listening on :3000");
});
