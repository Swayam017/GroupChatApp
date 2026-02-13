document.addEventListener("DOMContentLoaded", () => {

  const token = localStorage.getItem("token");

  if (!token) {
    alert("Please login first");
    window.location.href = "index.html";
    return;
  }

  // Decode JWT safely
  const payload = JSON.parse(atob(token.split(".")[1]));
  const userId = payload.userId;

  const otherUserId = userId === 1 ? 2 : 1;


  const messagesDiv = document.getElementById("messages");
  const input = document.getElementById("msgInput");
  const sendBtn = document.getElementById("sendBtn");

 const socket = io("http://localhost:3000", {
  auth: {
    token: token
  }
});


  async function loadMessages() {
    const res = await fetch(
      `http://localhost:3000/api/chat/${userId}/${otherUserId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
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


  function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    socket.emit("chat-message", {
      senderId: userId,
      receiverId: otherUserId,
      content: text
    });

    input.value = "";
  }

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
