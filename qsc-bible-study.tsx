import { useState, useEffect, useRef } from "react";

// ── QSC Brand Colors ──────────────────────────────────────────
const C = {
  sage: "#6B8F71", sageDark: "#4a6b50", sageLight: "#8aab90",
  brown: "#7B5B3A", brownLight: "#9a7455",
  cream: "#D4C4A8", creamLight: "#ede3d0", creamDark: "#b8a888",
  white: "#FAFAF8", offWhite: "#F5F2ED",
  text: "#3a3028", textMid: "#6b5f52", textLight: "#9a8e82",
  border: "rgba(107,143,113,0.25)",
  // Golden tent palette for Daily Word
  gold: "#c8956a", goldDark: "#a3724a", goldLight: "#e0b896",
  tent: "#5c3420", tentMid: "#6b3d26", tentDark: "#4a2a18",
};

// ── Daily Word Data (one per day of week) ─────────────────────
const DAILY_ENTRIES = [
  { scripture: "She is clothed with strength and dignity, and she laughs without fear of the future.", reference: "Proverbs 31:25", quote: "Quiet strength is not the absence of struggle — it's the decision to keep going anyway.", },
  { scripture: "I can do all things through Christ who strengthens me.", reference: "Philippians 4:13", quote: "Your faith is bigger than your fear. Walk in it today.", },
  { scripture: "The Lord your God is with you, the Mighty Warrior who saves.", reference: "Zephaniah 3:17", quote: "You were never meant to carry it alone. Let go and let God lead.", },
  { scripture: "Be still and know that I am God.", reference: "Psalm 46:10", quote: "Peace isn't found in having all the answers. It's found in trusting the One who does.", },
  { scripture: "For I know the plans I have for you, plans to prosper you and not to harm you.", reference: "Jeremiah 29:11", quote: "Every season has a purpose. Even this one.", },
  { scripture: "Trust in the Lord with all your heart and lean not on your own understanding.", reference: "Proverbs 3:5", quote: "Surrender is not weakness. It is the most courageous act of faith.", },
  { scripture: "You are altogether beautiful, my darling; there is no flaw in you.", reference: "Song of Solomon 4:7", quote: "You are not too much. You are not too little. You are exactly who God made you to be.", },
];

// ── App Constants ─────────────────────────────────────────────
const TABS = [
  { id: "daily", label: "Daily Word", icon: "✦" },
  { id: "study", label: "Study", icon: "📖" },
  { id: "plan", label: "Plan", icon: "📅" },
  { id: "notes", label: "Notes", icon: "📝" },
];

const STUDY_MODES = [
  { id: "explain", label: "Explain", icon: "💡", desc: "Deep dive" },
  { id: "discuss", label: "Discuss", icon: "💬", desc: "Group questions" },
  { id: "devotional", label: "Devotional", icon: "🕊️", desc: "Personal reflection" },
  { id: "context", label: "Context", icon: "🏛️", desc: "Historical background" },
  { id: "chat", label: "Ask Anything", icon: "✨", desc: "Free Q&A" },
];

const PLAN_THEMES = [
  "Faith & Trust", "Prayer & Worship", "Forgiveness & Grace",
  "Strength & Courage", "Peace & Anxiety", "Identity in Christ",
  "Love & Relationships", "Purpose & Calling", "Grief & Healing", "Gratitude & Joy",
];

const PLAN_LENGTHS = ["5 days", "7 days", "14 days", "21 days", "30 days"];
const TRANSLATIONS = ["NIV", "ESV", "KJV", "NLT", "NKJV", "AMP", "MSG", "CSB"];

const SYSTEM_PROMPT = `You are a warm, scholarly Bible study companion for Quiet Strength Collective (QSC) — a faith community centered on quiet, deep, authentic walk with God. You combine theological depth with pastoral warmth. Always cite scripture references. Keep responses focused, encouraging, and grounded in the Word.`;

// ── API Helper ────────────────────────────────────────────────
async function askClaude(messages) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      system: SYSTEM_PROMPT,
      messages,
    }),
  });
  const data = await res.json();
  return data.content?.[0]?.text || "I'm sorry, something went wrong. Please try again.";
}

// ── Splash Screen ─────────────────────────────────────────────
function SplashScreen({ onEnter, entry }) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  const handleEnter = () => {
    setLeaving(true);
    setTimeout(onEnter, 700);
  };

  const fade = (delay) => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(18px)",
    transition: `all 0.9s ease ${delay}s`,
  });

  return (
    <div style={{
      position: "fixed", inset: 0,
      background: `linear-gradient(160deg, ${C.tentDark} 0%, ${C.tentMid} 45%, ${C.tent} 100%)`,
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", padding: "2rem",
      opacity: leaving ? 0 : 1, transition: "opacity 0.7s ease",
      overflow: "hidden",
    }}>
      {/* Background glow */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse at 30% 40%, rgba(200,149,106,0.1) 0%, transparent 60%),
          radial-gradient(ellipse at 75% 70%, rgba(200,149,106,0.07) 0%, transparent 50%)` }} />

      {/* Cross */}
      <div style={{ ...fade(0.1), fontSize: "5rem", color: C.gold, opacity: visible ? 0.18 : 0,
        fontFamily: "Georgia, serif", marginBottom: "1.5rem", userSelect: "none" }}>✝</div>

      {/* Brand name */}
      <div style={{ ...fade(0.3), textAlign: "center", marginBottom: "2rem" }}>
        <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1rem",
          letterSpacing: "0.35em", color: C.gold, textTransform: "uppercase" }}>
          Quiet Strength
        </div>
        <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1rem",
          letterSpacing: "0.35em", color: C.gold, opacity: 0.7, textTransform: "uppercase" }}>
          Collective
        </div>
      </div>

      {/* Divider */}
      <div style={{ ...fade(0.5), display: "flex", alignItems: "center", gap: "0.75rem",
        marginBottom: "2rem", width: "100%", maxWidth: "320px" }}>
        <div style={{ flex: 1, height: "1px", background: `linear-gradient(to right, transparent, rgba(200,149,106,0.4))` }} />
        <span style={{ color: C.gold, opacity: 0.5, fontSize: "0.55rem" }}>✦</span>
        <div style={{ flex: 1, height: "1px", background: `linear-gradient(to left, transparent, rgba(200,149,106,0.4))` }} />
      </div>

      {/* Scripture */}
      <div style={{ ...fade(0.7), textAlign: "center", maxWidth: "310px", marginBottom: "1.5rem" }}>
        <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1.05rem",
          color: "#f5e6d3", lineHeight: 1.7, fontStyle: "italic", margin: "0 0 0.6rem 0" }}>
          "{entry.scripture}"
        </p>
        <p style={{ fontFamily: "Georgia, serif", fontSize: "0.72rem", color: C.gold,
          letterSpacing: "0.15em", margin: 0 }}>— {entry.reference}</p>
      </div>

      {/* QSC Quote */}
      <div style={{ ...fade(0.9), textAlign: "center", maxWidth: "290px",
        background: "rgba(200,149,106,0.08)", border: "1px solid rgba(200,149,106,0.18)",
        borderRadius: "3px", padding: "1rem 1.25rem", marginBottom: "2.5rem" }}>
        <p style={{ fontFamily: "Georgia, serif", fontSize: "0.82rem", color: "#d4b896",
          lineHeight: 1.65, margin: "0 0 0.4rem 0", fontStyle: "italic" }}>
          {entry.quote}
        </p>
        <p style={{ fontSize: "0.62rem", color: C.gold, letterSpacing: "0.15em",
          margin: 0, opacity: 0.7 }}>— Quiet Strength Collective</p>
      </div>

      {/* Enter button */}
      <button onClick={handleEnter} style={{
        ...fade(1.1),
        background: "transparent", border: `1px solid rgba(200,149,106,0.5)`,
        color: C.gold, padding: "0.7rem 2.5rem",
        fontFamily: "Georgia, serif", fontSize: "0.72rem",
        letterSpacing: "0.25em", textTransform: "uppercase",
        cursor: "pointer", borderRadius: "1px",
      }}
        onMouseEnter={e => { e.target.style.background = "rgba(200,149,106,0.15)"; }}
        onMouseLeave={e => { e.target.style.background = "transparent"; }}
      >Enter</button>
    </div>
  );
}

// ── Daily Word Tab ────────────────────────────────────────────
function DailyWordTab({ entry }) {
  return (
    <div style={{ padding: "1.5rem" }}>
      <div style={{ fontSize: "0.6rem", letterSpacing: "0.25em", color: C.textLight,
        textTransform: "uppercase", marginBottom: "1rem" }}>
        {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
      </div>

      {/* Scripture card */}
      <div style={{ background: `linear-gradient(150deg, ${C.tentDark} 0%, ${C.tentMid} 100%)`,
        borderRadius: "10px", padding: "1.75rem 1.5rem", marginBottom: "1rem",
        border: `1px solid rgba(200,149,106,0.18)`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", bottom: "10px", right: "10px", fontSize: "3rem",
          color: "rgba(200,149,106,0.06)", fontFamily: "Georgia, serif", userSelect: "none",
          pointerEvents: "none", zIndex: 0 }}>✝</div>
        <div style={{ fontSize: "0.6rem", letterSpacing: "0.28em", color: C.gold,
          textTransform: "uppercase", marginBottom: "1.2rem" }}>✦ Today's Word ✦</div>
        <p style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "1rem",
          color: "#f5e6d3", lineHeight: 1.75, fontStyle: "italic", margin: "0 0 0.5rem 0" }}>
          "{entry.scripture}"
        </p>
        <p style={{ fontSize: "0.7rem", color: C.gold, letterSpacing: "0.1em",
          margin: "0 0 1.5rem 0", fontFamily: "Georgia, serif" }}>— {entry.reference}</p>
        <div style={{ height: "1px", background: "linear-gradient(to right, transparent, rgba(200,149,106,0.3), transparent)", margin: "0 0 1.2rem 0" }} />
        <p style={{ fontFamily: "Georgia, serif", fontSize: "0.85rem", color: "#d4b896",
          lineHeight: 1.65, margin: "0 0 0.4rem 0", fontStyle: "italic" }}>"{entry.quote}"</p>
        <p style={{ fontSize: "0.62rem", color: C.gold, opacity: 0.7, margin: 0, letterSpacing: "0.1em" }}>
          — Quiet Strength Collective
        </p>
      </div>

      {/* Journal prompt */}
      <div style={{ background: C.offWhite, border: `1px solid ${C.border}`,
        borderRadius: "10px", padding: "1.25rem" }}>
        <div style={{ fontSize: "0.6rem", letterSpacing: "0.2em", color: C.sage,
          textTransform: "uppercase", marginBottom: "0.6rem" }}>Reflect & Journal</div>
        <p style={{ fontSize: "0.8rem", color: C.textMid, lineHeight: 1.6,
          margin: "0 0 0.75rem 0" }}>
          How does today's word speak to where you are right now?
        </p>
        <textarea style={{ width: "100%", minHeight: "80px", background: C.white,
          border: `1px solid ${C.border}`, borderRadius: "6px", padding: "0.6rem",
          fontFamily: "Georgia, serif", fontSize: "0.8rem", color: C.text,
          resize: "vertical", boxSizing: "border-box" }}
          placeholder="Write your thoughts here..." />
      </div>
    </div>
  );
}

// ── Study Tab ─────────────────────────────────────────────────
function StudyTab() {
  const [passage, setPassage] = useState("");
  const [mode, setMode] = useState("explain");
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleStudy = async () => {
    const input = mode === "chat" ? question : passage;
    if (!input.trim()) return;
    const modeObj = STUDY_MODES.find(m => m.id === mode);
    let prompt = mode === "chat"
      ? question
      : `${modeObj.label} this passage: "${passage}"`;
    const newMessages = [...messages, { role: "user", content: prompt }];
    setMessages(newMessages);
    setLoading(true);
    if (mode !== "chat") setQuestion("");
    try {
      const reply = await askClaude(newMessages);
      setMessages([...newMessages, { role: "assistant", content: reply }]);
    } catch { setMessages([...newMessages, { role: "assistant", content: "Unable to connect. Please try again." }]); }
    setLoading(false);
  };

  return (
    <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div>
        <label style={{ fontSize: "0.65rem", letterSpacing: "0.15em", color: C.textLight,
          textTransform: "uppercase", display: "block", marginBottom: "0.4rem" }}>
          Scripture Passage
        </label>
        <input value={passage} onChange={e => setPassage(e.target.value)}
          placeholder="e.g. John 3:16 or Psalm 23"
          style={{ width: "100%", padding: "0.65rem 0.85rem", border: `1px solid ${C.border}`,
            borderRadius: "6px", fontFamily: "Georgia, serif", fontSize: "0.9rem",
            color: C.text, background: C.white, boxSizing: "border-box" }} />
      </div>

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {STUDY_MODES.map(m => (
          <button key={m.id} onClick={() => setMode(m.id)} style={{
            padding: "0.45rem 0.85rem", borderRadius: "20px", cursor: "pointer",
            fontFamily: "Georgia, serif", fontSize: "0.75rem",
            background: mode === m.id ? C.sage : C.offWhite,
            color: mode === m.id ? C.white : C.textMid,
            border: `1px solid ${mode === m.id ? C.sage : C.border}`,
            transition: "all 0.2s",
          }}>{m.icon} {m.label}</button>
        ))}
      </div>

      {mode === "chat" && (
        <textarea value={question} onChange={e => setQuestion(e.target.value)}
          placeholder="Ask any Bible question..."
          style={{ width: "100%", minHeight: "70px", padding: "0.65rem 0.85rem",
            border: `1px solid ${C.border}`, borderRadius: "6px", fontFamily: "Georgia, serif",
            fontSize: "0.85rem", color: C.text, background: C.white,
            resize: "vertical", boxSizing: "border-box" }} />
      )}

      <button onClick={handleStudy} disabled={loading} style={{
        background: loading ? C.sageLight : C.sage, color: C.white,
        border: "none", padding: "0.75rem", borderRadius: "8px",
        fontFamily: "Georgia, serif", fontSize: "0.85rem", letterSpacing: "0.1em",
        cursor: loading ? "not-allowed" : "pointer", transition: "background 0.2s",
      }}>{loading ? "Studying…" : "Study This Passage ✦"}</button>

      {messages.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {messages.map((m, i) => (
            <div key={i} style={{
              padding: "0.85rem 1rem", borderRadius: "8px",
              background: m.role === "user" ? C.offWhite : C.white,
              border: `1px solid ${m.role === "user" ? C.border : C.border}`,
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "90%",
            }}>
              {m.role === "assistant" && (
                <div style={{ fontSize: "0.6rem", color: C.sage, letterSpacing: "0.15em",
                  textTransform: "uppercase", marginBottom: "0.4rem" }}>QSC Study ✦</div>
              )}
              <p style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: "0.85rem",
                color: C.text, lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{m.content}</p>
            </div>
          ))}
          {loading && (
            <div style={{ padding: "0.85rem 1rem", borderRadius: "8px",
              background: C.white, border: `1px solid ${C.border}`, maxWidth: "90%" }}>
              <p style={{ margin: 0, color: C.textLight, fontFamily: "Georgia, serif",
                fontSize: "0.85rem" }}>Searching the Word…</p>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      )}
    </div>
  );
}

// ── Reading Plan Tab ──────────────────────────────────────────
function PlanTab() {
  const [theme, setTheme] = useState(PLAN_THEMES[0]);
  const [length, setLength] = useState("7 days");
  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(false);

  const generatePlan = async () => {
    setLoading(true); setPlan("");
    try {
      const result = await askClaude([{
        role: "user",
        content: `Create a ${length} Bible reading plan focused on "${theme}". For each day provide: Day number, a scripture passage to read, a key verse, and a one-sentence reflection prompt. Format clearly.`,
      }]);
      setPlan(result);
    } catch { setPlan("Unable to generate plan. Please try again."); }
    setLoading(false);
  };

  return (
    <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div>
        <label style={{ fontSize: "0.65rem", letterSpacing: "0.15em", color: C.textLight,
          textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>Theme</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
          {PLAN_THEMES.map(t => (
            <button key={t} onClick={() => setTheme(t)} style={{
              padding: "0.4rem 0.75rem", borderRadius: "20px", cursor: "pointer",
              fontFamily: "Georgia, serif", fontSize: "0.72rem",
              background: theme === t ? C.brown : C.offWhite,
              color: theme === t ? C.white : C.textMid,
              border: `1px solid ${theme === t ? C.brown : C.border}`,
              transition: "all 0.2s",
            }}>{t}</button>
          ))}
        </div>
      </div>

      <div>
        <label style={{ fontSize: "0.65rem", letterSpacing: "0.15em", color: C.textLight,
          textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>Length</label>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
          {PLAN_LENGTHS.map(l => (
            <button key={l} onClick={() => setLength(l)} style={{
              padding: "0.4rem 0.75rem", borderRadius: "20px", cursor: "pointer",
              fontFamily: "Georgia, serif", fontSize: "0.72rem",
              background: length === l ? C.sage : C.offWhite,
              color: length === l ? C.white : C.textMid,
              border: `1px solid ${length === l ? C.sage : C.border}`,
              transition: "all 0.2s",
            }}>{l}</button>
          ))}
        </div>
      </div>

      <button onClick={generatePlan} disabled={loading} style={{
        background: loading ? C.sageLight : C.sage, color: C.white, border: "none",
        padding: "0.75rem", borderRadius: "8px", fontFamily: "Georgia, serif",
        fontSize: "0.85rem", letterSpacing: "0.1em",
        cursor: loading ? "not-allowed" : "pointer", transition: "background 0.2s",
      }}>{loading ? "Creating Plan…" : "Generate Reading Plan ✦"}</button>

      {plan && (
        <div style={{ background: C.white, border: `1px solid ${C.border}`,
          borderRadius: "10px", padding: "1.25rem" }}>
          <div style={{ fontSize: "0.6rem", color: C.sage, letterSpacing: "0.2em",
            textTransform: "uppercase", marginBottom: "0.75rem" }}>
            {length} Plan — {theme}
          </div>
          <p style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: "0.85rem",
            color: C.text, lineHeight: 1.75, whiteSpace: "pre-wrap" }}>{plan}</p>
        </div>
      )}
    </div>
  );
}

// ── Notes Tab ─────────────────────────────────────────────────
function NotesTab() {
  const [notes, setNotes] = useState(() => {
    try { return JSON.parse(localStorage.getItem("qsc_notes") || "[]"); } catch { return []; }
  });
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  const saveNote = () => {
    if (!body.trim()) return;
    const note = { id: Date.now(), title: title || "Untitled", body, date: new Date().toLocaleDateString() };
    const updated = [note, ...notes];
    setNotes(updated);
    try { localStorage.setItem("qsc_notes", JSON.stringify(updated)); } catch {}
    setTitle(""); setBody("");
  };

  const deleteNote = (id) => {
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    try { localStorage.setItem("qsc_notes", JSON.stringify(updated)); } catch {}
  };

  return (
    <div style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div style={{ background: C.offWhite, border: `1px solid ${C.border}`,
        borderRadius: "10px", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
        <div style={{ fontSize: "0.6rem", letterSpacing: "0.2em", color: C.sage,
          textTransform: "uppercase" }}>New Note</div>
        <input value={title} onChange={e => setTitle(e.target.value)}
          placeholder="Title (optional)"
          style={{ padding: "0.55rem 0.75rem", border: `1px solid ${C.border}`,
            borderRadius: "6px", fontFamily: "Georgia, serif", fontSize: "0.85rem",
            color: C.text, background: C.white }} />
        <textarea value={body} onChange={e => setBody(e.target.value)}
          placeholder="Write your study notes, prayers, or reflections…"
          style={{ minHeight: "90px", padding: "0.6rem 0.75rem",
            border: `1px solid ${C.border}`, borderRadius: "6px",
            fontFamily: "Georgia, serif", fontSize: "0.85rem", color: C.text,
            background: C.white, resize: "vertical" }} />
        <button onClick={saveNote} style={{
          background: C.sage, color: C.white, border: "none", padding: "0.65rem",
          borderRadius: "6px", fontFamily: "Georgia, serif", fontSize: "0.8rem",
          cursor: "pointer", letterSpacing: "0.1em",
        }}>Save Note ✦</button>
      </div>

      {notes.length === 0 && (
        <p style={{ textAlign: "center", color: C.textLight, fontFamily: "Georgia, serif",
          fontSize: "0.85rem", fontStyle: "italic" }}>Your notes will appear here.</p>
      )}

      {notes.map(note => (
        <div key={note.id} style={{ background: C.white, border: `1px solid ${C.border}`,
          borderRadius: "10px", padding: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
            <div>
              <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontSize: "0.95rem",
                color: C.text, marginBottom: "0.2rem" }}>{note.title}</div>
              <div style={{ fontSize: "0.62rem", color: C.textLight, letterSpacing: "0.1em" }}>{note.date}</div>
            </div>
            <button onClick={() => deleteNote(note.id)} style={{
              background: "none", border: "none", cursor: "pointer",
              color: C.textLight, fontSize: "1rem", padding: "0",
            }}>🗑</button>
          </div>
          <p style={{ margin: 0, fontFamily: "Georgia, serif", fontSize: "0.83rem",
            color: C.textMid, lineHeight: 1.65, whiteSpace: "pre-wrap" }}>{note.body}</p>
        </div>
      ))}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────
export default function QSCBibleApp() {
  const [showSplash, setShowSplash] = useState(true);
  const [tab, setTab] = useState("daily");
  const dayIndex = new Date().getDay();
  const entry = DAILY_ENTRIES[dayIndex];

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning 🌅";
    if (h < 17) return "Good afternoon ☀️";
    return "Good evening 🌙";
  };

  if (showSplash) return <SplashScreen onEnter={() => setShowSplash(false)} entry={entry} />;

  return (
    <div style={{ maxWidth: "420px", margin: "0 auto", minHeight: "100vh",
      background: C.offWhite, display: "flex", flexDirection: "column",
      fontFamily: "Georgia, serif" }}>

      {/* Header */}
      <div style={{ background: C.white, padding: "1.25rem 1.5rem 1rem",
        borderBottom: `1px solid ${C.border}`, position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ fontSize: "0.58rem", letterSpacing: "0.3em", color: C.sage,
          textTransform: "uppercase", marginBottom: "0.2rem" }}>
          Quiet Strength Collective
        </div>
        <div style={{ fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: "1.35rem", color: C.text }}>{greeting()}</div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {tab === "daily" && <DailyWordTab entry={entry} />}
        {tab === "study" && <StudyTab />}
        {tab === "plan" && <PlanTab />}
        {tab === "notes" && <NotesTab />}
      </div>

      {/* Bottom Nav */}
      <div style={{ background: C.white, borderTop: `1px solid ${C.border}`,
        display: "flex", position: "sticky", bottom: 0 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: "0.7rem 0.4rem", background: "none", border: "none",
            cursor: "pointer", display: "flex", flexDirection: "column",
            alignItems: "center", gap: "0.2rem",
            color: tab === t.id ? C.sage : C.textLight,
            borderTop: `2px solid ${tab === t.id ? C.sage : "transparent"}`,
            transition: "all 0.2s",
          }}>
            <span style={{ fontSize: "1.1rem" }}>{t.icon}</span>
            <span style={{ fontSize: "0.52rem", letterSpacing: "0.08em",
              textTransform: "uppercase" }}>{t.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
