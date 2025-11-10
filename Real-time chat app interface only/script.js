// ====== Real-Time Chat App (Frontend Only) ======
const STORAGE_KEY = "chatApp_v1";
const THEME_KEY = "chatTheme_v1";

const convList = document.getElementById("conversations");
const messages = document.getElementById("messages");
const textInput = document.getElementById("textInput");
const sendBtn = document.getElementById("sendBtn");
const newChatBtn = document.getElementById("newChatBtn");
const themeToggle = document.getElementById("themeToggle");
const clearBtn = document.getElementById("clearBtn");
const renameBtn = document.getElementById("renameBtn");
const clearAllBtn = document.getElementById("clearAll");

let state = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
  conversations: [],
  currentId: null,
};

// Ensure at least one chat
if (state.conversations.length === 0) newConversation("New Chat");

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

// Create new chat
function newConversation(name) {
  const conv = {
    id: Date.now().toString(),
    name,
    messages: [],
  };
  state.conversations.unshift(conv);
  state.currentId = conv.id;
  saveState();
  renderConversations();
  renderMessages();
}

// Get current chat
function currentChat() {
  return state.conversations.find(c => c.id === state.currentId);
}

// Render sidebar
function renderConversations() {
  convList.innerHTML = "";
  state.conversations.forEach(conv => {
    const div = document.createElement("div");
    div.className = "conv" + (conv.id === state.currentId ? " active" : "");

    div.innerHTML = `
      <div class="conv-left" style="display:flex;gap:10px;align-items:center;">
        <div class="icon">C</div>
        <div>
          <div style="font-weight:600;">${conv.name}</div>
          <div class="meta">${conv.messages.length} messages</div>
        </div>
      </div>
      <div class="conv-actions">
        <button class="icon-btn rename">✏️</button>
        <button class="icon-btn delete">🗑️</button>
      </div>
    `;

    div.querySelector(".conv-left").onclick = () => {
      state.currentId = conv.id;
      saveState();
      renderConversations();
      renderMessages();
    };

    div.querySelector(".rename").onclick = e => {
      e.stopPropagation();
      const name = prompt("Rename chat:", conv.name);
      if (name) conv.name = name;
      saveState();
      renderConversations();
    };

    div.querySelector(".delete").onclick = e => {
      e.stopPropagation();
      if (confirm("Delete this conversation?")) {
        state.conversations = state.conversations.filter(c => c.id !== conv.id);
        if (state.currentId === conv.id)
          state.currentId = state.conversations[0]?.id || null;
        saveState();
        renderConversations();
        renderMessages();
      }
    };

    convList.appendChild(div);
  });
}

// Render messages
function renderMessages() {
  messages.innerHTML = "";
  const chat = currentChat();
  if (!chat) return;
  chat.messages.forEach(msg => appendMessage(msg));
}

// Add message
function appendMessage(msg) {
  const div = document.createElement("div");
  div.className = `msg ${msg.sender}`;
  div.innerHTML = `
    <div>${msg.text}</div>
    <span class="meta">${new Date(msg.time).toLocaleTimeString()}</span>
  `;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

// Send message
sendBtn.onclick = () => {
  const text = textInput.value.trim();
  if (!text) return;
  const msg = {
    sender: "sent",
    text,
    time: Date.now(),
  };
  currentChat().messages.push(msg);
  saveState();
  appendMessage(msg);
  textInput.value = "";
  autoReply(text);
};

// Auto reply (simulated Gemini/GPT)
function autoReply(text) {
  setTimeout(() => {
    const reply = generateReply(text);
    const msg = {
      sender: "recv",
      text: reply,
      time: Date.now(),
    };
    currentChat().messages.push(msg);
    saveState();
    appendMessage(msg);
  }, 800);
}

// Simple bot responses
function generateReply(t) {
  const s = t.toLowerCase();
  if (s.includes("hello") || s.includes("hi")) return "Hi there! 👋 How can I assist you today?";
  if (s.includes("time")) return "The current time is " + new Date().toLocaleTimeString();
  if (s.includes("date")) return "Today is " + new Date().toLocaleDateString();
  if (s.includes("joke")) return "Why do programmers love dark mode? Because light attracts bugs!";
  if (s.includes("calc")) {
    const expr = s.replace("calc", "").trim();
    try {
      return "Result: " + eval(expr);
    } catch {
      return "I couldn’t calculate that. Try 'calc 2+2'.";
    }
  }
  return "Interesting! Tell me more.";
}

// Buttons
newChatBtn.onclick = () => newConversation("New Chat");
clearBtn.onclick = () => {
  if (confirm("Clear messages in this chat?")) {
    currentChat().messages = [];
    saveState();
    renderMessages();
  }
};
renameBtn.onclick = () => {
  const chat = currentChat();
  if (!chat) return;
  const name = prompt("Rename chat:", chat.name);
  if (name) chat.name = name;
  saveState();
  renderConversations();
};
clearAllBtn.onclick = () => {
  if (confirm("Delete all chats?")) {
    state.conversations = [];
    state.currentId = null;
    saveState();
    renderConversations();
    renderMessages();
  }
};

// Theme toggle
themeToggle.onclick = () => {
  document.body.classList.toggle("light");
  const mode = document.body.classList.contains("light") ? "light" : "dark";
  localStorage.setItem(THEME_KEY, mode);
};
if (localStorage.getItem(THEME_KEY) === "light")
  document.body.classList.add("light");

// Initial render
renderConversations();
renderMessages();
