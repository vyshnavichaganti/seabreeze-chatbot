
const API_KEY = "YOUR_GROQ_API_KEY_HERE";
const SYSTEM_PROMPT = `You are Nova, a warm, professional property consultant for Seabreeze by Godrej Bayview, an ultra-luxury residential tower in Sector 9, Vashi, Navi Mumbai.

YOUR GOAL: Help prospects understand the project, answer their questions, and gently capture lead details — Name, Budget, and Preferred Configuration (2 BHK or 3 BHK).

TONE: Warm, knowledgeable, concise. Never salesy or pushy. Professional luxury real estate advisor.

PROJECT DETAILS:
- Name: Seabreeze by Godrej Bayview
- Developer: Godrej Properties
- Location: Sector 9, Vashi, Navi Mumbai
- Type: Premium 2 BHK & 3 BHK Residences with Private Deck
- 2 BHK: 874+ sq ft | Starting ~₹3.20 Cr onwards
- 3 BHK: 1266+ sq ft | Starting ~₹4.75 Cr onwards
- Highlights: Sea & City views, Private Decks, 52+ amenities across 3 levels

AMENITIES — 3 themed levels:
1. LEVEL ONE RETREAT: Badminton court, Senior citizen plaza, Banquet Hall, Squash Court, Kids play area
2. E-DECK RETREAT: Swimming pool, Glass house café, Yoga Deck, Crèche, Party Lawn, Spa, Library
3. SKY RETREAT: Star Gazing Deck, Sky Yoga, Tree Court, Sky Lawn, Reflexology Pathway

LOCATION — Connectivity (travel times):
- Fr. Agnel School & Jr. College: 2 mins
- Mini Sea Shore: 2 mins
- Reliance Fresh: 4 mins
- Fortis Hiranandani Hospital: 4 mins
- Inorbit Mall: 5 mins
- Four Points by Sheraton: 5 mins
- Sion-Panvel Highway: 2 mins
- Vashi Railway Station: 6 mins
- Vashi Bus Depot: 4 mins
- Palm Beach Road: 4 mins
- Thane Belapur Road: 5 mins
- Eastern Freeway: 19 mins
- Mumbai-Pune Expressway: 20 mins
- Ghatkopar-Mulund Link Road: 15 mins

LEAD CAPTURE STRATEGY:
- After answering 2-3 questions, naturally ask for the prospect's name.
- After knowing the name, ask their budget preference (Around 3.2 Cr for 2BHK or 4.75 Cr for 3BHK?).
- After budget, ask preferred configuration (2BHK or 3BHK).
- If all 3 are captured, thank them warmly and say a consultant will reach out shortly.
- Never ask all 3 in one message — spread it naturally across the conversation.

YOUR NAME: You are Nova. If anyone asks who you are, say "I'm Nova, your virtual property consultant for Seabreeze by Godrej Bayview."

RESPONSE FORMAT: Keep replies concise (3-6 sentences max unless listing specs). Use **bold** for key terms. Add a 🌊 or relevant emoji occasionally for warmth. Never fabricate details not in the knowledge base.`;

const QUICK_CHIPS = [
  ["💰 Pricing", "What are the pricing details for 2 and 3 BHK?"],
  ["🏊 Amenities", "Tell me about the amenities"],
  ["📍 Location", "What are the location advantages?"],
  ["🏠 Configurations", "What flat configurations are available?"],
  ["📞 Site Visit", "I'd like to schedule a site visit"],
];

let history = [];
let chipsShown = false;

function addMessage(role, text) {
  const wrap = document.getElementById('messages');
  const div = document.createElement('div');
  div.className = `msg ${role}`;
  const initial = role === 'bot' ? '🌊' : 'You';
  const formatted = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    .replace(/\n/g, '<br>');
  div.innerHTML = `<div class="avatar">${initial}</div><div class="bubble">${formatted}</div>`;
  wrap.appendChild(div);
  wrap.scrollTop = wrap.scrollHeight;
}

function showTyping() {
  const wrap = document.getElementById('messages');
  const div = document.createElement('div');
  div.className = 'msg bot';
  div.id = 'typing-indicator';
  div.innerHTML = `<div class="avatar">🌊</div><div class="typing-bubble"><div class="typing"><span></span><span></span><span></span></div></div>`;
  wrap.appendChild(div);
  wrap.scrollTop = wrap.scrollHeight;
}

function removeTyping() {
  const el = document.getElementById('typing-indicator');
  if (el) el.remove();
}

function showChips() {
  if (chipsShown) return;
  chipsShown = true;
  const wrap = document.getElementById('messages');
  const div = document.createElement('div');
  div.className = 'chips-wrap';
  div.id = 'quick-chips';
  QUICK_CHIPS.forEach(([label, msg]) => {
    const btn = document.createElement('button');
    btn.className = 'chip';
    btn.textContent = label;
    btn.onclick = () => {
      document.getElementById('quick-chips')?.remove();
      sendMessage(msg);
    };
    div.appendChild(btn);
  });
  wrap.appendChild(div);
  wrap.scrollTop = wrap.scrollHeight;
}

async function callGroq(userText) {
  history.push({ role: 'user', content: userText });
  showTyping();
  try {
    const resp = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1000,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...history
        ]
      })
    });
    const data = await resp.json();
    const reply = data.choices?.[0]?.message?.content
      || "Sorry, I couldn't get a response. Please try again.";
    history.push({ role: 'assistant', content: reply });
    removeTyping();
    addMessage('bot', reply);
  } catch(e) {
    removeTyping();
    addMessage('bot', "I'm having a connectivity issue. Please refresh and try again.");
  }
}

async function sendMessage(overrideText) {
  const input = document.getElementById('userInput');
  const text = overrideText || input.value.trim();
  if (!text) return;
  input.value = '';
  input.style.height = 'auto';
  addMessage('user', text);
  await callGroq(text);
}

// Auto-resize textarea
document.getElementById('userInput').addEventListener('input', function() {
  this.style.height = 'auto';
  this.style.height = Math.min(this.scrollHeight, 100) + 'px';
});

// Enter to send
document.getElementById('userInput').addEventListener('keydown', e => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Greeting on load
window.addEventListener('load', () => {
  const greet = `Welcome to **Seabreeze by Godrej Bayview**, Vashi! 🌊\n\nI'm Nova, your virtual property consultant for this exclusive ultra-luxury tower. Whether you're curious about **floor plans, pricing, amenities**, or want to schedule a site visit — I'm here to help.\n\nWhat would you like to know first?`;
  addMessage('bot', greet);
  showChips();
});