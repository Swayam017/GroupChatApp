document.addEventListener("DOMContentLoaded", async () => {

  // AUTH 

  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "index.html";
    return;
  }

  const payload = JSON.parse(atob(token.split(".")[1]));
  const userId = payload.userId;

  // SOCKET 

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

  const joinBtn = document.getElementById("joinBtn");
  const emailInput = document.getElementById("emailSearch");

  const fileBtn = document.getElementById("fileBtn");
  const fileInput = document.getElementById("fileInput");

  const imageModal = document.getElementById("imageModal");
  const modalImage = document.getElementById("modalImage");

  // STATE 

  let chatMode = null;
  let currentReceiverId = null;
  let currentRoom = null;
  let currentGroupId = null;

  // UTIL 

  function scrollBottom() {
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  function generateRoomId(email1, email2) {
    return [email1.toLowerCase(), email2.toLowerCase()]
      .sort()
      .join("_");
  }

  //LOAD USERS 

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

  // LOAD GROUPS

  async function loadGroups() {
    const res = await fetch("http://localhost:3000/api/groups/", {
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

  // CREATE GROUP 

  createGroupBtn?.addEventListener("click", async () => {
    const name = newGroupName.value.trim();
    if (!name) return;

    const res = await fetch("http://localhost:3000/api/groups", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name })
    });

    if (!res.ok) {
      alert("Failed to create group");
      return;
    }

    newGroupName.value = "";
    loadGroups();
  });
const addMemberBtn = document.getElementById("addMemberBtn");
const addMemberEmail = document.getElementById("addMemberEmail");

addMemberBtn?.addEventListener("click", async () => {

  if (!currentGroupId) {
    alert("Open a group first");
    return;
  }

  const email = addMemberEmail.value.trim();
  if (!email) return;

  const res = await fetch(
    `http://localhost:3000/api/groups/${currentGroupId}/add-member`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ email })
    }
  );

  const data = await res.json();

  if (!res.ok) {
    alert(data.message || "Failed to add member");
    return;
  }

  alert("Member added successfully");
  addMemberEmail.value = "";
});

  // JOIN BY EMAIL 

  joinBtn?.addEventListener("click", async () => {
    const email = emailInput.value.trim();
    if (!email) return;

    const res = await fetch(
      `http://localhost:3000/api/users/find?email=${email}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!res.ok) return;

    const user = await res.json();
    if (!user.id || user.email === payload.email) {
      alert("Invalid user");
      return;
    }

    openPersonalChat(user);
  });

  // SEND MESSAGE 

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

  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") sendMessage();
  });

  // FILE UPLOAD 

  fileBtn?.addEventListener("click", () => fileInput.click());

  fileInput?.addEventListener("change", async () => {
    if (!chatMode) return alert("Select chat first");

    const file = fileInput.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("http://localhost:3000/api/media/upload", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });

    if (!res.ok) return alert("Upload failed");

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

    fileInput.value = "";
  });

  // RECEIVE 

  socket.on("receive_message", (msg) => {
    if (chatMode === "personal") renderMessage(msg);
  });

  socket.on("receive_group_message", (msg) => {
    if (chatMode === "group") renderMessage(msg);
  });

  // RENDER 

  function renderMessage(msg) {
    const div = document.createElement("div");
    div.className = msg.senderId === userId ? "sent" : "received";

    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(msg.content);
    const isFileURL = msg.content.startsWith("http");

    let contentHTML = msg.content;

    if (isImage) {
      contentHTML = `<img src="${msg.content}" class="chat-image" style="max-width:250px;border-radius:12px;cursor:pointer;">`;
    } else if (isFileURL) {
      contentHTML = `<a href="${msg.content}" target="_blank">📎 Download File</a>`;
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

 // IMAGE PREVIEW 

const closeModal = document.getElementById("closeModal");

// Open image preview
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("chat-image")) {
    modalImage.src = e.target.src;
    imageModal.style.display = "flex";
  }
});

// Close using X button
closeModal?.addEventListener("click", () => {
  imageModal.style.display = "none";
});

// Close when clicking outside image
imageModal?.addEventListener("click", (e) => {
  if (e.target === imageModal) {
    imageModal.style.display = "none";
  }
});

// Close with ESC key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    imageModal.style.display = "none";
  }
});


  // INIT 

  loadUsers();
  loadGroups();

});
