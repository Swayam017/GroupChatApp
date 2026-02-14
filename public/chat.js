document.addEventListener("DOMContentLoaded", async () => {

  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "index.html";
    return;
  }

  const payload = JSON.parse(atob(token.split(".")[1]));
  const userId = payload.userId;

  const socket = io("http://localhost:3000", {
    auth: { token }
  });

  const userListDiv = document.getElementById("userList");
  const messagesDiv = document.getElementById("messages");
  const input = document.getElementById("msgInput");
  const sendBtn = document.getElementById("sendBtn");
  const chatTitle = document.getElementById("chatTitle");

  let currentReceiverId = null;
  let currentRoom = null;

  // Load users
  async function loadUsers() {
    const res = await fetch("http://localhost:3000/api/users", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const users = await res.json();

    userListDiv.innerHTML = "";

    users
      .filter(user => user.id !== userId)
      .forEach(user => {
        const div = document.createElement("div");
        div.className = "user-item";
        div.innerText = user.name;

        div.addEventListener("click", () => openChat(user));

        userListDiv.appendChild(div);
      });
  }

  function openChat(user) {
    currentReceiverId = user.id;
    chatTitle.innerText = user.name;

    currentRoom =
      userId < currentReceiverId
        ? `${userId}-${currentReceiverId}`
        : `${currentReceiverId}-${userId}`;

    socket.emit("join_room", currentRoom);

    loadMessages();
  }

  async function loadMessages() {
    if (!currentReceiverId) return;

    const res = await fetch(
      `http://localhost:3000/api/chat/${userId}/${currentReceiverId}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    const messages = await res.json();

    messagesDiv.innerHTML = "";
    messages.forEach(renderMessage);
    scrollBottom();
  }

  function renderMessage(msg) {
    const div = document.createElement("div");
    div.className =
      msg.senderId === userId ? "sent" : "received";

    div.innerHTML = `
      <div class="bubble">
        <strong>${msg.username}:</strong> ${msg.content}
      </div>
    `;

    messagesDiv.appendChild(div);
  }

  function sendMessage() {
    const text = input.value.trim();
    if (!text || !currentRoom) return;

    socket.emit("new_message", {
      room: currentRoom,
      receiverId: currentReceiverId,
      content: text
    });

    input.value = "";
  }

  socket.on("receive_message", (msg) => {
    if (
      (msg.senderId === userId && msg.receiverId === currentReceiverId) ||
      (msg.senderId === currentReceiverId && msg.receiverId === userId)
    ) {
      renderMessage(msg);
      scrollBottom();
    }
  });

  function scrollBottom() {
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  sendBtn.addEventListener("click", sendMessage);

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  });

  loadUsers();
});
