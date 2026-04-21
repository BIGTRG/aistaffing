/**
 * AI Staffing Agency - Chat Widget
 * Embed on any website with:
 * <script src="https://[domain]/widget.js" data-deployment="DEPLOYMENT_ID"></script>
 */
(function () {
  const script = document.currentScript;
  const deploymentId = script?.getAttribute("data-deployment");
  const API_BASE = script?.getAttribute("data-api") || "https://formal-ibex-296.convex.site";
  const BRAND_COLOR = script?.getAttribute("data-color") || "#0f172a";
  const ACCENT_COLOR = script?.getAttribute("data-accent") || "#d97706";

  if (!deploymentId) {
    console.error("[AI Staffing] Missing data-deployment attribute");
    return;
  }

  const sessionId = (() => {
    let id = sessionStorage.getItem("aisa_session");
    if (!id) {
      id = "s_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem("aisa_session", id);
    }
    return id;
  })();

  let agentName = "AI Assistant";
  let isOpen = false;
  let messages = [];
  let isLoading = false;

  // ── Styles ──
  const css = `
    #aisa-widget-container * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    #aisa-bubble { position: fixed; bottom: 24px; right: 24px; width: 60px; height: 60px; border-radius: 50%; background: ${BRAND_COLOR}; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 20px rgba(0,0,0,0.3); z-index: 999998; transition: transform 0.2s; }
    #aisa-bubble:hover { transform: scale(1.1); }
    #aisa-bubble svg { width: 28px; height: 28px; fill: white; }
    #aisa-panel { position: fixed; bottom: 96px; right: 24px; width: 380px; max-height: 520px; background: white; border-radius: 16px; box-shadow: 0 8px 40px rgba(0,0,0,0.2); z-index: 999999; display: none; flex-direction: column; overflow: hidden; }
    #aisa-panel.open { display: flex; }
    #aisa-header { background: ${BRAND_COLOR}; color: white; padding: 16px 20px; display: flex; align-items: center; gap: 12px; }
    #aisa-header-dot { width: 10px; height: 10px; border-radius: 50%; background: #22c55e; }
    #aisa-header-name { font-weight: 600; font-size: 15px; }
    #aisa-header-status { font-size: 12px; opacity: 0.8; }
    #aisa-header-close { margin-left: auto; cursor: pointer; opacity: 0.7; font-size: 20px; color: white; background: none; border: none; }
    #aisa-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; min-height: 280px; max-height: 340px; }
    .aisa-msg { max-width: 85%; padding: 10px 14px; border-radius: 12px; font-size: 14px; line-height: 1.5; word-wrap: break-word; }
    .aisa-msg.assistant { background: #f1f5f9; color: #1e293b; align-self: flex-start; border-bottom-left-radius: 4px; }
    .aisa-msg.user { background: ${BRAND_COLOR}; color: white; align-self: flex-end; border-bottom-right-radius: 4px; }
    .aisa-typing { align-self: flex-start; background: #f1f5f9; padding: 12px 18px; border-radius: 12px; }
    .aisa-typing span { display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: #94a3b8; margin: 0 2px; animation: aisa-bounce 1.4s infinite ease-in-out; }
    .aisa-typing span:nth-child(1) { animation-delay: 0s; }
    .aisa-typing span:nth-child(2) { animation-delay: 0.2s; }
    .aisa-typing span:nth-child(3) { animation-delay: 0.4s; }
    @keyframes aisa-bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
    #aisa-input-area { padding: 12px 16px; border-top: 1px solid #e2e8f0; display: flex; gap: 8px; }
    #aisa-input { flex: 1; border: 1px solid #e2e8f0; border-radius: 24px; padding: 10px 16px; font-size: 14px; outline: none; }
    #aisa-input:focus { border-color: ${ACCENT_COLOR}; }
    #aisa-send { width: 40px; height: 40px; border-radius: 50%; background: ${BRAND_COLOR}; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; }
    #aisa-send:disabled { opacity: 0.5; cursor: not-allowed; }
    #aisa-send svg { width: 18px; height: 18px; fill: white; }
    #aisa-powered { text-align: center; padding: 6px; font-size: 11px; color: #94a3b8; }
    #aisa-powered a { color: ${ACCENT_COLOR}; text-decoration: none; }
  `;

  // ── Build Widget ──
  const container = document.createElement("div");
  container.id = "aisa-widget-container";

  const style = document.createElement("style");
  style.textContent = css;
  container.appendChild(style);

  container.innerHTML += `
    <div id="aisa-bubble" onclick="window.__aisaToggle()">
      <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H5.2L4 17.2V4h16v12z"/><path d="M7 9h2v2H7zm4 0h2v2h-2zm4 0h2v2h-2z"/></svg>
    </div>
    <div id="aisa-panel">
      <div id="aisa-header">
        <div id="aisa-header-dot"></div>
        <div>
          <div id="aisa-header-name">${agentName}</div>
          <div id="aisa-header-status">Online now</div>
        </div>
        <button id="aisa-header-close" onclick="window.__aisaToggle()">&times;</button>
      </div>
      <div id="aisa-messages"></div>
      <div id="aisa-input-area">
        <input id="aisa-input" placeholder="Type a message..." />
        <button id="aisa-send" onclick="window.__aisaSend()">
          <svg viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
      <div id="aisa-powered">Powered by <a href="https://aistaffingagency.net" target="_blank">AI Staffing Agency</a></div>
    </div>
  `;

  document.body.appendChild(container);

  // ── Functions ──
  function render() {
    const el = document.getElementById("aisa-messages");
    if (!el) return;
    el.innerHTML = messages
      .map((m) => `<div class="aisa-msg ${m.role}">${m.content}</div>`)
      .join("");
    if (isLoading) {
      el.innerHTML += '<div class="aisa-typing"><span></span><span></span><span></span></div>';
    }
    el.scrollTop = el.scrollHeight;
  }

  window.__aisaToggle = function () {
    isOpen = !isOpen;
    const panel = document.getElementById("aisa-panel");
    if (panel) panel.classList.toggle("open", isOpen);
    if (isOpen && messages.length === 0) {
      messages.push({ role: "assistant", content: `Hi there! I'm ${agentName}. How can I help you today?` });
      render();
    }
  };

  window.__aisaSend = async function () {
    const input = document.getElementById("aisa-input");
    const text = input?.value?.trim();
    if (!text || isLoading) return;

    input.value = "";
    messages.push({ role: "user", content: text });
    isLoading = true;
    render();

    try {
      const res = await fetch(API_BASE + "/widget/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deploymentId, sessionId, message: text }),
      });
      const data = await res.json();
      if (data.response) {
        messages.push({ role: "assistant", content: data.response });
        if (data.agentName) agentName = data.agentName;
      } else {
        messages.push({ role: "assistant", content: "Sorry, I'm having trouble right now. Please try again." });
      }
    } catch {
      messages.push({ role: "assistant", content: "Connection error. Please try again in a moment." });
    }

    isLoading = false;
    render();
  };

  // Enter key to send
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && document.activeElement?.id === "aisa-input") {
      window.__aisaSend();
    }
  });

  // Load config
  fetch(API_BASE + "/widget/config", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ deploymentId }),
  })
    .then((r) => r.json())
    .then((config) => {
      if (config.agentName) {
        agentName = config.agentName;
        const nameEl = document.getElementById("aisa-header-name");
        if (nameEl) nameEl.textContent = agentName;
      }
    })
    .catch(() => {});
})();
