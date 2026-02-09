document.addEventListener("DOMContentLoaded", () => {

  const userId = 1;        // later from JWT
  const otherUserId = 2;

  const messagesDiv = document.getElementById("messages");
  const input = document.getElementById("msgInput");
  const sendBtn = document.getElementById("sendBtn");

  // 🔌 Connect to WebSocket server
  const socket = io("http://localhost:3000");

  async function loadMessages() {
    const res = await fetch(
      `http://localhost:3000/api/chat/${userId}/${otherUserId}`
    );
    const messages = await res.json();
    messagesDiv.innerHTML = "";
    messages.forEach(renderMessage);
    scrollBottom();
  }

  function renderMessage(msg) {
    const div = document.createElement("div");
    div.className = msg.senderId === userId ? "sent" : "received";

    div.innerHTML = `
      <div class="bubble">
        ${msg.content}
        <span class="time">
          ${new Date(msg.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          })}
        </span>
      </div>
    `;

    messagesDiv.appendChild(div);
  }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    await fetch("http://localhost:3000/api/chat/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        senderId: userId,
        receiverId: otherUserId,
        content: text
      })
    });

    input.value = "";
  }

  // 🔥 Receive live messages
  socket.on("newMessage", (msg) => {
    if (
      (msg.senderId === userId && msg.receiverId === otherUserId) ||
      (msg.senderId === otherUserId && msg.receiverId === userId)
    ) {
      renderMessage(msg);
      scrollBottom();
    }
  });

  function scrollBottom() {
    messagesDiv.scrollTo({
      top: messagesDiv.scrollHeight,
      behavior: "smooth"
    });
  }

  sendBtn.addEventListener("click", sendMessage);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  });

  loadMessages();
});
