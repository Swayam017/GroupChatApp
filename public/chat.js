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
  const createGroupBtn = document.getElementById("createGroupBtn");
  const newGroupName = document.getElementById("newGroupName");
  const addMemberBtn = document.getElementById("addMemberBtn");
  const addMemberEmail = document.getElementById("addMemberEmail");
  const fileBtn = document.getElementById("fileBtn");
  const fileInput = document.getElementById("fileInput");

  /* ================= STATE ================= */

  let chatMode = null;
  let currentReceiverId = null;
  let currentRoom = null;
  let currentGroupId = null;

  /* ================= FILE BUTTON ================= */

  fileBtn?.addEventListener("click", () => fileInput.click());
  fileInput?.addEventListener("change", sendFile);

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
    if (!currentReceiverId) return;

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

  /* ================= SEND TEXT ================= */

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
  }

  /* ================= SEND FILE ================= */

  async function sendFile() {

    if (!chatMode) {
      alert("Select chat first");
      return;
    }

    const file = fileInput.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:3000/api/media/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (!res.ok) {
        alert("Upload failed");
        return;
      }

      const data = await res.json();

      if (chatMode === "personal") {
        socket.emit("new_message", {
          room: currentRoom,
          receiverId: currentReceiverId,
          content: data.url,
          type: "file"
        });
      }

      if (chatMode === "group") {
        socket.emit("group_message", {
          groupId: currentGroupId,
          content: data.url,
          type: "file"
        });
      }

    } catch (err) {
      console.error(err);
      alert("Upload error");
    }

    fileInput.value = "";
  }

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
    if (chatMode === "group") renderMessage(msg);
  });

  /* ================= RENDER ================= */

 function renderMessage(msg) {

  const div = document.createElement("div");

  div.className =
    msg.senderId === userId ? "sent" : "received";

  let contentHTML;

  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(msg.content);
  const isVideo = /\.(mp4|webm|ogg)$/i.test(msg.content);
  const isFileURL = msg.content.startsWith("http");

  if (isImage) {

    contentHTML = `
      <img 
        src="${msg.content}" 
        class="chat-image"
        style="max-width:250px;border-radius:12px;cursor:pointer;">
    `;

  } else if (isVideo) {

    contentHTML = `
      <video 
        controls 
        style="max-width:250px;border-radius:12px;">
        <source src="${msg.content}">
        Your browser does not support video.
      </video>
    `;

  } else if (isFileURL) {

    contentHTML = `
      <a href="${msg.content}" target="_blank">
        📎 Download File
      </a>
    `;

  } else {

    contentHTML = msg.content;

  }

  div.innerHTML = `
    <div class="bubble">
      <strong>${msg.username || "You"}:</strong>
      <div>${contentHTML}</div>
    </div>
  `;

  messagesDiv.appendChild(div);
  scrollBottom();
}


  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") sendMessage();
  });
/* ================= IMAGE PREVIEW ================= */

const imageModal = document.getElementById("imageModal");
const modalImage = document.getElementById("modalImage");
const closeModal = document.getElementById("closeModal");

document.addEventListener("click", function (e) {

  if (e.target.classList.contains("chat-image")) {
    modalImage.src = e.target.src;
    imageModal.style.display = "flex";
  }

  if (e.target.id === "closeModal" || e.target.id === "imageModal") {
    imageModal.style.display = "none";
  }

});

  loadUsers();
  loadGroups();

});
