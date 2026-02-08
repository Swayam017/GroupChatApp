document.addEventListener("DOMContentLoaded", () => {

  const userId = 1;
  const otherUserId = 2;

  const messagesDiv = document.getElementById("messages");
  const input = document.getElementById("msgInput");
  const sendBtn = document.getElementById("sendBtn");

  // SAFETY CHECK (optional but helpful)
  if (!messagesDiv || !input || !sendBtn) {
    console.error("Chat elements not found in DOM");
    return;
  }

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

    const res = await fetch("http://localhost:3000/api/chat/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        senderId: userId,
        receiverId: otherUserId,
        content: text
      })
    });

    const msg = await res.json();
    renderMessage(msg);
    scrollBottom();
    input.value = "";
  }

  function scrollBottom() {
    messagesDiv.scrollTo({
      top: messagesDiv.scrollHeight,
      behavior: "smooth"
    });
  }

  // EVENTS
  sendBtn.addEventListener("click", sendMessage);

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  });

  loadMessages();
});
