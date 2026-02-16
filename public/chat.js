document.addEventListener("DOMContentLoaded", async () => {

  /* ================= AUTH ================= */

  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "index.html";
    return;
  }

  const payload = JSON.parse(atob(token.split(".")[1]));
  const userId = payload.userId;

  /* ================= SOCKET ================= */

  const socket = io("http://localhost:3000", {
    auth: { token }
  });

  /* ================= DOM ================= */

  const userListDiv = document.getElementById("userList");
  const groupListDiv = document.getElementById("groupList");
  const messagesDiv = document.getElementById("messages");
  const input = document.getElementById("msgInput");
  const sendBtn = document.getElementById("sendBtn");
  const chatTitle = document.getElementById("chatTitle");
  const fileBtn = document.getElementById("fileBtn");
  const fileInput = document.getElementById("fileInput");
  const suggestionsDiv = document.getElementById("suggestions");

  const imageModal = document.getElementById("imageModal");
  const modalImage = document.getElementById("modalImage");

  /* ================= STATE ================= */

  let chatMode = null;
  let currentReceiverId = null;
  let currentRoom = null;
  let currentGroupId = null;

  /* ================= UTIL ================= */

  function scrollBottom() {
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  function debounce(func, delay) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  }

  /* ================= LOAD USERS ================= */

  async function loadUsers() {
    const res = await fetch("http://localhost:3000/api/users", {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) return;

    const users = await res.json();
    userListDiv.innerHTML = "";

    users
      .filter(user => user.id !== userId)
      .forEach(user => {
        const div = document.createElement("div");
        div.className = "user-item";
        div.innerText = user.name;
        div.onclick = () => openPersonalChat(user);
        userListDiv.appendChild(div);
      });
  }

  function openPersonalChat(user) {
    chatMode = "personal";
    currentReceiverId = user.id;
    currentGroupId = null;

    messagesDiv.innerHTML = "";
    chatTitle.innerText = user.name;

    currentRoom =
      userId < currentReceiverId
        ? `${userId}-${currentReceiverId}`
        : `${currentReceiverId}-${userId}`;

    socket.emit("join_room", currentRoom);
    loadPersonalMessages();
  }

  async function loadPersonalMessages() {
    const res = await fetch(
      `http://localhost:3000/api/chat/${userId}/${currentReceiverId}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.ok) return;

    const messages = await res.json();
    messagesDiv.innerHTML = "";
    messages.forEach(renderMessage);
    scrollBottom();
  }

  /* ================= LOAD GROUPS ================= */

  async function loadGroups() {
    const res = await fetch("http://localhost:3000/api/groups", {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) return;

    const groups = await res.json();
    groupListDiv.innerHTML = "";

    groups.forEach(group => {
      const div = document.createElement("div");
      div.className = "user-item";
      div.innerText = group.name;
      div.onclick = () => openGroupChat(group);
      groupListDiv.appendChild(div);
    });
  }

  function openGroupChat(group) {
    chatMode = "group";
    currentGroupId = group.id;
    currentReceiverId = null;

    messagesDiv.innerHTML = "";
    chatTitle.innerText = group.name;

    socket.emit("join_group", group.id);
    loadGroupMessages(group.id);
  }

  async function loadGroupMessages(groupId) {
    const res = await fetch(
      `http://localhost:3000/api/groups/${groupId}/messages`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.ok) return;

    const messages = await res.json();
    messagesDiv.innerHTML = "";
    messages.forEach(renderMessage);
    scrollBottom();
  }

  /* ================= SEND MESSAGE ================= */

  function sendMessage() {
    const text = input.value.trim();
    if (!text || !chatMode) return;

    if (chatMode === "personal") {
      socket.emit("new_message", {
        room: currentRoom,
        receiverId: currentReceiverId,
        content: text,
        type: "text"
      });
    }

    if (chatMode === "group") {
      socket.emit("group_message", {
        groupId: currentGroupId,
        content: text,
        type: "text"
      });
    }

    input.value = "";
    suggestionsDiv.innerHTML = "";
  }

  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") sendMessage();
  });

  /* ================= RECEIVE ================= */

  socket.on("receive_message", (msg) => {
    if (
      chatMode === "personal" &&
      (
        (msg.senderId === userId && msg.receiverId === currentReceiverId) ||
        (msg.senderId === currentReceiverId && msg.receiverId === userId)
      )
    ) {
      renderMessage(msg);
    }
  });

  socket.on("receive_group_message", (msg) => {
    if (chatMode === "group" && msg.groupId === currentGroupId) {
      renderMessage(msg);
    }
  });

  /* ================= RENDER ================= */

  function renderMessage(msg) {

    const div = document.createElement("div");
    div.className = msg.senderId === userId ? "sent" : "received";

    let contentHTML;

    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(msg.content);
    const isVideo = /\.(mp4|webm|ogg)$/i.test(msg.content);
    const isFileURL = msg.content.startsWith("http");

    if (isImage) {
      contentHTML = `<img src="${msg.content}" class="chat-image" style="max-width:250px;border-radius:12px;cursor:pointer;">`;
    } else if (isVideo) {
      contentHTML = `<video controls style="max-width:250px;border-radius:12px;"><source src="${msg.content}"></video>`;
    } else if (isFileURL) {
      contentHTML = `<a href="${msg.content}" target="_blank">📎 Download File</a>`;
    } else {
      contentHTML = msg.content;
    }

    div.innerHTML = `
      <div class="bubble">
        <strong>${msg.senderId === userId ? "You" : msg.username}</strong>
        <div>${contentHTML}</div>
      </div>
    `;

    messagesDiv.appendChild(div);
    scrollBottom();
  }

  /* ================= IMAGE PREVIEW ================= */

  document.addEventListener("click", function (e) {

    if (e.target.classList.contains("chat-image")) {
      modalImage.src = e.target.src;
      imageModal.style.display = "flex";
    }

    if (e.target.id === "closeModal" || e.target.id === "imageModal") {
      imageModal.style.display = "none";
    }

  });

  /* ================= AI SUGGESTIONS ================= */

  input.addEventListener("input", debounce(async () => {

    const text = input.value.trim();
    if (text.length < 3) {
      suggestionsDiv.innerHTML = "";
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/ai/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text })
      });

      if (!res.ok) return;

      const data = await res.json();
      suggestionsDiv.innerHTML = "";

      data.suggestions.forEach(s => {
        const btn = document.createElement("button");
        btn.innerText = s;
        btn.className = "suggest-btn";
        btn.onclick = () => {
          input.value = s;
          suggestionsDiv.innerHTML = "";
        };
        suggestionsDiv.appendChild(btn);
      });

    } catch (err) {
      console.error(err);
    }

  }, 600));

  loadUsers();
  loadGroups();

});
