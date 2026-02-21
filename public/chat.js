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

  const joinBtn = document.getElementById("joinBtn");
  const emailInput = document.getElementById("emailSearch");

  const createGroupBtn = document.getElementById("createGroupBtn");
  const newGroupName = document.getElementById("newGroupName");
  const addMemberBtn = document.getElementById("addMemberBtn");
  const addMemberEmail = document.getElementById("addMemberEmail");

  const fileBtn = document.getElementById("fileBtn");
  const fileInput = document.getElementById("fileInput");

  const suggestionsDiv = document.getElementById("suggestions");

  const imageModal = document.getElementById("imageModal");
  const modalImage = document.getElementById("modalImage");
  const closeModal = document.getElementById("closeModal");

  const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const profileAvatar = document.getElementById("profileAvatar");

async function loadProfile() {
  try {
    const res = await fetch("http://localhost:3000/api/users/me", {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!res.ok) {
      console.error("Failed to load profile");
      return;
    }

    const user = await res.json();

    profileName.innerText = user.name;
    profileEmail.innerText = user.email;
    profileAvatar.innerText = user.name.charAt(0).toUpperCase();

  } catch (err) {
    console.error("Profile error:", err);
  }
}

loadProfile();

  /* ================= STATE ================= */

  let chatMode = null; // personal | group
  let currentReceiverId = null;
  let currentGroupId = null;
  let currentRoom = null;

  /* ================= UTIL ================= */

  function scrollBottom() {
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  function debounce(func, delay) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
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

    users.filter(u => u.id !== userId).forEach(user => {
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

    chatTitle.innerText = user.name;
    messagesDiv.innerHTML = "";

    currentRoom =
      userId < user.id
        ? `${userId}-${user.id}`
        : `${user.id}-${userId}`;

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

    chatTitle.innerText = group.name;
    messagesDiv.innerHTML = "";

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

  /* ================= FILE UPLOAD ================= */

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

  /* ================= RECEIVE ================= */

  socket.on("receive_message", msg => {
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

  socket.on("receive_group_message", msg => {
    if (chatMode === "group" && msg.groupId === currentGroupId) {
      renderMessage(msg);
    }
  });

  /* ================= RENDER ================= */

  function renderMessage(msg) {
    const div = document.createElement("div");
    div.className = msg.senderId === userId ? "sent" : "received";

    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(msg.content);
    const isVideo = /\.(mp4|webm|ogg)$/i.test(msg.content);
    const isURL = msg.content.startsWith("http");

    let contentHTML = msg.content;

    if (isImage) {
      contentHTML = `<img src="${msg.content}" class="chat-image" style="max-width:250px;border-radius:12px;cursor:pointer;">`;
    } else if (isVideo) {
      contentHTML = `<video controls style="max-width:250px;border-radius:12px;"><source src="${msg.content}"></video>`;
    } else if (isURL) {
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

  /* ================= IMAGE PREVIEW ================= */

  document.addEventListener("click", e => {
    if (e.target.classList.contains("chat-image")) {
      modalImage.src = e.target.src;
      imageModal.style.display = "flex";
    }
  });

  closeModal?.addEventListener("click", () => {
    imageModal.style.display = "none";
  });

  imageModal?.addEventListener("click", e => {
    if (e.target === imageModal) {
      imageModal.style.display = "none";
    }
  });

  /* ================= AI SUGGESTIONS ================= */

  input.addEventListener("input", debounce(async () => {
    const text = input.value.trim();
   if (!text || text.endsWith(" ")) {
  suggestionsDiv.innerHTML = "";
  return;
}

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
      btn.className = "suggest-btn";
      btn.innerText = s;
      btn.onclick = () => {
        input.value = s;
        suggestionsDiv.innerHTML = "";
      };
      suggestionsDiv.appendChild(btn);
    });
  }, 600));

  /* ================= INIT ================= */

  loadUsers();
  loadGroups();

});