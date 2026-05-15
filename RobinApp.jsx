/**
 * Robin — Interactive Prototype v3
 * Font: IBM Plex Mono  |  Live Chat (Anthropic API)  |  Live weather (Open-Meteo)
 * Voice mic (Web Speech API)  |  Briefing playback (SpeechSynthesis)
 */
const { useState, useEffect, useRef } = React;

const F   = "'IBM Plex Mono', monospace";
const FH  = "'Rokkitt', serif"; // headline stand-in for Lubalin Graph Medium
const INK = "#141414";
const MUT = "rgba(20,20,20,0.7)";
const DIM = "#8c8c8c";
const BDR = "#d9d9d9";
const WHT = "#ffffff";
const RED = "#BF1E2D";
const GRN = "#268c4d";

// ─── Grid + Container design system tokens ───
const EGG      = "#5BBFC7";                   // robin's egg blue
const EGG_BDR  = "rgba(91,191,199,0.7)";      // container border
const EGG_DIV  = "rgba(91,191,199,0.22)";     // internal dividers
const GROUND   = "#F6F4EF";                   // warm off-white
const NAV_ICON = "#141414";                   // bottom-nav icons (black)

const s = (sz, color=INK, weight="normal", ls=0) => ({
  fontFamily:F, fontSize:sz, color, fontWeight:weight,
  margin:0, padding:0, letterSpacing:ls?`${ls}px`:undefined, lineHeight:"normal",
});

const wmoCondition = c => {
  if(c===0)return"Clear Sky"; if(c<=2)return"Partly Cloudy"; if(c===3)return"Overcast";
  if(c<=49)return"Foggy"; if(c<=59)return"Drizzle"; if(c<=69)return"Rainy";
  if(c<=79)return"Snowy"; if(c<=82)return"Showers"; if(c<=86)return"Snow Showers";
  return c<=99?"Thunderstorm":"Mixed";
};

// Format a Google Calendar start string ("2026-05-13T17:00:00-07:00" or
// "2026-05-13" for all-day) into a short display string like "10am", "3:30pm",
// or "all day".
const formatEventTime = (startIso, allDay) => {
  if (allDay) return "all day";
  const d = new Date(startIso);
  if (isNaN(d.getTime())) return "";
  const hh = d.getHours();
  const mm = d.getMinutes();
  const period = hh >= 12 ? "pm" : "am";
  const hour12 = hh % 12 || 12;
  return mm === 0 ? `${hour12}${period}` : `${hour12}:${String(mm).padStart(2,"0")}${period}`;
};

// True if an event (allDay or timed) falls on the user's local "date" (1-31 in viewMonth/viewYear).
const eventIsOnLocalDay = (ev, year, month, day) => {
  if (!ev.start) return false;
  const d = ev.allDay ? new Date(ev.start + "T00:00:00") : new Date(ev.start);
  if (isNaN(d.getTime())) return false;
  return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
};

// ─── NAV ICONS (exact Figma paths) ───────────────────────────
const NavIcon = ({id}) => {
  if(id==="home") return(
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <path d="M13.4381 19.8835C13.8162 19.8836 14.1227 20.19 14.1227 20.5681V23.6238C14.1225 24.0018 13.8161 24.3083 13.4381 24.3083C13.06 24.3083 12.7537 24.0018 12.7535 23.6238V20.5681C12.7535 20.1899 13.0599 19.8835 13.4381 19.8835ZM7.5553 18.3523C7.82268 18.0849 8.25662 18.085 8.52405 18.3523C8.79115 18.6197 8.79136 19.0537 8.52405 19.321L6.38538 21.4597C6.11805 21.7269 5.68404 21.7268 5.41663 21.4597C5.14935 21.1923 5.14933 20.7584 5.41663 20.491L7.5553 18.3523ZM18.3512 18.3523C18.6186 18.0849 19.0525 18.0849 19.3199 18.3523L21.4586 20.491C21.726 20.7584 21.726 21.1923 21.4586 21.4597C21.1912 21.7267 20.7571 21.727 20.4899 21.4597L18.3512 19.321C18.0839 19.0538 18.0842 18.6197 18.3512 18.3523ZM13.4381 9.36401C15.9131 9.36408 17.9195 11.3705 17.9196 13.8455C17.9196 16.3205 15.9131 18.3268 13.4381 18.3269C10.9631 18.3269 8.95667 16.3205 8.95667 13.8455C8.95673 11.3705 10.9631 9.36404 13.4381 9.36401ZM13.4381 10.7332C11.7195 10.7332 10.3259 12.1268 10.3258 13.8455C10.3258 15.5641 11.7195 16.9577 13.4381 16.9578C15.1567 16.9577 16.5504 15.5641 16.5504 13.8455C16.5504 12.1269 15.1567 10.7332 13.4381 10.7332ZM6.30823 12.7537C6.68637 12.7537 6.9928 13.0601 6.9928 13.4382C6.99276 13.8164 6.68635 14.1228 6.30823 14.1228H3.25256C2.87458 14.1226 2.56803 13.8163 2.56799 13.4382C2.56799 13.0602 2.87455 12.7539 3.25256 12.7537H6.30823ZM23.6237 12.7537C24.0017 12.7539 24.3082 13.0602 24.3082 13.4382C24.3082 13.8162 24.0016 14.1226 23.6237 14.1228H20.568C20.1898 14.1228 19.8835 13.8164 19.8834 13.4382C19.8834 13.06 20.1898 12.7537 20.568 12.7537H23.6237ZM5.41663 5.41675C5.68405 5.14938 6.11797 5.14935 6.38538 5.41675L8.52405 7.55542C8.79128 7.82284 8.79136 8.2568 8.52405 8.52417C8.25668 8.79153 7.82273 8.79142 7.5553 8.52417L5.41663 6.3855C5.14921 6.11808 5.14921 5.68417 5.41663 5.41675ZM20.4899 5.41675C20.7572 5.14942 21.1912 5.14961 21.4586 5.41675C21.726 5.68417 21.726 6.11808 21.4586 6.3855L19.3199 8.52417C19.0525 8.79131 18.6185 8.7915 18.3512 8.52417C18.0842 8.25682 18.0842 7.82277 18.3512 7.55542L20.4899 5.41675ZM13.4381 2.56812C13.8161 2.56819 14.1225 2.87467 14.1227 3.25269V6.30835C14.1226 6.68645 13.8162 6.99285 13.4381 6.99292C13.06 6.99292 12.7536 6.6865 12.7535 6.30835V3.25269C12.7537 2.87463 13.06 2.56812 13.4381 2.56812Z" fill="currentColor"/>
    </svg>
  );
  if(id==="chat") return(
    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
      <path d="M3.75562 6.06665H19.9334C21.4741 6.06665 22.2445 6.7917 22.2445 8.24181V17.4863C22.2445 18.9364 21.4741 19.6614 19.9334 19.6614H9.53339L3.75562 24.5555V6.06665Z" stroke="currentColor" strokeLinejoin="round"/>
    </svg>
  );
  if(id==="lists") return(
    <svg width="21" height="15" viewBox="0 0 21 15" fill="none">
      <rect width="21" height="1" fill="currentColor"/>
      <rect y="7" width="21" height="1" fill="currentColor"/>
      <rect y="14" width="21" height="1" fill="currentColor"/>
    </svg>
  );
  if(id==="calendar") return(
    <svg width="26" height="27" viewBox="0 0 26 27" fill="none">
      <path d="M17.2931 3.47583C17.612 3.47591 17.8711 3.73505 17.8712 4.05396V5.65454H20.5402C21.7589 5.65487 22.7413 6.64881 22.7413 7.86646V21.4788C22.7411 22.6962 21.7588 23.6894 20.5402 23.6897H5.38879C4.17002 23.6896 3.18785 22.6963 3.18762 21.4788V7.86646C3.18762 6.6487 4.16988 5.65468 5.38879 5.65454H8.05676V4.05396C8.05692 3.73513 8.31608 3.47605 8.63489 3.47583C8.95389 3.47583 9.21285 3.73499 9.21301 4.05396V5.65454H16.715V4.05396C16.7151 3.73499 16.9741 3.47583 17.2931 3.47583ZM4.34387 21.4788C4.3441 22.065 4.81502 22.5343 5.38879 22.5344H20.5402C21.1138 22.5341 21.5849 22.0648 21.5851 21.4788V12.2551H4.34387V21.4788ZM5.38879 6.81079C4.81489 6.81093 4.34387 7.28006 4.34387 7.86646V11.0989H21.5851V7.86646C21.5851 7.28018 21.1139 6.81112 20.5402 6.81079H17.8712V7.86548C17.8712 8.18452 17.6121 8.44352 17.2931 8.4436C16.974 8.4436 16.715 8.18457 16.715 7.86548V6.81079H9.21301V7.86548C9.21301 8.18457 8.95398 8.4436 8.63489 8.4436C8.31598 8.44338 8.05677 8.18444 8.05676 7.86548V6.81079H5.38879Z" fill="currentColor"/>
    </svg>
  );
  if(id==="settings") return(
    <svg width="29" height="29" viewBox="0 0 29 29" fill="none">
      <path d="M14.2999 15.9913C15.8283 15.9913 18.149 16.3792 20.0743 17.1505C21.0365 17.536 21.8687 18.0055 22.4523 18.5441C23.0322 19.0794 23.333 19.6494 23.3331 20.2579V23.3331H5.26672V20.2579C5.26687 19.6494 5.56772 19.0794 6.14758 18.5441C6.73123 18.0054 7.5642 17.536 8.52649 17.1505C10.4518 16.3793 12.7716 15.9914 14.2999 15.9913ZM14.2999 5.26672C16.6573 5.26672 18.5665 7.17591 18.5665 9.53333C18.5665 11.8908 16.6574 13.7999 14.2999 13.7999C11.9425 13.7999 10.0333 11.8907 10.0333 9.53333C10.0334 7.17596 11.9426 5.26679 14.2999 5.26672Z" stroke="currentColor"/>
    </svg>
  );
  return null;
};

// ─── SHARED ──────────────────────────────────────────────────
const StatusBar = ({time="7:42"}) => (
  <div style={{position:"relative",height:44,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 24px",flexShrink:0}}>
    <span style={s(15)}>{time}</span>
    <div style={{position:"absolute",left:"50%",transform:"translateX(-50%)",width:80,height:24,background:INK,borderRadius:12}}/>
    <div style={{display:"flex",gap:8}}>{[0,1,2].map(i=><div key={i} style={{width:4,height:4,background:INK,borderRadius:"50%"}}/>)}</div>
  </div>
);

const HR = ({mx=24}) => <div style={{height:.5,background:INK,opacity:.12,margin:`0 ${mx}px`,flexShrink:0}}/>;

// ─── Grid+Container reusables ───
const Panel = ({children,mt=12,mx=20,style={}}) => (
  <div style={{background:GROUND,border:`.5px solid ${EGG_BDR}`,margin:`${mt}px ${mx}px 0`,...style}}>
    {children}
  </div>
);
const PanelHR = () => <div style={{height:.5,background:EGG_DIV}}/>;
const Eyebrow = ({children}) => (
  <div style={{padding:"10px 14px"}}>
    <span style={{...s(9,MUT,"500",1.3),textTransform:"uppercase"}}>{children}</span>
  </div>
);

// ─── Standardized screen header (locked position across screens) ───
// All sub-pages with BackNav: BackNav at top, then ScreenHeader at marginTop:8.
// All primary tabs: ScreenHeader at marginTop:18 below StatusBar.
const ScreenHeader = ({title, subhead, withBack=false}) => (
  <div style={{padding:"0 20px",marginTop:withBack?10:20,marginBottom:20}}>
    <h1 style={{...s(35,INK,"500"),fontFamily:FH,margin:0,lineHeight:"40px"}}>{title}</h1>
    {subhead&&<p style={{...s(15,MUT),margin:"10px 0 0",lineHeight:"20px"}}>{subhead}</p>}
  </div>
);

// ─── Pill button system (global) ───
// Per Marian's spec: ALL pill buttons share one rule —
// off-white interior, thicker (1.75px) egg-blue outline, NORMAL font weight (not bold).
// PrimaryPill is now an alias of OutlinePill for backward compatibility.
const OutlinePill = ({children, onClick, style={}}) => (
  <button onClick={onClick} style={{width:"100%",height:52,borderRadius:26,background:GROUND,border:`1.75px solid ${EGG}`,color:INK,fontFamily:F,fontSize:13,fontWeight:400,letterSpacing:".6px",cursor:"pointer",...style}}>
    {children}
  </button>
);
const PrimaryPill = OutlinePill; // alias — kept for any leftover references
const RectFillBtn = ({children, onClick, bg=EGG, color=INK}) => (
  <button onClick={onClick} style={{width:"100%",height:48,borderRadius:4,background:bg,border:"none",color,fontFamily:F,fontSize:12,fontWeight:400,letterSpacing:".6px",cursor:"pointer"}}>
    {children}
  </button>
);

// Elegant underline-style toggle (replaces chunky black pill).
// Active option: INK text with a hairline EGG underline.
// Inactive: MUT text, no underline.
const Toggle = ({options, value, onChange}) => (
  <div style={{display:"flex",gap:20}}>
    {options.map(([lbl, v]) => {
      const active = value === v;
      return (
        <div key={v} onClick={()=>onChange(v)} style={{cursor:"pointer",paddingBottom:5,borderBottom:`1.5px solid ${active?EGG:"transparent"}`,transition:"border-color .15s"}}>
          <span style={{...s(11,active?INK:MUT,"500",1.32),textTransform:"uppercase"}}>{lbl}</span>
        </div>
      );
    })}
  </div>
);

// ─── useMic — reusable voice-input hook (Web Speech API) ───
// Split spoken-list text like "cherries, bacon, and cucumbers" or
// "milk and eggs" into separate items. Used by ListDetail when committing
// a voice-dictated batch.
const parseListItems = (text) =>
  (text || "")
    .split(/,\s*(?:and\s+)?|\s+and\s+|;\s*/i)
    .map(s => s.trim())
    .filter(Boolean);

// List-categorization helpers. Detects the kind of list from its title and
// returns a per-item category via a fast Claude call. Categories let the
// ListDetail render group items under headers (produce / dairy / etc.).
const LIST_CATEGORIES = {
  grocery: ["produce","dairy","meat & seafood","bakery","deli","pantry","frozen","beverages","household","other"],
  home:    ["kitchen","living room","bedroom","bathroom","laundry","garage","garden","office","other"],
  packing: ["clothes","toiletries","electronics","documents","snacks","accessories","other"],
};
const DONT_FORGET = {
  packing: ["Phone charger", "ID / passport", "Toothbrush", "Headphones", "Medications"],
};
// Small floating callout shown on packing lists. Each item is tappable
// to append to the list; X dismisses (persists per-list in sessionStorage).
const DontForgetCard = ({items, onAdd, onClose}) => (
  <div style={{
    position:"absolute", top:6, right:14, width:158, zIndex:5,
    background:GROUND, border:`.5px solid ${EGG_BDR}`, borderRadius:8,
    padding:"10px 12px"
  }}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
      <span style={{...s(9,INK,"500",1.1),textTransform:"uppercase"}}>Don't forget</span>
      <button onClick={onClose} aria-label="Dismiss" style={{background:"none",border:"none",cursor:"pointer",fontFamily:F,fontSize:16,color:MUT,padding:0,lineHeight:1}}>×</button>
    </div>
    {items.map(it => (
      <div key={it} onClick={()=>onAdd(it)} style={{...s(12,INK),lineHeight:1.7,cursor:"pointer"}}>
        + {it}
      </div>
    ))}
  </div>
);

const detectListType = (title) => {
  const t = (title || "").toLowerCase();
  if (/\b(groc|grocer|shopping|supermarket)/.test(t)) return "grocery";
  if (/\b(pack|trip|travel|vacation|getaway|weekend)/.test(t)) return "packing";
  if (/\b(home|house|apartment|chores)/.test(t)) return "home";
  return null;
};
const categorizeItem = async (text, listType) => {
  const cats = LIST_CATEGORIES[listType];
  if (!cats || !text) return null;
  try {
    const r = await fetch("/api/claude", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 24,
        system: `Classify this ${listType} list item into ONE of these categories: ${cats.join(", ")}. Reply with ONLY the category name, all lowercase, nothing else.`,
        messages: [{role: "user", content: text}],
      }),
    });
    if (!r.ok) return null;
    const d = await r.json();
    const c = (d.content?.[0]?.text || "").trim().toLowerCase();
    return cats.find(x => x.toLowerCase() === c) || null;
  } catch { return null; }
};

// Classify a free-text add as either a calendar event or a todo. Used by the
// Home screen so the user can say "Dentist Friday 3pm" and have it routed to
// the calendar without manually picking a bucket. Falls back to {kind:"todo"}
// on any error so the user never loses input.
const classifyAdd = async (text) => {
  const today = new Date();
  const todayIso = today.toISOString().slice(0, 10);
  try {
    const r = await fetch("/api/claude", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 120,
        system: `You classify a single user utterance for a personal-assistant app. Today is ${todayIso}. Return ONLY valid JSON with these keys: {"kind":"event"|"todo","title":string,"date":"YYYY-MM-DD"|null,"time":"H:MM AM/PM"|null}.

- "event" = something with a specific time, place, or appointment-y feel (meeting, lunch, doctor, flight).
- "todo" = an action item or task (buy milk, email Sarah, finish slides, call mom — unless a time is stated).
- If the user mentions a time, day, or date, it's almost always an event.
- "title" = clean the phrase: drop date/time words, keep the subject. e.g. "Dentist Friday at 3pm" → "Dentist".
- "date" = resolve relative dates against today. Null if none stated.
- "time" = formatted as "3:00 PM". Null if none stated.

Respond with ONLY the JSON object. No code fences. No commentary.`,
        messages: [{role: "user", content: text}],
      }),
    });
    if (!r.ok) return null;
    const d = await r.json();
    const raw = (d.content?.[0]?.text || "").trim().replace(/^```(?:json)?\s*/i,"").replace(/```$/,"").trim();
    const parsed = JSON.parse(raw);
    if (parsed && (parsed.kind === "event" || parsed.kind === "todo")) return parsed;
    return null;
  } catch { return null; }
};

// "Magical" mode: tap to start, speak, pause ~2 seconds → auto-commits the transcript.
// Pass onTranscript for the final committed text. Optional onInterim receives
// the running transcript while the user is speaking — wire this to your input
// state to auto-type the words as they're spoken.
// Returns { onMicClick, isRecording, micStatus, micMsg } to wire into BottomNav.
const useMic = (onTranscript, onInterim) => {
  const [isRecording, setIsRecording] = useState(false);
  const [micStatus, setMicStatus] = useState("idle");
  const [micMsg, setMicMsg] = useState("");
  const recognitionRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const transcriptRef = useRef("");
  const committedRef = useRef(false);

  const showMicMsg = (msg, d=3000) => {
    setMicMsg(msg); setMicStatus("error");
    setTimeout(()=>{setMicMsg(""); setMicStatus("idle");}, d);
  };

  const stopAndCommit = () => {
    if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; }
    if (recognitionRef.current && !committedRef.current) {
      committedRef.current = true;
      try { recognitionRef.current.stop(); } catch {}
    }
  };

  const resetSilenceTimer = () => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(stopAndCommit, 2000);
  };

  const onMicClick = async () => {
    if (isRecording) { stopAndCommit(); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { showMicMsg("Needs Chrome or Edge"); return; }
    setMicStatus("requesting"); setMicMsg("Listening…");
    try {
      const st = await navigator.mediaDevices.getUserMedia({audio: true});
      st.getTracks().forEach(t => t.stop());
    } catch(e) {
      showMicMsg(e.name === "NotAllowedError" ? "Mic blocked — allow in settings" : "Mic unavailable");
      return;
    }
    const r = new SR();
    r.lang = "en-US";
    r.interimResults = true;   // stream partials so we can detect activity
    r.continuous = true;        // we control stopping via silence timer
    r.maxAlternatives = 1;
    transcriptRef.current = "";
    committedRef.current = false;
    r.onstart = () => {
      setIsRecording(true); setMicStatus("recording"); setMicMsg("");
      resetSilenceTimer();
    };
    r.onend = () => {
      if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; }
      setIsRecording(false); setMicStatus("idle"); setMicMsg("");
      const txt = transcriptRef.current.trim();
      if (txt) onTranscript(txt);
    };
    r.onerror = e => {
      if (silenceTimerRef.current) { clearTimeout(silenceTimerRef.current); silenceTimerRef.current = null; }
      setIsRecording(false);
      const m = {["not-allowed"]:"Mic blocked",["no-speech"]:"Nothing heard — try again",["aborted"]:""}[e.error] ?? `Error: ${e.error}`;
      if (m) showMicMsg(m); else { setMicMsg(""); setMicStatus("idle"); }
    };
    r.onresult = e => {
      // Accumulate everything (final + interim) into the running transcript
      let finalText = "", interimText = "";
      for (let i = 0; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += t;
        else interimText += t;
      }
      const running = (finalText + interimText).trim();
      transcriptRef.current = running;
      onInterim?.(running);
      resetSilenceTimer();
    };
    recognitionRef.current = r;
    try { r.start(); } catch { showMicMsg("Couldn't start — try again"); }
  };

  return { onMicClick, isRecording, micStatus, micMsg };
};

// ─── Item icons (right-aligned in schedule/to-do rows) ───
// ─── Item icons (right-aligned in schedule/to-do/event rows) ───
// Outlined glyph style — cleaner geometry, 1.5px stroke, currentColor.
// Matches the icon style in pass_05 reference (phone handset, location pin, calendar, envelope).
const ItemIcon = ({type, size=20, color=INK}) => {
  const sw=1.5, c=color;
  const p={width:size,height:size,viewBox:"0 0 24 24",fill:"none",stroke:c,strokeWidth:sw,strokeLinecap:"round",strokeLinejoin:"round",style:{flexShrink:0}};
  switch(type){
    case "phone":    return <svg {...p}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>;
    case "pin":      return <svg {...p}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/></svg>;
    case "calendar": return <svg {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>;
    case "mail":     return <svg {...p}><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22 7 12 13 2 7"/></svg>;
    case "golf":     return <svg {...p}><path d="M12 2v18"/><path d="M12 2l8 3-8 3"/><circle cx="12" cy="21" r="1.5" fill={c}/></svg>;
    case "paw":      return <svg {...p}><circle cx="7" cy="9" r="2"/><circle cx="17" cy="9" r="2"/><circle cx="4" cy="14" r="1.6"/><circle cx="20" cy="14" r="1.6"/><path d="M8.5 17a3.5 3 0 0 1 7 0c0 1.6-1.6 3-3.5 3s-3.5-1.4-3.5-3z"/></svg>;
    case "fork":     return <svg {...p}><path d="M7 2v8a3 3 0 0 0 6 0V2"/><path d="M10 2v20"/><path d="M17 2v20"/><path d="M17 8a4 4 0 0 0 0-6"/></svg>;
    case "school":   return <svg {...p}><path d="M3 9l9-5 9 5-9 5-9-5z"/><path d="M7 11v5c0 1.5 2.5 3 5 3s5-1.5 5-3v-5"/><line x1="21" y1="9" x2="21" y2="14"/></svg>;
    case "car":      return <svg {...p}><path d="M5 17h14"/><path d="M6 17v-5l2-5h8l2 5v5"/><path d="M6 17v2M18 17v2"/><circle cx="8" cy="15" r="1" fill={c}/><circle cx="16" cy="15" r="1" fill={c}/></svg>;
    case "tool":     return <svg {...p}><path d="M14.7 6.3a4 4 0 1 1-3 6.5L4 20.5l-2.5-2.5 7.7-7.7a4 4 0 0 1 5.5-4z"/></svg>;
    case "medical":  return <svg {...p}><path d="M9 2h6v6h6v6h-6v6H9v-6H3V8h6z"/></svg>;
    case "run":      return <svg {...p}><circle cx="13" cy="4" r="2"/><path d="m9 20 3-6 3 6"/><path d="m6 8 6 2 6-2"/><path d="M12 10v4"/></svg>;
    case "brain":    return <svg {...p}><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 1.98-3 2.5 2.5 0 0 1 2.46-2.04Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-1.98-3 2.5 2.5 0 0 0-2.46-2.04Z"/></svg>;
    case "clock":    return <svg {...p}><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>;
    case "people":   return <svg {...p}><circle cx="9" cy="7" r="4"/><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
    case "camera":   return <svg {...p}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>;
    case "share":    return <svg {...p}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>;
    case "doc":      return <svg {...p}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>;
    case "return":   return <svg {...p}><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 0 0-4-4H4"/></svg>;
    default: return null;
  }
};
// Map an item's text to the right icon. Matches Marian's keyword patterns from pass_05.
const iconFor = (text="") => {
  const t=text.toLowerCase();
  // Specific verbs/actions first
  if(/\b(call|phone)\b/.test(t)) return "phone";
  if(/\b(dentist|doctor|medical)\b/.test(t)) return "medical";
  if(/\b(permission|paperwork|form|slip|letter|memo|reply|email)\b/.test(t)) return "mail";
  if(/\b(school|class|teacher|homework)\b/.test(t)) return "school";
  if(/\b(contractor|fix|repair|plumber|electric|tool)\b/.test(t)) return "tool";
  if(/\b(gym|workout|exercise|jog|fitness|yoga|pilates|cycle|cycling|run)\b/.test(t)) return "run";
  // Location-bound activities (before food, so "lunch hold" → pin)
  if(/\b(tee|golf|pickup|drop ?off|meet at|hold|reservation|reserv|restaurant|dine|with)\b/.test(t)) return "pin";
  // Food items
  if(/\b(pizza|pasta|salad|soup|sandwich|burger|sushi|taco|steak|fish|chicken|meal|food|grocery|groceries|breakfast|lunch|dinner|brunch|coffee|tea|drink|cocktail|wine|snack|cook|bake)\b/.test(t)) return "fork";
  // Scheduled things
  if(/\b(vet|wu-?wu|book|appointment|visit|checkup|schedule)\b/.test(t)) return "calendar";
  return "calendar";
};

const ChevronR = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{flexShrink:0}}>
    <path d="M4 2L10 7L4 12" stroke={DIM} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const BackNav = ({nav, to}) => (
  <div style={{padding:"0 12px",marginTop:64,marginBottom:4}}>
    <button onClick={()=>nav(to)} aria-label="Back" style={{background:"none",border:"none",cursor:"pointer",padding:10,margin:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
        <path d="M10 3L5 8L10 13" stroke={INK} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  </div>
);

const BottomNav = ({active, nav, inputValue, onInputChange, onInputSubmit, onMicClick, isRecording=false, micStatus="idle", micMsg="", placeholder="+ Add item", hideInput=false}) => {
  const icons=["home","chat","lists","calendar","settings"];
  const isLive=onInputChange!==undefined;
  const isErr=micStatus==="error";
  const ph=isRecording?"Listening…":micMsg||placeholder;
  const border=isRecording?RED:isErr?"#c84b00":INK;
  return (
    <div style={{position:"absolute",bottom:0,left:0,right:0,background:GROUND,borderTop:`.5px solid ${EGG_BDR}`,paddingBottom:"env(safe-area-inset-bottom)"}}>
      {!hideInput && (
        <>
          <div style={{margin:"14px 24px 10px",display:"flex",gap:12}}>
            {isLive?(
              <input value={inputValue} onChange={e=>onInputChange(e.target.value)} onKeyDown={e=>e.key==="Enter"&&onInputSubmit&&onInputSubmit()} placeholder={ph}
                style={{flex:1,height:44,border:`0.5px solid ${border}`,borderRadius:22,padding:"0 20px",fontFamily:F,fontSize:15,color:INK,background:GROUND,outline:"none",transition:"border-color .2s"}}/>
            ):(
              <div style={{flex:1,height:44,border:`0.5px solid ${INK}`,borderRadius:22,display:"flex",alignItems:"center",padding:"0 20px",background:GROUND}}>
                <span style={s(15,MUT)}>{placeholder}</span>
              </div>
            )}
            <button onClick={onMicClick||onInputSubmit} style={{width:44,height:44,background:isRecording?EGG:GROUND,border:`0.5px solid ${INK}`,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,transition:"background .2s"}}>
              <svg width="20" height="20" viewBox="0 0 26 26" fill="none" stroke={INK} strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="2" width="8" height="14" rx="4" strokeWidth="1.5"/>
                <path d="M5 13a8 8 0 0 0 16 0" strokeWidth="1.5"/>
                <path d="M13 21v3" strokeWidth="1.5"/>
              </svg>
            </button>
          </div>
          <div style={{height:.5,background:EGG_DIV}}/>
        </>
      )}
      <div style={{display:"flex",justifyContent:"space-around",alignItems:"center",padding:hideInput?"14px 8px":"10px 8px 14px"}}>
        {icons.map(id=>(
          <button key={id} onClick={()=>nav(id)} style={{background:"none",border:"none",cursor:"pointer",opacity:active===id?1:.4,padding:0,display:"flex",alignItems:"center",justifyContent:"center",color:NAV_ICON}}>
            <NavIcon id={id}/>
          </button>
        ))}
      </div>
    </div>
  );
};

const ChatBar = ({nav, active, inputValue, onInputChange, onSend, loading}) => {
  const icons=["home","chat","lists","calendar","settings"];
  return (
    <div style={{position:"absolute",bottom:0,left:0,right:0,background:GROUND,borderTop:`.5px solid ${EGG_BDR}`,paddingBottom:"env(safe-area-inset-bottom)"}}>
      <div style={{margin:"14px 24px 10px",display:"flex",gap:12}}>
        <input value={inputValue} onChange={e=>onInputChange(e.target.value)} onKeyDown={e=>e.key==="Enter"&&onSend()} placeholder="Message Robin…"
          style={{flex:1,height:44,border:`0.5px solid ${INK}`,borderRadius:22,padding:"0 20px",fontFamily:F,fontSize:15,color:INK,background:GROUND,outline:"none"}}/>
        <button onClick={onSend} disabled={loading}
          style={{width:44,height:44,background:GROUND,border:`0.5px solid ${INK}`,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",cursor:loading?"default":"pointer",flexShrink:0,opacity:loading?.5:1}}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={INK} strokeWidth="1.5" strokeLinecap="round">
            <path d="M9 15V3M3 9l6-6 6 6"/>
          </svg>
        </button>
      </div>
      <div style={{height:.5,background:EGG_DIV}}/>
      <div style={{display:"flex",justifyContent:"space-around",alignItems:"center",padding:"10px 8px 14px"}}>
        {icons.map(id=>(
          <button key={id} onClick={()=>nav(id)} style={{background:"none",border:"none",cursor:"pointer",opacity:active===id?1:.4,padding:0,display:"flex",alignItems:"center",justifyContent:"center",color:NAV_ICON}}>
            <NavIcon id={id}/>
          </button>
        ))}
      </div>
    </div>
  );
};

// ─── ONBOARDING ──────────────────────────────────────────────
// Robin wordmark logo (from uploaded SVG)
const RobinLogo = ({color="#141414", width=240}) => (
  <svg width={width} height={width * 63 / 233} viewBox="0 0 233 63" fill={color} xmlns="http://www.w3.org/2000/svg" style={{display:"block"}}>
    <path d="M75.4746 14.1914C78.8215 14.1914 81.9515 14.8405 84.8662 16.1387C87.779 17.4369 90.3196 19.1826 92.4824 21.374C94.6471 23.5674 96.3625 26.1329 97.6318 29.0762C98.9011 32.0193 99.5371 35.1329 99.5371 38.4209C99.5371 41.7089 98.9011 44.9411 97.6318 47.9404C96.3625 50.9418 94.6313 53.5519 92.4375 55.7725C90.2437 57.9949 87.6781 59.7526 84.7344 61.0508C81.7906 62.349 78.6179 62.998 75.2129 62.998L75.2148 63C71.8681 63 68.723 62.3509 65.7812 61.0527C62.8394 59.7545 60.269 57.9949 58.0771 55.7744C55.8835 53.554 54.169 50.9575 52.9287 47.9854C51.6865 45.0151 51.0674 41.8569 51.0674 38.5107C51.0674 35.1646 51.7173 31.9344 53.0156 28.9912C54.314 26.048 56.0582 23.4824 58.252 21.2891C60.4438 19.0976 63.0252 17.3668 65.998 16.0957C68.9689 14.8266 72.1278 14.1914 75.4746 14.1914ZM116.5 22.2402C118.176 19.8164 120.244 17.9871 122.701 16.7451C125.16 15.5051 127.864 14.8848 130.813 14.8848C134.11 14.8848 137.203 15.5051 140.095 16.7451C142.986 17.9871 145.517 19.6883 147.686 21.8506C149.854 24.013 151.561 26.5377 152.805 29.4229C154.047 32.3079 154.669 35.3946 154.669 38.6826C154.669 41.684 154.133 44.5968 153.063 47.4238C151.994 50.2506 150.448 52.7599 148.425 54.9531C146.4 57.2027 143.926 59.0199 141.006 60.4053C138.085 61.7906 135.091 62.4824 132.027 62.4824C128.963 62.4824 125.983 61.8472 123.266 60.5781C120.547 59.309 118.293 57.4063 116.5 54.8662V61.7891H99.9688V51.9248H105.941V9.86426H99.9688V0H116.5V22.2402ZM27.6104 0C30.6685 0 33.5256 0.274878 36.1807 0.821289C38.8336 1.36968 41.3745 2.68175 43.7969 4.75879C46.2193 6.83589 48.0508 9.27343 49.293 12.0713C50.5333 14.8712 51.1533 17.8555 51.1533 21.0293C51.1533 23.2788 50.7922 25.4722 50.0713 27.6055C49.3485 29.7405 48.3254 31.6722 47 33.4023C45.6725 35.1326 44.0693 36.5608 42.1953 37.6865C40.3194 38.8122 38.1992 39.4613 35.833 39.6338L45.4395 51.9229H52.4512V61.7871H37.9961L18.4346 34.0088V51.9229H23.7129V61.7871H0V51.9229H6.66504V9.86426H0V0H27.6104ZM170.421 51.9229H176.396V61.7871H153.805V51.9229H159.862V25.4414H153.89V15.5762H170.421V51.9229ZM209.803 14.54C212.341 14.5401 214.779 15.0304 217.116 16.0107C219.453 16.9931 221.457 18.4054 223.132 20.25C225.037 22.3853 226.161 24.521 226.508 26.6543C226.855 28.7895 227.027 31.1844 227.027 33.8369V51.9229H233V61.7871H210.496V51.9229H216.469V36.9502C216.469 35.5087 216.395 34.0804 216.252 32.666C216.107 31.2537 215.574 29.9125 214.651 28.6416C213.669 27.3725 212.457 26.4346 211.016 25.8281C209.572 25.2217 208.072 24.9199 206.516 24.9199C204.959 24.9199 203.341 25.2375 201.841 25.8711C200.339 26.5066 199.099 27.4872 198.118 28.8145C197.136 30.1417 196.56 31.6999 196.388 33.4883C196.215 35.2766 196.128 36.949 196.128 38.5068V51.9209H202.101V61.7852H179.597V51.9209H185.569V25.4395L185.567 25.4434H179.595V15.5781H196.126V22.1553C197.512 19.559 199.415 17.6424 201.839 16.4004C204.261 15.1603 206.917 14.54 209.803 14.54ZM130.089 24.4893C128.184 24.4893 126.382 24.8506 124.681 25.5713C122.977 26.294 121.49 27.2875 120.223 28.5566C118.955 29.8258 117.941 31.3124 117.193 33.0137C116.444 34.7166 116.067 36.5184 116.067 38.4209C116.067 40.4417 116.442 42.3157 117.193 44.0459C117.943 45.7761 118.953 47.2917 120.223 48.5898C121.492 49.8881 123.006 50.8974 124.768 51.6182C126.527 52.3409 128.387 52.6992 130.351 52.6992C132.314 52.6992 134.13 52.3102 135.805 51.5312C137.477 50.7523 138.935 49.7141 140.175 48.416C141.415 47.1178 142.381 45.6173 143.073 43.916C143.765 42.2149 144.112 40.4114 144.112 38.5088C144.112 36.606 143.736 34.8018 142.986 33.1006C142.236 31.3993 141.224 29.9127 139.957 28.6436C138.688 27.3746 137.201 26.365 135.5 25.6152C133.797 24.8654 131.994 24.4893 130.091 24.4893H130.089ZM75.4746 24.5791C73.5696 24.5791 71.7669 24.9394 70.0654 25.6602C68.3621 26.3829 66.8757 27.3635 65.6084 28.6035C64.3391 29.8455 63.3271 31.3164 62.5791 33.0176C61.8293 34.7205 61.4532 36.5223 61.4531 38.4248C61.4531 40.3275 61.8003 42.1318 62.4922 43.833C63.184 45.5362 64.1513 47.0338 65.3916 48.332C66.6319 49.6302 68.0892 50.6693 69.7617 51.4482C71.4341 52.2271 73.2518 52.6162 75.2148 52.6162V52.6143C77.1199 52.6143 78.9225 52.254 80.624 51.5332C82.3256 50.8124 83.8117 49.816 85.0811 48.5469C86.3504 47.2797 87.3445 45.7939 88.0674 44.0908C88.7883 42.3896 89.1494 40.5854 89.1494 38.6826C89.1494 36.7801 88.8021 34.9765 88.1104 33.2754C87.4185 31.5742 86.4512 30.0736 85.2109 28.7754C83.9688 27.4773 82.5132 26.4549 80.8408 25.7051C79.1664 24.9552 77.3796 24.5791 75.4746 24.5791ZM18.4375 32.8857H24.8408C26.6876 32.8857 28.4765 32.7557 30.207 32.4961C31.9377 32.2365 33.5835 31.5308 35.1416 30.376C36.5272 29.2812 37.5779 27.9523 38.3008 26.3965C39.0217 24.8386 39.3818 23.1951 39.3818 21.4629C39.3818 19.7307 39.0346 18.175 38.3428 16.6172C37.6509 15.0593 36.639 13.7612 35.3135 12.7227C33.986 11.628 32.6158 10.9918 31.2031 10.8174C29.7885 10.645 28.2456 10.5586 26.5732 10.5586H18.4375V32.8857ZM170.423 11.1631H159.862V0H170.423V11.1631Z"/>
  </svg>
);

// Google "G" logo (multi-color)
const GoogleLogo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

// Apple logo (clean SF Symbols-style path)
const AppleLogo = ({color=INK}) => (
  <svg width="15" height="18" viewBox="0 0 24 24" fill={color}>
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
  </svg>
);

const Splash = ({nav}) => (
  <div style={{height:"100%",display:"flex",flexDirection:"column",position:"relative"}}>
    <style>{`
      @keyframes robin-type { from { clip-path: inset(0 100% 0 0); } to { clip-path: inset(0 0 0 0); } }
      @keyframes caret-blink { 50% { opacity: 0; } }
      @keyframes caret-fade { to { opacity: 0; } }
      .robin-logo-anim { animation: robin-type 1.3s steps(14, end) forwards; }
      .robin-caret { display: inline-block; width: 1.5px; height: 36px; background: #141414; margin-left: 6px; vertical-align: middle; animation: caret-blink 1s infinite, caret-fade .35s 1.5s forwards; }
      /* Single-slot rotation: three phrases cycle through one position, settling on the last. */
      .phrase { position: absolute; opacity: 0; left: 50%; transform: translate(-50%, 8px); white-space: nowrap; }
      @keyframes phrase-1 {
        0%        { opacity: 0; transform: translate(-50%, 8px); }
        8%, 28%   { opacity: 1; transform: translate(-50%, 0); }
        36%, 100% { opacity: 0; transform: translate(-50%, -8px); }
      }
      @keyframes phrase-2 {
        0%, 28%   { opacity: 0; transform: translate(-50%, 8px); }
        36%, 58%  { opacity: 1; transform: translate(-50%, 0); }
        66%, 100% { opacity: 0; transform: translate(-50%, -8px); }
      }
      @keyframes phrase-3 {
        0%, 58%   { opacity: 0; transform: translate(-50%, 8px); }
        66%, 100% { opacity: 1; transform: translate(-50%, 0); }
      }
      .phrase-1 { animation: phrase-1 3.2s 1.6s ease-in-out forwards; }
      .phrase-2 { animation: phrase-2 3.2s 1.6s ease-in-out forwards; }
      .phrase-3 { animation: phrase-3 3.2s 1.6s ease-in-out forwards; }
    `}</style>
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:22}}>
      <div style={{display:"flex",alignItems:"center"}}>
        <div className="robin-logo-anim" style={{display:"inline-block",overflow:"hidden"}}>
          <RobinLogo color="#141414" width={240}/>
        </div>
        <div className="robin-caret"/>
      </div>
      <div style={{position:"relative",height:22,width:"100%"}}>
        <p className="phrase phrase-1" style={{...s(15,INK),margin:0}}>A sidekick.</p>
        <p className="phrase phrase-2" style={{...s(15,INK),margin:0}}>A second brain.</p>
        <p className="phrase phrase-3" style={{...s(15,INK),margin:0}}>A serious tool.</p>
      </div>
    </div>
    <div style={{padding:"0 20px 64px"}}>
      <button onClick={()=>{window.location.href="/api/google-auth-start";}} style={{width:"100%",height:52,borderRadius:26,background:GROUND,border:`1.75px solid ${EGG}`,display:"flex",alignItems:"center",justifyContent:"center",gap:12,fontFamily:F,fontSize:15,color:INK,cursor:"pointer"}}>
        <GoogleLogo/> Sign in with Google
      </button>
    </div>
  </div>
);

const SignIn = ({nav}) => (
  <div style={{height:"100%",display:"flex",flexDirection:"column"}}>
    <div style={{paddingTop:80}}>
      <ScreenHeader title="Sign In" subhead="Choose your preferred sign-in method."/>
    </div>
    <div style={{padding:"56px 20px 0",display:"flex",flexDirection:"column",gap:14}}>
      <button onClick={()=>{window.location.href="/api/google-auth-start";}} style={{width:"100%",height:52,borderRadius:26,background:GROUND,border:`1.75px solid ${EGG}`,display:"flex",alignItems:"center",justifyContent:"center",gap:12,fontFamily:F,fontSize:15,color:INK,cursor:"pointer"}}>
        <GoogleLogo/> Sign in with Google
      </button>
      <button onClick={()=>nav("goals")} style={{width:"100%",height:52,borderRadius:26,background:GROUND,border:`1.75px solid ${EGG}`,display:"flex",alignItems:"center",justifyContent:"center",gap:12,fontFamily:F,fontSize:15,color:INK,cursor:"pointer"}}>
        <AppleLogo color={INK}/> Sign in with Apple
      </button>
      <button onClick={()=>nav("goals")} style={{background:"none",border:"none",fontFamily:F,fontSize:11,color:MUT,letterSpacing:".88px",textTransform:"uppercase",cursor:"pointer",marginTop:8}}>Continue as Guest</button>
      <p style={{...s(11,MUT),lineHeight:1.55,textAlign:"center",margin:"24px 8px 0"}}>Robin connects to your <strong style={{color:INK,fontWeight:500}}>Gmail</strong> and <strong style={{color:INK,fontWeight:500}}>Google Calendar</strong> — read-only. She'll never send mail, change events, or modify anything.</p>
    </div>
  </div>
);

// Welcome carousel illustrations — currently FPO placeholders. Replace
// each step's `illustration` in WELCOME_STEPS with the real artwork
// component when ready (per-step file paths or inline SVG).
const IllustrationFPO = () => (
  <svg viewBox="0 0 240 140" width="100%" style={{display:"block"}}>
    <rect x="20" y="10" width="200" height="120" fill="none" stroke={INK} strokeWidth="0.75"/>
    <text x="120" y="66" fontFamily={F} fontSize="9" fill={MUT} textAnchor="middle" letterSpacing="1.4">FPO</text>
    <text x="120" y="82" fontFamily={F} fontSize="9" fill={MUT} textAnchor="middle" letterSpacing="1.4">PLACE IMAGE/ILLUSTRATION HERE</text>
  </svg>
);

const WELCOME_STEPS = [
  {
    illustration: IllustrationFPO,
    title: "Hi, I'm Robin.",
    body: "Your sidekick. I'm here to help you stay on top of your day.",
  },
  {
    eyebrow: "Morning Briefing",
    illustration: IllustrationFPO,
    title: "I'll catch you up every morning.",
    body: "I look at your inbox and calendar and keep tabs on what needs your attention.",
  },
  {
    eyebrow: "Anytime Assistance",
    illustration: IllustrationFPO,
    title: "Hold the button. Tell me everything.",
    body: "Hold the Action Button on your phone any time and tell me what you need. I'll handle the rest.",
  },
  {
    eyebrow: "Mental Offload",
    illustration: IllustrationFPO,
    title: "I'm a great multi-tasker.",
    body: "Tell me a to-do, a list, or a calendar event. I'll keep it for you and pull it up when you need it.",
  },
  {
    eyebrow: "Privacy",
    illustration: IllustrationFPO,
    title: "I'll protect your privacy.",
    body: "Your connected apps are safe with me. I won't send, change, or delete anything without your permission.",
  },
];

// Post-OAuth welcome carousel — six sequential steps with Vignelli-style
// illustrations. Internal step state (no router involvement).
const WelcomeFromRobin = ({nav}) => {
  const [step, setStep] = useState(0);
  const isLast = step === WELCOME_STEPS.length - 1;
  const current = WELCOME_STEPS[step];
  const Illustration = current.illustration;

  return (
    <div style={{height:"100%",display:"flex",flexDirection:"column",background:GROUND}}>
      {/* Top row: back chevron only — dots have moved below content */}
      <div style={{padding:"60px 12px 0",display:"flex",alignItems:"center"}}>
        {step > 0 ? (
          <button onClick={()=>setStep(s=>s-1)} aria-label="Back" style={{background:"none",border:"none",cursor:"pointer",padding:10,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <svg width="22" height="22" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8L10 13" stroke={INK} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        ) : <div style={{width:42,height:42}}/>}
      </div>

      {/* Body: copy first, then illustration, then dots. Keyed by step so animation replays. */}
      <div key={step} style={{flex:1,display:"flex",flexDirection:"column",justifyContent:"center",padding:"0 24px",animation:"welcome-fade .35s ease-out"}}>
        <style>{`
          @keyframes welcome-fade {
            from { opacity: 0; transform: translateY(8px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        {current.eyebrow && (
          <p style={{...s(11,MUT,"500",1.3),textTransform:"uppercase",margin:"0 0 10px",textAlign:"center"}}>{current.eyebrow}</p>
        )}
        <h1 style={{...s(28,INK,"500"),fontFamily:FH,margin:"0 0 14px",lineHeight:1.18,textAlign:"center"}}>{current.title}</h1>
        <p style={{...s(15,INK),lineHeight:1.55,margin:"0 0 36px",textAlign:"center",opacity:.78,maxWidth:340,marginLeft:"auto",marginRight:"auto"}}>{current.body}</p>
        <div style={{display:"flex",justifyContent:"center",marginBottom:28}}>
          <div style={{width:"100%",maxWidth:280}}>
            <Illustration/>
          </div>
        </div>
        <div style={{display:"flex",gap:7,justifyContent:"center"}}>
          {WELCOME_STEPS.map((_,i)=>(
            <div key={i} style={{width:6,height:6,borderRadius:"50%",background:i===step?INK:EGG_BDR,transition:"background .2s"}}/>
          ))}
        </div>
      </div>

      {/* Continue / Begin button */}
      <div style={{padding:"14px 20px 64px"}}>
        <OutlinePill onClick={()=>{
          if (isLast) nav("tell-robin");
          else setStep(s=>s+1);
        }}>
          {isLast ? "Let's begin →" : "Next →"}
        </OutlinePill>
      </div>
    </div>
  );
};

// Post-chat "putting it together" screen — gives Robin a moment to look like
// she's actually assembling things, then auto-advances to Today.
const PuttingItTogether = ({nav}) => {
  const lines = [
    "Reading your inbox…",
    "Scanning your calendar…",
    "Building today's briefing…",
    "Done.",
  ];
  const [step, setStep] = useState(0);
  useEffect(() => {
    if (step >= lines.length - 1) {
      const t = setTimeout(() => nav("home"), 700);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStep(s => s + 1), 850);
    return () => clearTimeout(t);
  }, [step]);

  return (
    <div style={{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 24px",background:GROUND}}>
      <div style={{...s(11,MUT,"500",1.3),textTransform:"uppercase",marginBottom:18}}>Robin · Putting it together</div>
      <h1 style={{...s(28,INK,"500"),fontFamily:FH,textAlign:"center",margin:"0 0 28px",lineHeight:1.2}}>One sec while I get smart about your day.</h1>
      <div style={{display:"flex",flexDirection:"column",gap:10,alignItems:"flex-start",minWidth:200}}>
        {lines.map((line,i)=>(
          <div key={line} style={{display:"flex",alignItems:"center",gap:10,opacity:i<=step?1:0.35,transition:"opacity .25s"}}>
            <div style={{width:6,height:6,borderRadius:"50%",background:i<step?GRN:i===step?INK:EGG_BDR}}/>
            <span style={{...s(13,INK)}}>{line}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// "Tell Robin" — three-turn chat asking the user what mail Robin should
// watch for. Answers are stitched into a profile and POSTed to
// /api/save-profile, which sets a signed cookie that api/gmail-important.js
// reads when ranking the user's inbox.
// An intro bubble runs before the first question to set the tone.
const TELL_ROBIN_INTRO = (firstName) =>
  `OK${firstName ? ` ${firstName}` : ""}, let's get personal. I'd love to know a little bit more about what's important to you so I can keep my eye on it.`;
const TELL_ROBIN_TURNS = [
  {
    key: "family",
    prompt: () => "Let's start with family. Who matters most? Name them and I'll never miss a message from them, along with the apps.",
    chips: ["Mom", "Dad", "Partner", "Spouse", "My kids", "Siblings", "In-laws"],
    placeholder: "e.g. Mom, Dad, my husband, my kids Willa and Henry…",
  },
  {
    key: "people",
    prompt: () => "Got it. Who else? Close friends, coworkers, your kids' school — anyone whose email always matters.",
    chips: ["Close friends", "Best friend", "Kids' school", "My team at work", "Trusted coworkers", "Doctor's office", "Babysitter", "My therapist"],
    placeholder: "e.g. Willa's teachers, my best friend Jess, my pediatrician…",
  },
  {
    key: "work",
    prompt: () => "What about work or projects you're in the middle of? Clients, freelance gigs, anything active.",
    chips: ["Active clients", "Freelance projects", "My manager", "Recruiter", "Investor updates"],
    placeholder: "e.g. Acme Co project, freelance writing clients…",
  },
  {
    key: "inbox",
    prompt: () => "Last one. What kind of email can't wait?",
    chips: ["Bills & invoices", "Late payments", "Expired cards", "Doctor appointments", "RSVPs needed", "Waiting on a reply from me", "Travel confirmations", "Tax & legal", "School deadlines"],
    placeholder: "e.g. Chase bank alerts, anything overdue, replies expected of me…",
  },
];

const TellRobin = ({nav}) => {
  const [turn,setTurn] = useState(0);
  const [answers,setAnswers] = useState({family:"", people:"", work:"", inbox:""});
  const [input,setInput] = useState("");
  const [error,setError] = useState(null);
  const [firstName,setFirstName] = useState("");
  const bottomRef = useRef(null);
  const turnRef = useRef(0);
  const inputRef = useRef("");
  useEffect(()=>{ turnRef.current = turn; }, [turn]);
  useEffect(()=>{ inputRef.current = input; }, [input]);

  useEffect(()=>{
    fetch("/api/user-info",{credentials:"same-origin"})
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.firstName) setFirstName(d.firstName); })
      .catch(()=>{});
  },[]);

  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); }, [turn, input]);

  const advance = (answerText) => {
    const currentTurn = turnRef.current;
    if (currentTurn >= TELL_ROBIN_TURNS.length) return;
    const key = TELL_ROBIN_TURNS[currentTurn].key;
    setAnswers(prev => ({...prev, [key]: answerText}));
    setInput("");
    setTurn(t => t + 1);
  };

  // Voice: interim auto-types into the input; final auto-advances the turn
  // (same magic-commit behavior as Home / Lists / Calendar).
  const {onMicClick: micFn, isRecording, micStatus, micMsg} = useMic(
    tx => { setInput(tx); advance(tx.trim()); },
    tx => setInput(tx),
  );

  const onContinue = () => advance(input.trim());
  const onSkip = () => advance("");
  const onMicClick = () => { if (inputRef.current.trim()) { onContinue(); return; } micFn(); };

  const appendChip = (chip) => {
    setInput(prev => prev ? `${prev}, ${chip.toLowerCase()}` : chip);
  };

  const allDone = turn >= TELL_ROBIN_TURNS.length;

  const save = async () => {
    setError(null);
    try {
      const r = await fetch("/api/save-profile", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        credentials: "same-origin",
        body: JSON.stringify(answers),
      });
      if (!r.ok) {
        const d = await r.json().catch(()=>({}));
        throw new Error(d.error || `HTTP ${r.status}`);
      }
      nav("putting-it-together");
    } catch (e) {
      setError(e.message || "Couldn't save. Try again.");
    }
  };

  // Bubble styles match the existing Chat component
  const robinBubble = {alignSelf:"flex-start", maxWidth:"82%", background:GROUND, border:`.5px solid ${EGG_BDR}`, borderRadius:18, padding:"12px 16px"};
  const userBubble  = {alignSelf:"flex-end",   maxWidth:"82%", background:"#EAE6DD", borderRadius:18, padding:"12px 16px"};
  const skippedBubble = {alignSelf:"flex-end", maxWidth:"82%", background:"transparent", border:`.5px dashed ${EGG_BDR}`, borderRadius:18, padding:"10px 16px"};

  return (
    <div style={{height:"100%",position:"relative",display:"flex",flexDirection:"column",background:GROUND}}>
      <div style={{textAlign:"center",paddingTop:80,paddingBottom:14}}>
        <span style={{...s(11,MUT,"500",1.3),textTransform:"uppercase"}}>Robin · Setup</span>
      </div>

      {/* Transcript so far */}
      <div style={{flex:1,overflowY:"auto",padding:"4px 20px",display:"flex",flexDirection:"column",gap:12,paddingBottom:24}}>
        <div style={robinBubble}>
          <p style={{...s(15,INK),lineHeight:1.5,margin:0}}>{TELL_ROBIN_INTRO(firstName)}</p>
        </div>
        {TELL_ROBIN_TURNS.map((t,i)=>{
          if (i > turn) return null;
          const answer = answers[t.key];
          const isActive = i === turn;
          return (
            <React.Fragment key={t.key}>
              <div style={robinBubble}>
                <p style={{...s(15,INK),lineHeight:1.5,margin:0}}>{t.prompt(firstName)}</p>
              </div>
              {isActive && (
                <div style={{display:"flex",gap:8,flexWrap:"wrap",alignSelf:"flex-start",maxWidth:"86%",marginTop:-2}}>
                  {t.chips.map(c=>(
                    <button key={c} onClick={()=>appendChip(c)} style={{height:30,padding:"0 13px",borderRadius:15,background:GROUND,border:`.5px solid ${EGG_BDR}`,fontFamily:F,fontSize:12,color:INK,cursor:"pointer",whiteSpace:"nowrap"}}>
                      {c}
                    </button>
                  ))}
                </div>
              )}
              {i < turn && (
                answer ? (
                  <div style={userBubble}>
                    <p style={{...s(15,INK),lineHeight:1.5,margin:0}}>{answer}</p>
                  </div>
                ) : (
                  <div style={skippedBubble}>
                    <p style={{...s(13,MUT),lineHeight:1.5,margin:0,fontStyle:"italic"}}>(skipped)</p>
                  </div>
                )
              )}
            </React.Fragment>
          );
        })}

        {allDone && (
          <div style={robinBubble}>
            <p style={{...s(15,INK),lineHeight:1.5,margin:0}}>Perfect. I'll watch your inbox for those. You can change this any time in Settings.</p>
          </div>
        )}

        {error && (
          <div style={{...robinBubble, borderColor:"#C45A4F"}}>
            <p style={{...s(13,"#C45A4F"),lineHeight:1.5,margin:0}}>{error}</p>
          </div>
        )}

        <div ref={bottomRef}/>
      </div>

      {/* Active input row — same pattern as the rest of the app */}
      {!allDone ? (
        <div style={{padding:"14px 20px 24px",borderTop:`.5px solid ${EGG_DIV}`,background:GROUND}}>
          <div style={{display:"flex",gap:12}}>
            <input
              value={input}
              onChange={e=>setInput(e.target.value)}
              placeholder={isRecording ? "Listening…" : (micMsg || TELL_ROBIN_TURNS[turn].placeholder)}
              onKeyDown={e=>{if(e.key==="Enter") onContinue();}}
              style={{flex:1,height:44,border:`0.5px solid ${isRecording?RED:INK}`,borderRadius:22,padding:"0 20px",fontFamily:F,fontSize:15,color:INK,background:GROUND,outline:"none",transition:"border-color .2s"}}
            />
            <button onClick={onMicClick} aria-label="Voice or submit" style={{width:44,height:44,background:isRecording?EGG:GROUND,border:`0.5px solid ${INK}`,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,transition:"background .2s"}}>
              <svg width="20" height="20" viewBox="0 0 26 26" fill="none" stroke={INK} strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="2" width="8" height="14" rx="4" strokeWidth="1.5"/>
                <path d="M5 13a8 8 0 0 0 16 0" strokeWidth="1.5"/>
                <path d="M13 21v3" strokeWidth="1.5"/>
              </svg>
            </button>
          </div>
          <div style={{textAlign:"center",marginTop:12}}>
            <button onClick={onSkip} style={{background:"none",border:"none",fontFamily:F,fontSize:11,color:MUT,letterSpacing:".88px",textTransform:"uppercase",cursor:"pointer"}}>Skip this one</button>
          </div>
        </div>
      ) : (
        <div style={{padding:"14px 20px 28px",background:GROUND,borderTop:`.5px solid ${EGG_DIV}`}}>
          <OutlinePill onClick={save}>{error ? "Try again →" : "Continue →"}</OutlinePill>
        </div>
      )}
    </div>
  );
};

const Goals = ({nav}) => {
  const [sel,setSel]=useState([]);
  const opts=[
    {label:"I want to be more productive",       icon:"run"},
    {label:"I want to remember everything",       icon:"brain"},
    {label:"I want to manage my schedule",        icon:"clock"},
    {label:"I want to coordinate calendars",      icon:"people"},
  ];
  return (
    <div style={{height:"100%",display:"flex",flexDirection:"column"}}>
      <div style={{paddingTop:80}}>
        <ScreenHeader title="How can Robin help?" subhead="Pick anything that resonates. You can change this later."/>
      </div>
      <div style={{padding:"56px 20px 0",display:"flex",flexDirection:"column",gap:10}}>
        {opts.map(({label,icon})=>{
          const on=sel.includes(label);
          return (
            <button key={label} onClick={()=>setSel(s=>on?s.filter(x=>x!==label):[...s,label])}
              style={{width:"100%",minHeight:60,borderRadius:4,padding:"14px 18px",
                background:on?"#EAE6DD":GROUND,
                border:`.5px solid ${on?EGG:EGG_BDR}`,
                color:INK,fontFamily:F,fontSize:15,cursor:"pointer",
                display:"flex",alignItems:"center",justifyContent:"space-between",gap:14,
                transition:"background .15s, border-color .15s"}}>
              <span style={{textAlign:"left",flex:1,lineHeight:1.35}}>{label}</span>
              <ItemIcon type={icon} size={22} color={INK}/>
            </button>
          );
        })}
      </div>
      <div style={{marginTop:"auto",padding:"0 20px 64px"}}>
        <OutlinePill onClick={()=>nav("signin")}>Continue →</OutlinePill>
      </div>
    </div>
  );
};

const RobinsHoursSetup = ({nav}) => {
  const [times,setTimes]=useState({morning:"07:00",evening:"20:00"});
  const [editing,setEditing]=useState(null);
  const fmt=t=>{if(!t)return t;const[h,m]=t.split(":").map(Number);const ap=h<12?"AM":"PM";return`${h===0?12:h>12?h-12:h}:${String(m).padStart(2,"0")} ${ap}`;};
  return (
    <div style={{height:"100%",display:"flex",flexDirection:"column"}}>
      <div style={{paddingTop:80}}>
        <div style={{padding:"0 20px"}}>
          <p style={{...s(11,MUT,"500",1.3),textTransform:"uppercase",lineHeight:"20px"}}>Setup · 2 of 3</p>
        </div>
        <ScreenHeader title="Robin's Hours" subhead="Tell Robin what you need and when."/>
      </div>
      <Panel mt={56}>
        {[["Morning Brief","morning"],["Evening Recap","evening"],["Quiet Hours","quiet"]].map(([lbl,key],i)=>(
          <div key={key} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"15px 14px",borderTop:i===0?"none":`.5px solid ${EGG_DIV}`}}>
            <span style={s(15)}>{lbl}</span>
            {editing===key&&key!=="quiet"?(
              <div style={{display:"flex",alignItems:"center",gap:8}}>
                <input type="time" defaultValue={times[key]||"07:00"} onChange={e=>setTimes(p=>({...p,[key]:e.target.value}))}
                  style={{border:`.5px solid ${EGG_BDR}`,borderRadius:4,padding:"2px 8px",fontFamily:F,fontSize:13,color:INK,outline:"none",background:GROUND}}/>
                <button onClick={()=>setEditing(null)} style={{fontFamily:F,fontSize:11,color:GRN,background:"none",border:"none",cursor:"pointer",fontWeight:600}}>Done</button>
              </div>
            ):(
              <span style={{...s(15,MUT),cursor:"pointer"}} onClick={()=>setEditing(key)}>
                {key==="quiet"?"10 PM – 7 AM":fmt(times[key])} ›
              </span>
            )}
          </div>
        ))}
      </Panel>
      <div style={{marginTop:"auto",padding:"0 20px 64px"}}>
        <PrimaryPill onClick={()=>nav("notifications-intro")}>Continue</PrimaryPill>
      </div>
    </div>
  );
};

const NotificationsIntro = ({nav}) => {
  const SYS = "-apple-system, 'SF Pro Display', 'SF Pro Text', system-ui, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif";
  return (
  <div style={{height:"100%",display:"flex",flexDirection:"column"}}>
    <div style={{paddingTop:80}}>
      <div style={{padding:"0 20px"}}>
        <p style={{...s(11,MUT,"500",1.3),textTransform:"uppercase",lineHeight:"20px"}}>Setup · 3 of 3</p>
      </div>
      <ScreenHeader title="Nudges" subhead="Allow notifications so Robin can nudge you at the right moment."/>
    </div>
    {/* iOS lock-screen preview — uses system font, not Plex Mono */}
    <div style={{margin:"56px 20px 0",background:"linear-gradient(160deg,#2c2c5a 0%,#1a3a6e 40%,#0a2848 100%)",borderRadius:38,padding:"22px 16px 32px",overflow:"hidden",position:"relative"}}>
      {/* Lock indicator */}
      <div style={{display:"flex",justifyContent:"center",marginBottom:14}}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 10V8a6 6 0 0 1 12 0v2M5 10h14v11H5z" stroke="rgba(255,255,255,.85)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
      </div>
      <p style={{fontFamily:SYS,fontSize:14,color:"rgba(255,255,255,.85)",textAlign:"center",fontWeight:500,margin:"0 0 2px",letterSpacing:".2px"}}>Monday, May 12</p>
      <p style={{fontFamily:SYS,fontSize:74,color:"#fff",fontWeight:200,letterSpacing:"-2.5px",textAlign:"center",margin:"-4px 0 18px",lineHeight:1}}>9:41</p>
      {/* iOS notification banner — vibrant white blur */}
      <div style={{background:"rgba(245,245,247,.94)",borderRadius:16,padding:"10px 12px",boxShadow:"0 6px 20px rgba(0,0,0,.18)",backdropFilter:"blur(20px)"}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
          <div style={{width:24,height:24,borderRadius:6,background:INK,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <span style={{fontFamily:SYS,fontSize:13,color:WHT,fontWeight:700,letterSpacing:"-.5px"}}>R</span>
          </div>
          <span style={{fontFamily:SYS,fontSize:13,color:INK,fontWeight:600,letterSpacing:".1px"}}>ROBIN</span>
          <span style={{fontFamily:SYS,fontSize:12,color:"rgba(60,60,67,.6)",marginLeft:"auto"}}>now</span>
        </div>
        <p style={{fontFamily:SYS,fontSize:14,color:INK,lineHeight:1.3,margin:"2px 0 0",fontWeight:600}}>Good morning</p>
        <p style={{fontFamily:SYS,fontSize:14,color:INK,lineHeight:1.3,margin:0}}>Your daily briefing is ready.</p>
      </div>
      <div style={{background:"rgba(245,245,247,.84)",borderRadius:16,padding:"10px 12px",boxShadow:"0 4px 14px rgba(0,0,0,.14)",marginTop:8}}>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:4}}>
          <div style={{width:24,height:24,borderRadius:6,background:INK,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <span style={{fontFamily:SYS,fontSize:13,color:WHT,fontWeight:700,letterSpacing:"-.5px"}}>R</span>
          </div>
          <span style={{fontFamily:SYS,fontSize:13,color:INK,fontWeight:600,letterSpacing:".1px"}}>ROBIN</span>
          <span style={{fontFamily:SYS,fontSize:12,color:"rgba(60,60,67,.6)",marginLeft:"auto"}}>2m ago</span>
        </div>
        <p style={{fontFamily:SYS,fontSize:14,color:INK,lineHeight:1.3,margin:"2px 0 0",fontWeight:600}}>Reminder</p>
        <p style={{fontFamily:SYS,fontSize:14,color:INK,lineHeight:1.3,margin:0}}>Maria call in 10 minutes.</p>
      </div>
    </div>
    <div style={{marginTop:"auto",padding:"0 20px 64px"}}>
      <PrimaryPill onClick={()=>nav("loading")}>Allow</PrimaryPill>
    </div>
  </div>
  );
};

const Loading = ({nav}) => {
  const [done,setDone]=useState(0);
  const items=["Marian's Daily Briefing","Events","To-dos","Weather"];
  useEffect(()=>{
    const t=setTimeout(()=>nav("home"),2600);
    const i=setInterval(()=>setDone(d=>Math.min(d+1,4)),560);
    return()=>{clearTimeout(t);clearInterval(i);};
  },[]);
  return (
    <div style={{height:"100%",display:"flex",flexDirection:"column"}}>
      <div style={{paddingTop:80}}>
        <ScreenHeader title="Setting up Marian's Day" subhead="Just a moment."/>
      </div>
      <Panel mt={56}>
        {items.map((item,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"16px 14px",borderTop:i===0?"none":`.5px solid ${EGG_DIV}`}}>
            <span style={s(15)}>{item}</span>
            {i<done
              ?<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="11" fill={INK}/><path d="M7 12.5l3.5 3.5L17 9" stroke={WHT} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              :<span style={s(18,MUT)}>…</span>}
          </div>
        ))}
      </Panel>
    </div>
  );
};

// ─── HOME ────────────────────────────────────────────────────
// Hottest Mail — fetches the top 3 Gmail-flagged-important messages via the
// /api/gmail-important serverless function. Renders three states: not
// connected (CTA), empty, and three-row list.
const HottestMail = ({onCount}) => {
  const [state,setState] = useState({status:"loading"});
  useEffect(()=>{
    let cancelled=false;
    (async()=>{
      try{
        const r=await fetch("/api/gmail-important",{credentials:"same-origin"});
        if(cancelled) return;
        if(r.status===401){ setState({status:"not_connected"}); onCount?.(0); return; }
        if(!r.ok){ setState({status:"error"}); onCount?.(0); return; }
        const d=await r.json();
        const msgs=d.messages||[];
        setState({status:"ok", messages:msgs});
        onCount?.(msgs.length);
      }catch{
        if(!cancelled){ setState({status:"error"}); onCount?.(0); }
      }
    })();
    return ()=>{cancelled=true;};
  },[onCount]);

  const goConnect = ()=>{ window.location.href="/api/google-auth-start"; };

  if(state.status==="loading"){
    return (<Panel><Eyebrow>Inbox</Eyebrow>
      <div style={{padding:"11px 14px",borderTop:`.5px solid ${EGG_DIV}`}}>
        <span style={{...s(12,MUT)}}>Checking Gmail…</span>
      </div></Panel>);
  }
  if(state.status==="not_connected"){
    return (<Panel><Eyebrow>Inbox</Eyebrow>
      <div onClick={goConnect} style={{display:"flex",alignItems:"center",gap:13,padding:"11px 14px",borderTop:`.5px solid ${EGG_DIV}`,cursor:"pointer"}}>
        <span style={{...s(15),flex:1}}>Connect Gmail</span>
        <ChevronR/>
      </div></Panel>);
  }
  if(state.status==="error"){
    return (<Panel><Eyebrow>Inbox</Eyebrow>
      <div style={{padding:"11px 14px",borderTop:`.5px solid ${EGG_DIV}`}}>
        <span style={{...s(12,MUT)}}>Couldn't reach Gmail.</span>
      </div></Panel>);
  }
  const msgs=state.messages;
  return (<Panel><Eyebrow>Inbox</Eyebrow>
    {msgs.length===0 ? (
      <div style={{padding:"11px 14px",borderTop:`.5px solid ${EGG_DIV}`}}>
        <span style={{...s(12,MUT)}}>Inbox is calm.</span>
      </div>
    ) : msgs.map(m=>(
      <div key={m.id} style={{padding:"11px 14px",borderTop:`.5px solid ${EGG_DIV}`}}>
        <div style={{...s(15,INK,"500"),overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.from}</div>
        <div style={{...s(13,INK),marginTop:2,lineHeight:1.4}}>{m.summary || m.subject || "(no subject)"}</div>
        {m.why && <div style={{...s(11,MUT,"500",1.1),textTransform:"uppercase",marginTop:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{m.why}</div>}
      </div>
    ))}
  </Panel>);
};

const Home = ({nav, pendingAdd, onPendingConsumed, calendarEvents, setCalendarEvents, setToast}) => {
  const [todos,setTodos]=useState([]);
  const [newItem,setNewItem]=useState("");
  const [weather,setWeather]=useState(null);
  const [isPlaying,setIsPlaying]=useState(false);
  const [todaysEvents,setTodaysEvents]=useState([]);
  const [mailCount,setMailCount]=useState(0);
  // Minute-tick state so the Schedule list and briefing re-evaluate "past" events
  // up to the minute. Updated every 30s.
  const [now,setNow] = useState(() => new Date());
  useEffect(()=>{
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  },[]);

  // Action Button hand-off: if the router queued an item (from the iOS Shortcut
  // double-tap), route it through the intent classifier and let the router
  // know we consumed it.
  useEffect(()=>{
    if (pendingAdd) {
      routeAdd(pendingAdd);
      onPendingConsumed?.();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[pendingAdd]);

  useEffect(()=>{
    const load=async(lat,lon)=>{
      try{const r=await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&temperature_unit=fahrenheit&timezone=auto&forecast_days=1`);const d=await r.json();setWeather({high:Math.round(d.daily.temperature_2m_max[0]),low:Math.round(d.daily.temperature_2m_min[0]),condition:wmoCondition(d.daily.weathercode[0])});}
      catch{setWeather({high:67,low:48,condition:"Mostly Sunny"});}
    };
    navigator.geolocation?navigator.geolocation.getCurrentPosition(p=>load(p.coords.latitude,p.coords.longitude),()=>setWeather({high:67,low:48,condition:"Mostly Sunny"}),{timeout:5000}):setWeather({high:67,low:48,condition:"Mostly Sunny"});
  },[]);

  // Pull today's Google Calendar events for the Schedule panel.
  useEffect(()=>{
    let cancelled=false;
    const today=new Date();
    const dateStr=`${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
    (async()=>{
      try{
        const r=await fetch(`/api/calendar-events?date=${dateStr}`,{credentials:"same-origin"});
        if(cancelled||!r.ok) return;
        const d=await r.json();
        const onToday=(d.events||[]).filter(ev=>eventIsOnLocalDay(ev,today.getFullYear(),today.getMonth(),today.getDate()));
        setTodaysEvents(onToday.map(ev=>({...ev,time:formatEventTime(ev.start,ev.allDay)})));
      }catch{}
    })();
    return ()=>{cancelled=true;};
  },[]);
  useEffect(()=>()=>{window.speechSynthesis?.cancel();},[]);

  const toggleTodo=id=>setTodos(p=>p.map(t=>t.id===id?{...t,done:!t.done}:t));

  // Route a free-text add to either todos or the calendar. Optimistically
  // adds to todos for instant feedback, then re-homes to events if Claude
  // classifies it as an event.
  const routeAdd = async (text) => {
    const tx = (text || "").trim();
    if (!tx) return;
    const tempId = Date.now();
    setTodos(p => [...p, {id: tempId, text: tx, done: false}]);
    setNewItem("");
    const cls = await classifyAdd(tx);
    if (cls?.kind === "event" && setCalendarEvents) {
      setTodos(p => p.filter(t => t.id !== tempId));
      const targetDate = cls.date ? new Date(cls.date + "T00:00:00") : new Date();
      const day = isNaN(targetDate.getTime()) ? new Date().getDate() : targetDate.getDate();
      setCalendarEvents(p => ({
        ...p,
        [day]: [...(p[day] || []), {id:`local-${tempId}`, time: cls.time || "", title: cls.title || tx}],
      }));
      if (setToast) { setToast("Added to schedule"); setTimeout(()=>setToast(null), 2200); }
    } else if (cls?.title && cls.title !== tx) {
      setTodos(p => p.map(t => t.id === tempId ? {...t, text: cls.title} : t));
    }
  };
  const addTodo = () => routeAdd(newItem);

  // Voice input — uses shared hook. Spoken text gets routed by intent too.
  const {onMicClick: micFn, isRecording, micStatus, micMsg} = useMic(
    tx => routeAdd(tx),
    tx => setNewItem(tx),   // live transcript appears in the input
  );
  const onMicClick = () => {
    // If there's already typed text, treat mic tap as "submit" rather than starting recording
    if(newItem.trim()) { addTodo(); return; }
    micFn();
  };

  // Pick the most elegant available British female voice
  const briefingVoiceRef = useRef(null);
  useEffect(()=>{
    const pickVoice=()=>{
      const voices=window.speechSynthesis?.getVoices?.()||[];
      const british=voices.filter(v=>/en[-_]?GB/i.test(v.lang));
      const preferred=[
        "Google UK English Female",
        "Microsoft Libby Online (Natural) - English (United Kingdom)",
        "Microsoft Sonia Online (Natural) - English (United Kingdom)",
        "Microsoft Hazel - English (United Kingdom)",
        "Kate","Serena","Susan","Fiona","Moira","Tessa","Amelie",
      ];
      let pick=null;
      for(const name of preferred){pick=british.find(v=>v.name===name)||voices.find(v=>v.name===name);if(pick)break;}
      if(!pick) pick=british.find(v=>/female/i.test(v.name))||british[0]||null;
      briefingVoiceRef.current=pick;
    };
    pickVoice();
    if(window.speechSynthesis) window.speechSynthesis.onvoiceschanged=pickVoice;
  },[]);

  // Briefing is synthesized server-side by Claude (api/briefing.js) using the
  // user's calendar, flagged inbox, and onboarding profile. Falls back to a
  // simple template if the API is unreachable or the user isn't connected.
  const [briefing,setBriefing] = useState("Catching you up…");
  const fetchBriefing = () => {
    const local = new Date();
    const hour = local.getHours();
    const weekday = local.toLocaleDateString("en-US",{weekday:"long"});
    return fetch(`/api/briefing?hour=${hour}&weekday=${encodeURIComponent(weekday)}`,{credentials:"same-origin"})
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d?.briefing) setBriefing(d.briefing); })
      .catch(()=>{});
  };
  useEffect(()=>{ fetchBriefing(); },[]);

  // Filter past events out of the Schedule (use event end time so the current
  // event stays visible while it's happening). All-day events stay all day.
  const upcomingEvents = todaysEvents.filter(ev => {
    if (ev.allDay) return true;
    const endIso = ev.end || ev.start;
    if (!endIso) return true;
    return new Date(endIso) > now;
  });

  // When an event passes (count drops), refetch the briefing so it reflects
  // only what's still ahead.
  const upcomingCountRef = useRef(null);
  useEffect(()=>{
    const count = upcomingEvents.length;
    if (upcomingCountRef.current !== null && count < upcomingCountRef.current) {
      fetchBriefing();
    }
    upcomingCountRef.current = count;
  },[upcomingEvents.length]);

  const briefingText = briefing;
  const briefingScript = briefing;
  const toggleBriefing=()=>{
    if(!window.speechSynthesis)return;
    if(isPlaying){window.speechSynthesis.cancel();setIsPlaying(false);return;}
    const u=new SpeechSynthesisUtterance(briefingScript);
    u.rate=.92;u.pitch=1.05;u.volume=1;
    if(briefingVoiceRef.current){u.voice=briefingVoiceRef.current;u.lang=briefingVoiceRef.current.lang;}else{u.lang="en-GB";}
    u.onend=()=>setIsPlaying(false);u.onerror=()=>setIsPlaying(false);
    setIsPlaying(true);window.speechSynthesis.speak(u);
  };

  // `now` comes from the minute-tick state at the top of the component, so the
  // header date/time stays current without a second clock.
  const dayName=now.toLocaleDateString("en-US",{weekday:"long"});
  const dateStr=`${String(now.getMonth()+1).padStart(2,"0")}/${String(now.getDate()).padStart(2,"0")}`;
  const captionDate=now.toLocaleDateString("en-US",{month:"long",day:"numeric"}).toUpperCase();
  const timeStr=`${now.getHours()}:${String(now.getMinutes()).padStart(2,"0")}`;

  return (
    <div style={{height:"100%",position:"relative"}}>
      <div style={{height:"100%",overflowY:"auto",paddingBottom:132}}>

        {/* ─── Container 1: Header + Briefing ─── */}
        <Panel mt={14}>
          {/* Top row: weather (left) + rotated date (right) */}
          <div style={{padding:"13px 14px 0",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <span style={{...s(11,INK,"500",1),textTransform:"uppercase",marginTop:2}}>
              {weather?`H${weather.high}°\u00A0 L${weather.low}°\u00A0\u00A0${weather.condition.toUpperCase()}`:"Loading weather…"}
            </span>
            <div style={{width:28,height:70,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:-2}}>
              <span style={{fontFamily:F,fontSize:16,fontWeight:300,color:INK,letterSpacing:"-.4px",transform:"rotate(90deg)",whiteSpace:"nowrap",display:"block"}}>{dateStr}</span>
            </div>
          </div>
          {/* Day name (own line) ; then caption + play pill on shared baseline */}
          <div style={{padding:"0 14px 14px",marginTop:-8}}>
            <div style={{fontFamily:FH,fontSize:35,fontWeight:500,color:INK,lineHeight:"40px"}}>{dayName}</div>
            <div style={{display:"flex",alignItems:"center",gap:12,marginTop:8}}>
              <div style={{...s(12,MUT,"500",1.4),textTransform:"uppercase"}}>{captionDate}</div>
              <button onClick={toggleBriefing} style={{height:25,border:`1px solid ${isPlaying?EGG:EGG}`,borderRadius:13,padding:"0 12px 0 10px",display:"inline-flex",alignItems:"center",gap:6,cursor:"pointer",background:isPlaying?EGG:GROUND,fontFamily:F,transition:"background .2s"}}>
                {isPlaying?<svg width="9" height="10" viewBox="0 0 8 9" fill={INK}><rect x=".5" y=".5" width="2.5" height="8" rx=".5"/><rect x="5" y=".5" width="2.5" height="8" rx=".5"/></svg>:<svg width="8" height="9" viewBox="0 0 7 8" fill={EGG}><path d="M0.5 0.5L6.5 4L0.5 7.5Z"/></svg>}
                <span style={{...s(11,INK,"500",.7)}}>{isPlaying?"STOP":"0:30"}</span>
              </button>
            </div>
          </div>
          <PanelHR/>
          {/* Briefing — readable body */}
          <div style={{padding:"14px 14px 16px"}}>
            <p style={{...s(15),lineHeight:1.6,margin:0}}>{briefingText}</p>
          </div>
        </Panel>

        {/* ─── Container 1.5: Hottest Mail (Gmail integration) ─── */}
        <HottestMail onCount={setMailCount}/>

        {/* ─── Container 2: Schedule — upcoming events only (past events hide automatically) ─── */}
        <Panel>
          <Eyebrow>Schedule</Eyebrow>
          {upcomingEvents.length === 0 ? (
            <div style={{padding:"11px 14px",borderTop:`.5px solid ${EGG_DIV}`}}>
              <span style={{...s(12,MUT)}}>{todaysEvents.length === 0 ? "Nothing on your calendar today." : "Nothing left on your calendar today."}</span>
            </div>
          ) : upcomingEvents.map(ev=>(
            <div key={ev.id} style={{display:"flex",alignItems:"center",gap:14,padding:"11px 14px",borderTop:`.5px solid ${EGG_DIV}`}}>
              <span style={{...s(12,MUT),width:50,flexShrink:0}}>{ev.time}</span>
              <span style={{...s(15),flex:1,minWidth:0,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ev.title}</span>
            </div>
          ))}
        </Panel>

        {/* ─── Container 3: To-Do ─── */}
        <Panel>
          <Eyebrow>To-Do</Eyebrow>
          {todos.map(todo=>(
            <div key={todo.id} onClick={()=>toggleTodo(todo.id)} style={{display:"flex",alignItems:"center",gap:13,padding:"11px 14px",borderTop:`.5px solid ${EGG_DIV}`,cursor:"pointer"}}>
              <div style={{width:17,height:17,borderRadius:"50%",flexShrink:0,border:`1px solid ${todo.done?INK:EGG}`,background:todo.done?INK:"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s"}}>
                {todo.done&&<svg width="9" height="9" viewBox="0 0 8 8" fill="none"><path d="M1 4L3 6L7 2" stroke={WHT} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>}
              </div>
              <span style={{...s(15,todo.done?MUT:INK),textDecoration:todo.done?"line-through":"none",transition:"color .15s",flex:1}}>{todo.text}</span>
              <ItemIcon type={iconFor(todo.text)} size={13} color={INK}/>
            </div>
          ))}
        </Panel>
      </div>
      <BottomNav active="home" nav={nav} inputValue={newItem} onInputChange={setNewItem} onInputSubmit={addTodo} onMicClick={onMicClick} isRecording={isRecording} micStatus={micStatus} micMsg={micMsg}/>
    </div>
  );
};

// ─── LISTS ───────────────────────────────────────────────────
// Lists are created from scratch by the user — no seed data.
// Shape: { id, title, items: [{id, text, done}] }.
const ListsGrid = ({nav, setSelectedList, lists, setLists}) => {
  const [view,setView]=useState("list");

  const createList = () => {
    const draft = { id: Date.now(), title: "", items: [] };
    setLists(p => [...p, draft]);
    setSelectedList(draft);
    nav("list-detail");
  };

  const openList = (list) => { setSelectedList(list); nav("list-detail"); };

  const Card = ({list}) => {
    const shared = !!list.slug;
    const title = list.title || "Untitled";
    return (
      <div onClick={()=>openList(list)} style={{background:GROUND,border:`.5px solid ${EGG_BDR}`,padding:13,cursor:"pointer"}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:6,marginBottom:8}}>
          <p style={{...s(15,INK,"500"),margin:0,flex:1,fontStyle:list.title?"normal":"italic",color:list.title?INK:MUT}}>{title}</p>
          {shared&&<ItemIcon type="share" size={13} color={EGG}/>}
        </div>
        {list.items.slice(0,5).map((item,i)=>(
          <div key={item.id ?? i} style={{display:"flex",alignItems:"flex-start",gap:6,marginBottom:4}}>
            <div style={{width:10,height:10,border:`.5px solid ${EGG}`,borderRadius:"50%",flexShrink:0,marginTop:3,background:"transparent"}}/>
            <span style={{...s(12),lineHeight:1.4}}>{item.text}</span>
          </div>
        ))}
        {list.items.length>5&&<p style={{...s(11,MUT),marginTop:5}}>+ {list.items.length-5} more</p>}
        {list.items.length===0&&<p style={{...s(11,MUT),marginTop:5}}>Empty — tap to add items</p>}
      </div>
    );
  };

  const left = lists.filter((_,i) => i%2 === 0);
  const right = lists.filter((_,i) => i%2 === 1);

  return (
    <div style={{height:"100%",position:"relative",display:"flex",flexDirection:"column"}}>
      <div style={{paddingTop:18,paddingBottom:14}}>
        <div style={{padding:"0 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <h1 style={{...s(35,INK,"500"),fontFamily:FH,margin:0}}>Lists</h1>
          {lists.length > 0 && <Toggle options={[["List","list"],["Grid","grid"]]} value={view} onChange={setView}/>}
        </div>
      </div>
      <div style={{overflowY:"auto",flex:1,paddingBottom:120}}>
        {lists.length === 0 ? (
          <div style={{padding:"80px 32px",textAlign:"center"}}>
            <p style={{...s(15,INK),lineHeight:1.5,margin:0}}>No lists yet.</p>
            <p style={{...s(13,MUT),lineHeight:1.55,margin:"8px 0 0"}}>Tap the + to start one.</p>
          </div>
        ) : view === "grid" ? (
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,padding:"4px 20px",alignItems:"start"}}>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>{left.map(l=><Card key={l.id} list={l}/>)}</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>{right.map(l=><Card key={l.id} list={l}/>)}</div>
          </div>
        ) : (
          <Panel mt={0}>
            {lists.map((list,i)=>{
              const shared = !!list.slug;
              const title = list.title || "Untitled";
              return (
                <div key={list.id} onClick={()=>openList(list)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 14px",cursor:"pointer",borderTop:i===0?"none":`.5px solid ${EGG_DIV}`}}>
                  <div style={{flex:1}}>
                    <div style={{display:"flex",alignItems:"center",gap:8}}>
                      <p style={{...s(15,list.title?INK:MUT),margin:0,fontStyle:list.title?"normal":"italic"}}>{title}</p>
                      {shared && <ItemIcon type="share" size={13} color={EGG}/>}
                    </div>
                    <p style={{...s(12,MUT),marginTop:3}}>{list.items.length} {list.items.length===1?"item":"items"}{shared?` · Shared`:""}</p>
                  </div>
                  <ChevronR/>
                </div>
              );
            })}
          </Panel>
        )}
      </div>
      {/* Floating + button — primary CTA for creating a list */}
      <button onClick={createList} aria-label="Create new list" style={{
        position:"absolute",
        right:20,
        bottom:"calc(96px + env(safe-area-inset-bottom))",
        width:62,height:62,
        borderRadius:"50%",
        background:INK,
        color:WHT,
        border:"none",
        cursor:"pointer",
        boxShadow:"0 6px 22px rgba(0,0,0,0.22)",
        display:"flex",alignItems:"center",justifyContent:"center",
        zIndex:5,
      }}>
        <svg width="22" height="22" viewBox="0 0 22 22" fill="none" stroke={WHT} strokeWidth="2" strokeLinecap="round">
          <path d="M11 4v14M4 11h14"/>
        </svg>
      </button>
      <BottomNav active="lists" nav={nav} hideInput/>
    </div>
  );
};

const ShareModal = ({onClose, shareUrl, publishing, onNativeShare, onCopy, copied}) => (
  <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.45)",display:"flex",alignItems:"flex-end",zIndex:100}}>
    <div style={{background:GROUND,width:"100%",borderRadius:"24px 24px 0 0",padding:"0 0 32px",borderTop:`.5px solid ${EGG_BDR}`}}>
      <div style={{padding:"16px 24px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={s(15,INK,"500")}>Share this list</span>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontFamily:F,fontSize:22,color:MUT}}>×</button>
      </div>
      <div style={{height:.5,background:EGG_DIV}}/>
      <div style={{padding:"16px 24px"}}>
        <p style={{...s(15,MUT),lineHeight:1.5,margin:"0 0 14px"}}>Anyone with this link can add and check off items in real time.</p>
        {publishing ? (
          <div style={{textAlign:"center",padding:"24px 0"}}>
            <span style={{...s(11,MUT,"500",1.3),textTransform:"uppercase"}}>Generating link…</span>
          </div>
        ) : shareUrl ? (
          <>
            <div style={{wordBreak:"break-all",background:GROUND,border:`.5px solid ${EGG_BDR}`,borderRadius:8,padding:"12px 14px",fontFamily:F,fontSize:13,color:INK,marginBottom:14}}>
              {shareUrl}
            </div>
            <div style={{marginBottom:10}}><PrimaryPill onClick={onNativeShare}>Share link</PrimaryPill></div>
            <OutlinePill onClick={onCopy}>{copied ? "Copied" : "Copy link"}</OutlinePill>
          </>
        ) : (
          <p style={{...s(13,RED),margin:0,textAlign:"center",padding:"12px 0"}}>Couldn't generate link. Close and try again.</p>
        )}
      </div>
    </div>
  </div>
);

const ListDetail = ({nav, list: selectedList, lists, setLists}) => {
  // Always read from the parent's lists array so updates persist across nav.
  const list = lists.find(l => l.id === selectedList?.id);
  const [newItem,setNewItem]=useState("");
  const [showShare,setShowShare]=useState(false);
  const [publishing,setPublishing]=useState(false);
  const [copied,setCopied]=useState(false);
  const [editingTitle,setEditingTitle]=useState(false);
  const [titleDraft,setTitleDraft]=useState("");
  // Highest remote updatedAt we've seen — guards against pull-echo after our own pushes.
  const remoteVersionRef = useRef(0);
  if (!list) return null;

  const namingMode = !list.title?.trim();
  const items = list.items || [];
  const shared = !!list.slug;
  const shareUrl = list.slug ? `${window.location.origin}/?list=${list.slug}` : null;

  // Push the full list (last-write-wins) to the shared backend.
  const pushUpdate = async (next) => {
    if (!next?.slug) return;
    try {
      const r = await fetch("/api/list", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({op:"update", slug: next.slug, title: next.title || "", items: next.items || []}),
      });
      if (r.ok) {
        const d = await r.json();
        if (d.list?.updatedAt) remoteVersionRef.current = d.list.updatedAt;
      }
    } catch {}
  };

  // Single mutation helper: applies a local update and (if shared) pushes to the backend.
  const mutate = (updater) => {
    const next = updater(list);
    setLists(prev => prev.map(l => l.id === list.id ? next : l));
    if (next.slug) pushUpdate(next);
  };

  // Poll remote for incoming changes from collaborators while this list is shared.
  useEffect(() => {
    if (!list?.slug) return;
    let cancelled = false;
    const tick = async () => {
      try {
        const r = await fetch(`/api/list?op=fetch&slug=${encodeURIComponent(list.slug)}`);
        if (cancelled || !r.ok) return;
        const d = await r.json();
        const remote = d.list;
        if (remote && remote.updatedAt > remoteVersionRef.current) {
          remoteVersionRef.current = remote.updatedAt;
          setLists(prev => prev.map(l => l.id === list.id ? {...l, title: remote.title, items: remote.items} : l));
        }
      } catch {}
    };
    tick();
    const id = setInterval(tick, 3000);
    return () => { cancelled = true; clearInterval(id); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list?.slug, list?.id]);

  const listType = detectListType(list.title);
  const grouped = listType ? items.reduce((acc, item) => {
    const c = item.category || "other";
    (acc[c] = acc[c] || []).push(item);
    return acc;
  }, {}) : null;
  const orderedCategories = listType
    ? LIST_CATEGORIES[listType].filter(c => grouped[c]?.length > 0)
    : [];

  // Packing-list "Don't forget" callout — dismissible per list, persisted in sessionStorage.
  const dfKey = `dontforget-${list.id}`;
  const [dontForgetDismissed, setDontForgetDismissed] = useState(() => {
    try { return sessionStorage.getItem(dfKey) === "1"; } catch { return false; }
  });
  const dismissDontForget = () => {
    try { sessionStorage.setItem(dfKey, "1"); } catch {}
    setDontForgetDismissed(true);
  };

  // Async helper: classify and attach a category to a single item. Uses
  // setLists prev-callback so the update lands on the freshest state.
  const applyCategory = (itemId, cat) => {
    if (!cat) return;
    setLists(prev => {
      const updated = prev.map(l => {
        if (l.id !== list.id) return l;
        return {...l, items: (l.items||[]).map(i => i.id === itemId ? {...i, category: cat} : i)};
      });
      const target = updated.find(l => l.id === list.id);
      if (target?.slug) pushUpdate(target);
      return updated;
    });
  };

  const setTitle = (t) => mutate(l => ({...l, title: t.trim()}));
  const addItem = (text) => {
    const tx = (text || "").trim();
    if (!tx) return;
    const newId = Date.now();
    mutate(l => ({...l, items: [...(l.items||[]), {id: newId, text: tx, done: false}]}));
    if (listType) categorizeItem(tx, listType).then(c => applyCategory(newId, c));
  };
  const addItems = (texts) => {
    const newOnes = (texts||[]).map(t => (t||"").trim()).filter(Boolean)
      .map((tx,i) => ({id: Date.now()+i, text: tx, done: false}));
    if (!newOnes.length) return;
    mutate(l => ({...l, items: [...(l.items||[]), ...newOnes]}));
    if (listType) newOnes.forEach(it => categorizeItem(it.text, listType).then(c => applyCategory(it.id, c)));
  };
  const toggle = (itemId) => mutate(l => ({...l, items: (l.items||[]).map(i => i.id === itemId ? {...i, done: !i.done} : i)}));

  const onSubmit = () => {
    if (!newItem.trim()) return;
    if (namingMode) setTitle(newItem);
    else addItem(newItem);
    setNewItem("");
  };

  const {onMicClick: micFn, isRecording, micStatus, micMsg} = useMic(
    async tx => {
      if (namingMode) {
        setTitle(tx);
        setNewItem("");
        return;
      }
      // Ask Claude to split the spoken text so "fish and chips" stays one item
      // but "cherries, bacon, and cucumbers" becomes three. Fall back to the
      // local regex parser if the API fails.
      let items = null;
      try {
        const r = await fetch("/api/parse-list", {
          method: "POST",
          headers: {"Content-Type":"application/json"},
          credentials: "same-origin",
          body: JSON.stringify({text: tx}),
        });
        if (r.ok) {
          const d = await r.json();
          if (Array.isArray(d.items) && d.items.length > 0) items = d.items;
        }
      } catch {}
      if (!items) items = parseListItems(tx);
      addItems(items);
      setNewItem("");
    },
    tx => setNewItem(tx),   // live transcript while speaking
  );
  const onMicClick = () => { if (newItem.trim()) { onSubmit(); return; } micFn(); };

  const startRename = () => { setTitleDraft(list.title); setEditingTitle(true); };
  const saveRename = () => {
    const t = titleDraft.trim();
    if (t) setTitle(t);
    setEditingTitle(false);
  };
  const deleteList = () => {
    if (!window.confirm(`Delete "${list.title || "this list"}"? This can't be undone.`)) return;
    if (list.slug) {
      // Stop sharing — recipients will see "list not found" on next poll.
      fetch("/api/list", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({op:"delete", slug: list.slug}),
      }).catch(()=>{});
    }
    setLists(prev => prev.filter(l => l.id !== list.id));
    nav("lists");
  };

  // Open the share modal. Publishes the list first if it doesn't have a slug yet.
  const openShare = async () => {
    setCopied(false);
    setShowShare(true);
    if (list.slug) return;
    setPublishing(true);
    try {
      const r = await fetch("/api/list", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({op:"publish", title: list.title || "", items}),
      });
      if (r.ok) {
        const d = await r.json();
        remoteVersionRef.current = Date.now();
        setLists(prev => prev.map(l => l.id === list.id ? {...l, slug: d.slug} : l));
      }
    } catch {}
    setPublishing(false);
  };

  // Hand off to the OS share sheet (Messages, etc.). Falls back to copy.
  const doNativeShare = async () => {
    if (!shareUrl) return;
    const data = {
      title: `Robin list: ${list.title || "Untitled"}`,
      text: `Sharing my "${list.title || "Untitled"}" list from Robin — tap the link to add and check off items together.`,
      url: shareUrl,
    };
    if (navigator.share) {
      try {
        await navigator.share(data);
        setShowShare(false);
        return;
      } catch (e) {
        if (e?.name === "AbortError") return; // user dismissed the sheet
      }
    }
    doCopy();
  };

  const doCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copy this link:", shareUrl);
    }
  };

  return (
    <div style={{height:"100%",position:"relative",display:"flex",flexDirection:"column"}}>
      <BackNav nav={nav} to="lists"/>
      <div style={{padding:"0 20px",marginTop:8,marginBottom:18}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
          {editingTitle ? (
            <input
              autoFocus
              value={titleDraft}
              onChange={e=>setTitleDraft(e.target.value)}
              onBlur={saveRename}
              onKeyDown={e=>{ if (e.key==="Enter") saveRename(); if (e.key==="Escape") setEditingTitle(false); }}
              style={{...s(35,INK,"500"),fontFamily:FH,margin:0,flex:1,minWidth:0,background:"transparent",border:"none",borderBottom:`1.5px solid ${INK}`,outline:"none",padding:"2px 0"}}
            />
          ) : (
            <h1
              onClick={namingMode ? undefined : startRename}
              title={namingMode ? undefined : "Tap to rename"}
              style={{...s(35,list.title?INK:MUT,"500"),fontFamily:FH,margin:0,flex:1,minWidth:0,fontStyle:list.title?"normal":"italic",cursor:namingMode?"default":"pointer"}}
            >
              {list.title || "New list"}
            </h1>
          )}
          {!namingMode && !editingTitle && (
            <button onClick={openShare} aria-label="Share list" style={{background:"none",border:"none",cursor:"pointer",padding:6,display:"flex",alignItems:"center",justifyContent:"center"}}>
              <ItemIcon type="share" size={20} color={shared?EGG:MUT}/>
            </button>
          )}
        </div>
        <p style={{...s(15,MUT),margin:"8px 0 0",lineHeight:1.5}}>
          {namingMode
            ? "Name your list to get started."
            : `${items.length} ${items.length===1?"item":"items"} · ${items.filter(i=>i.done).length} done${shared?` · Shared`:""}`
          }
        </p>
      </div>
      <div style={{overflowY:"auto",flex:1,paddingBottom:132,position:"relative"}}>
        {!namingMode && listType === "packing" && !dontForgetDismissed && (
          <DontForgetCard items={DONT_FORGET.packing} onAdd={addItem} onClose={dismissDontForget}/>
        )}
        {!namingMode && items.length > 0 && (
          listType ? (
            <>
              {orderedCategories.map(cat => (
                <Panel key={cat}>
                  <Eyebrow>{cat.toUpperCase()}</Eyebrow>
                  {grouped[cat].map((item, i) => (
                    <div key={item.id} onClick={()=>toggle(item.id)} style={{display:"flex",alignItems:"center",gap:13,padding:"12px 14px",cursor:"pointer",borderTop:`.5px solid ${EGG_DIV}`}}>
                      <div style={{width:18,height:18,borderRadius:"50%",border:`1.5px solid ${INK}`,background:item.done?INK:"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",transition:"background .15s"}}>
                        {item.done && <svg width="10" height="10" viewBox="0 0 8 8" fill="none"><path d="M1 4.5L3.5 7L7.5 2" stroke={WHT} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                      <span style={{...s(15,item.done?MUT:INK),textDecoration:item.done?"line-through":"none"}}>{item.text}</span>
                    </div>
                  ))}
                </Panel>
              ))}
            </>
          ) : (
            <Panel>
              {items.map((item,i)=>(
                <div key={item.id} onClick={()=>toggle(item.id)} style={{display:"flex",alignItems:"center",gap:13,padding:"12px 14px",cursor:"pointer",borderTop:i===0?"none":`.5px solid ${EGG_DIV}`}}>
                  <div style={{width:18,height:18,borderRadius:"50%",border:`1.5px solid ${INK}`,background:item.done?INK:"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",transition:"background .15s"}}>
                    {item.done && <svg width="10" height="10" viewBox="0 0 8 8" fill="none"><path d="M1 4.5L3.5 7L7.5 2" stroke={WHT} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <span style={{...s(15,item.done?MUT:INK),textDecoration:item.done?"line-through":"none"}}>{item.text}</span>
                </div>
              ))}
            </Panel>
          )
        )}
        {!namingMode && (
          <div style={{textAlign:"center",marginTop:32,padding:"0 20px"}}>
            <button onClick={deleteList} style={{background:"none",border:"none",fontFamily:F,fontSize:10,color:RED,cursor:"pointer",letterSpacing:"1.32px",textTransform:"uppercase"}}>Delete list</button>
          </div>
        )}
      </div>
      {showShare && <ShareModal onClose={()=>setShowShare(false)} shareUrl={shareUrl} publishing={publishing} onNativeShare={doNativeShare} onCopy={doCopy} copied={copied}/>}
      <BottomNav
        active="lists"
        nav={nav}
        inputValue={newItem}
        onInputChange={setNewItem}
        onInputSubmit={onSubmit}
        onMicClick={onMicClick}
        isRecording={isRecording}
        micStatus={micStatus}
        micMsg={micMsg}
        placeholder={namingMode ? "Name your list" : "+ Add item"}
      />
    </div>
  );
};

// ─── SHARED LIST (recipient view) ────────────────────────────
// Standalone view rendered when ?list=<slug> is present in the URL.
// No Robin shell — just the live list. Fetches from /api/list?op=fetch on
// mount, polls every 3s for changes, and pushes edits via /api/list (op:update).
const SharedListView = ({slug}) => {
  const [status,setStatus]   = useState("loading"); // loading | ok | not-found | error
  const [list,setList]       = useState(null);
  const [newItem,setNewItem] = useState("");
  const [editingTitle,setEditingTitle] = useState(false);
  const [titleDraft,setTitleDraft]     = useState("");
  // Latest server updatedAt we've seen — suppresses pull-echo after our own writes.
  const remoteVersionRef = useRef(0);

  // Fetch on mount + poll every 3s for collaborator changes.
  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    const tick = async () => {
      try {
        const r = await fetch(`/api/list?op=fetch&slug=${encodeURIComponent(slug)}`);
        if (cancelled) return;
        if (r.status === 404) { setStatus("not-found"); return; }
        if (!r.ok) { setStatus(p => p === "ok" ? "ok" : "error"); return; }
        const d = await r.json();
        const remote = d.list;
        if (!remote) { setStatus("not-found"); return; }
        if (remote.updatedAt > remoteVersionRef.current) {
          remoteVersionRef.current = remote.updatedAt;
          setList(remote);
        }
        setStatus("ok");
      } catch {
        if (!cancelled) setStatus(p => p === "ok" ? "ok" : "error");
      }
    };
    tick();
    const id = setInterval(tick, 3000);
    return () => { cancelled = true; clearInterval(id); };
  }, [slug]);

  const push = async (next) => {
    try {
      const r = await fetch("/api/list", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({op:"update", slug, title: next.title || "", items: next.items || []}),
      });
      if (r.ok) {
        const d = await r.json();
        if (d.list?.updatedAt) remoteVersionRef.current = d.list.updatedAt;
      } else if (r.status === 404) {
        setStatus("not-found");
      }
    } catch {}
  };

  const mutate = (updater) => {
    if (!list) return;
    const next = updater(list);
    setList(next);
    push(next);
  };

  const listType = list ? detectListType(list.title) : null;
  const setTitle = (t) => mutate(l => ({...l, title: (t||"").trim()}));
  const addItem  = () => {
    const tx = newItem.trim();
    if (!tx) return;
    const newId = Date.now();
    mutate(l => ({...l, items: [...(l.items||[]), {id: newId, text: tx, done: false}]}));
    setNewItem("");
    if (listType) {
      categorizeItem(tx, listType).then(cat => {
        if (!cat) return;
        setList(prev => {
          if (!prev) return prev;
          const withCat = {...prev, items: prev.items.map(i => i.id === newId ? {...i, category: cat} : i)};
          push(withCat);
          return withCat;
        });
      });
    }
  };
  const toggle = (itemId) => mutate(l => ({...l, items: (l.items||[]).map(i => i.id === itemId ? {...i, done: !i.done} : i)}));

  const startRename = () => { setTitleDraft(list?.title || ""); setEditingTitle(true); };
  const saveRename  = () => { const t = titleDraft.trim(); if (t) setTitle(t); setEditingTitle(false); };

  if (status === "loading") {
    return (
      <div style={{height:"100%",display:"flex",alignItems:"center",justifyContent:"center"}}>
        <span style={{...s(11,MUT,"500",1.3),textTransform:"uppercase"}}>Loading…</span>
      </div>
    );
  }
  if (status === "not-found") {
    return (
      <div style={{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 32px",textAlign:"center"}}>
        <h1 style={{...s(28,INK,"500"),fontFamily:FH,margin:0}}>List not found</h1>
        <p style={{...s(15,MUT),marginTop:12,lineHeight:1.5}}>This shared list may have been deleted, or the link isn't valid anymore.</p>
      </div>
    );
  }
  if (status === "error" || !list) {
    return (
      <div style={{height:"100%",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"0 32px",textAlign:"center"}}>
        <h1 style={{...s(28,INK,"500"),fontFamily:FH,margin:0}}>Can't reach this list</h1>
        <p style={{...s(15,MUT),marginTop:12,lineHeight:1.5}}>Check your connection and refresh.</p>
      </div>
    );
  }

  const items = list.items || [];
  const doneCount = items.filter(i => i.done).length;
  const grouped = listType ? items.reduce((acc, item) => {
    const c = item.category || "other";
    (acc[c] = acc[c] || []).push(item);
    return acc;
  }, {}) : null;
  const orderedCategories = listType
    ? LIST_CATEGORIES[listType].filter(c => grouped[c]?.length > 0)
    : [];

  return (
    <div style={{height:"100%",position:"relative",display:"flex",flexDirection:"column"}}>
      <div style={{textAlign:"center",paddingTop:24,paddingBottom:18}}>
        <span style={{...s(11,MUT,"500",1.3),textTransform:"uppercase"}}>Robin · Shared list</span>
      </div>
      <div style={{padding:"0 20px",marginTop:0,marginBottom:18}}>
        {editingTitle ? (
          <input
            autoFocus
            value={titleDraft}
            onChange={e=>setTitleDraft(e.target.value)}
            onBlur={saveRename}
            onKeyDown={e=>{ if (e.key==="Enter") saveRename(); if (e.key==="Escape") setEditingTitle(false); }}
            style={{...s(35,INK,"500"),fontFamily:FH,margin:0,width:"100%",background:"transparent",border:"none",borderBottom:`1.5px solid ${INK}`,outline:"none",padding:"2px 0"}}
          />
        ) : (
          <h1
            onClick={startRename}
            title="Tap to rename"
            style={{...s(35,list.title?INK:MUT,"500"),fontFamily:FH,margin:0,fontStyle:list.title?"normal":"italic",cursor:"pointer"}}
          >
            {list.title || "Untitled list"}
          </h1>
        )}
        <p style={{...s(15,MUT),margin:"8px 0 0",lineHeight:1.5}}>
          {items.length} {items.length===1?"item":"items"} · {doneCount} done
        </p>
      </div>
      <div style={{overflowY:"auto",flex:1,paddingBottom:90,position:"relative"}}>
        {items.length > 0 && (
          listType ? (
            <>
              {orderedCategories.map(cat => (
                <Panel key={cat}>
                  <Eyebrow>{cat.toUpperCase()}</Eyebrow>
                  {grouped[cat].map((item) => (
                    <div key={item.id} onClick={()=>toggle(item.id)} style={{display:"flex",alignItems:"center",gap:13,padding:"12px 14px",cursor:"pointer",borderTop:`.5px solid ${EGG_DIV}`}}>
                      <div style={{width:18,height:18,borderRadius:"50%",border:`1.5px solid ${INK}`,background:item.done?INK:"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",transition:"background .15s"}}>
                        {item.done && <svg width="10" height="10" viewBox="0 0 8 8" fill="none"><path d="M1 4.5L3.5 7L7.5 2" stroke={WHT} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                      <span style={{...s(15,item.done?MUT:INK),textDecoration:item.done?"line-through":"none"}}>{item.text}</span>
                    </div>
                  ))}
                </Panel>
              ))}
            </>
          ) : (
            <Panel>
              {items.map((item,i)=>(
                <div key={item.id} onClick={()=>toggle(item.id)} style={{display:"flex",alignItems:"center",gap:13,padding:"12px 14px",cursor:"pointer",borderTop:i===0?"none":`.5px solid ${EGG_DIV}`}}>
                  <div style={{width:18,height:18,borderRadius:"50%",border:`1.5px solid ${INK}`,background:item.done?INK:"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",transition:"background .15s"}}>
                    {item.done && <svg width="10" height="10" viewBox="0 0 8 8" fill="none"><path d="M1 4.5L3.5 7L7.5 2" stroke={WHT} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <span style={{...s(15,item.done?MUT:INK),textDecoration:item.done?"line-through":"none"}}>{item.text}</span>
                </div>
              ))}
            </Panel>
          )
        )}
      </div>
      <div style={{position:"absolute",bottom:0,left:0,right:0,background:GROUND,borderTop:`.5px solid ${EGG_BDR}`,paddingBottom:"env(safe-area-inset-bottom)"}}>
        <div style={{margin:"14px 24px",display:"flex",gap:12}}>
          <input
            value={newItem}
            onChange={e=>setNewItem(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&addItem()}
            placeholder="+ Add item"
            style={{flex:1,height:44,border:`0.5px solid ${INK}`,borderRadius:22,padding:"0 20px",fontFamily:F,fontSize:15,color:INK,background:GROUND,outline:"none"}}
          />
          <button
            onClick={addItem}
            disabled={!newItem.trim()}
            aria-label="Add"
            style={{width:44,height:44,background:GROUND,border:`0.5px solid ${INK}`,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",cursor:newItem.trim()?"pointer":"default",flexShrink:0,opacity:newItem.trim()?1:.4}}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke={INK} strokeWidth="1.5" strokeLinecap="round">
              <line x1="8" y1="3" x2="8" y2="13"/>
              <line x1="3" y1="8" x2="13" y2="8"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── HOME v2 — simplified-design preview ─────────────────────
// Parallel Today screen for visual A/B with the current Home. Opened
// at /?v=2. Same APIs (briefing, calendar-events, gmail-important).
// Typography: Inter sans-serif. No Panel borders. Hero section headers.
const V2_FONT = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const V2_TEXT = "#171717";
const V2_MUT  = "#737373";

// Split a Claude-written briefing into a bold headline (first sentence)
// and a body paragraph (the rest), so the visual hierarchy in the mockup
// works without rewriting the prompt.
const splitBriefing = (text) => {
  if (!text) return {headline: "", body: ""};
  const m = text.match(/^([^.!?]+[.!?])\s*([\s\S]*)$/);
  if (!m) return {headline: text.trim(), body: ""};
  return {headline: m[1].trim(), body: m[2].trim()};
};

const HomeV2 = ({nav}) => {
  const [briefing,setBriefing] = useState("Catching you up…");
  const [weather,setWeather]   = useState(null);
  const [todaysEvents,setTodaysEvents] = useState([]);
  const [inbox,setInbox]       = useState(null); // null=loading, []=empty, [...]=ok
  const [todos,setTodos]       = useState([]);
  const [newItem,setNewItem]   = useState("");

  // Briefing
  useEffect(() => {
    const d = new Date();
    fetch(`/api/briefing?hour=${d.getHours()}&weekday=${encodeURIComponent(d.toLocaleDateString("en-US",{weekday:"long"}))}`,{credentials:"same-origin"})
      .then(r => r.ok ? r.json() : null)
      .then(d => d?.briefing && setBriefing(d.briefing))
      .catch(()=>{});
  }, []);

  // Weather
  useEffect(() => {
    const stub = {high:67,low:48,condition:"Mostly Sunny"};
    const load = (lat,lon) => fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&temperature_unit=fahrenheit&timezone=auto&forecast_days=1`)
      .then(r => r.json())
      .then(d => setWeather({high:Math.round(d.daily.temperature_2m_max[0]), low:Math.round(d.daily.temperature_2m_min[0]), condition: wmoCondition(d.daily.weathercode[0])}))
      .catch(()=>setWeather(stub));
    if (navigator.geolocation) navigator.geolocation.getCurrentPosition(p => load(p.coords.latitude, p.coords.longitude), ()=>setWeather(stub), {timeout:5000});
    else setWeather(stub);
  }, []);

  // Today's events (filtered to today)
  useEffect(() => {
    const now = new Date();
    fetch(`/api/calendar-events?year=${now.getFullYear()}&month=${now.getMonth()+1}`,{credentials:"same-origin"})
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d?.events) { setTodaysEvents([]); return; }
        const todayStr = now.toDateString();
        const list = d.events.filter(ev => {
          const dt = ev.allDay ? new Date(ev.start+"T00:00:00") : new Date(ev.start);
          return !isNaN(dt) && dt.toDateString() === todayStr;
        }).map(ev => ({
          id: ev.id,
          time: formatEventTime(ev.start, ev.allDay),
          title: ev.title || "(no title)",
          subtitle: ev.location || "",
        }));
        setTodaysEvents(list);
      })
      .catch(()=>setTodaysEvents([]));
  }, []);

  // Inbox
  useEffect(() => {
    fetch("/api/gmail-important",{credentials:"same-origin"})
      .then(r => r.ok ? r.json() : null)
      .then(d => setInbox(d?.messages || []))
      .catch(()=>setInbox([]));
  }, []);

  const toggleTodo = (id) => setTodos(p => p.map(t => t.id===id ? {...t, done:!t.done} : t));
  const addTodo = () => {
    const tx = newItem.trim();
    if (!tx) return;
    setTodos(p => [...p, {id: Date.now(), text: tx, done: false}]);
    setNewItem("");
  };

  const {headline, body} = splitBriefing(briefing);

  // Section header — bold sans-serif, large, no eyebrow.
  const SectionH = ({children}) => (
    <h2 style={{fontFamily:V2_FONT,fontSize:28,fontWeight:700,letterSpacing:-0.4,color:V2_TEXT,margin:"40px 0 14px"}}>{children}</h2>
  );
  const Hairline = () => <div style={{height:1,background:"rgba(0,0,0,.08)",margin:"32px 0 0"}}/>;

  return (
    <div style={{height:"100%",position:"relative",background:GROUND,fontFamily:V2_FONT,color:V2_TEXT}}>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
      <div style={{height:"100%",overflowY:"auto",padding:"40px 24px 132px"}}>
        {/* Weather */}
        <p style={{fontFamily:V2_FONT,fontSize:13,color:V2_MUT,margin:"0 0 36px",letterSpacing:.1}}>
          {weather ? `H${weather.high}° L${weather.low}°  ${weather.condition}` : "Loading weather…"}
        </p>

        {/* Briefing — bold headline + body paragraph */}
        <h1 style={{fontFamily:V2_FONT,fontSize:28,fontWeight:700,lineHeight:1.18,letterSpacing:-0.4,margin:"0 0 16px",color:V2_TEXT}}>
          {headline}
        </h1>
        {body && (
          <p style={{fontFamily:V2_FONT,fontSize:15,lineHeight:1.6,margin:"0 0 18px",color:V2_TEXT}}>{body}</p>
        )}
        <button style={{display:"inline-flex",alignItems:"center",gap:8,height:36,padding:"0 16px",borderRadius:18,border:`1px solid ${V2_TEXT}`,background:GROUND,fontFamily:V2_FONT,fontSize:13,fontWeight:500,color:V2_TEXT,cursor:"pointer"}}>
          <svg width="9" height="10" viewBox="0 0 7 8" fill={V2_TEXT}><path d="M0.5 0.5L6.5 4L0.5 7.5Z"/></svg>
          Play briefing
        </button>

        <Hairline/>

        {/* Today's events */}
        <SectionH>Today</SectionH>
        {todaysEvents.length === 0 ? (
          <p style={{fontFamily:V2_FONT,fontSize:15,color:V2_MUT,margin:0}}>Nothing on your calendar today.</p>
        ) : todaysEvents.map(ev => (
          <div key={ev.id} style={{display:"flex",alignItems:"flex-start",gap:20,padding:"14px 0"}}>
            <span style={{fontFamily:V2_FONT,fontSize:13,color:V2_MUT,width:62,flexShrink:0,marginTop:3}}>{ev.time}</span>
            <div style={{flex:1,minWidth:0}}>
              <p style={{fontFamily:V2_FONT,fontSize:16,fontWeight:600,color:V2_TEXT,margin:0,lineHeight:1.35}}>{ev.title}</p>
              {ev.subtitle && <p style={{fontFamily:V2_FONT,fontSize:13,color:V2_MUT,margin:"3px 0 0",lineHeight:1.4}}>{ev.subtitle}</p>}
            </div>
          </div>
        ))}

        <Hairline/>

        {/* Inbox */}
        <SectionH>Inbox</SectionH>
        {inbox === null ? (
          <p style={{fontFamily:V2_FONT,fontSize:15,color:V2_MUT,margin:0}}>Checking Gmail…</p>
        ) : inbox.length === 0 ? (
          <p style={{fontFamily:V2_FONT,fontSize:15,color:V2_MUT,margin:0}}>Inbox is calm.</p>
        ) : inbox.map(m => (
          <div key={m.id} style={{padding:"18px 0"}}>
            <p style={{fontFamily:V2_FONT,fontSize:13,color:V2_MUT,margin:"0 0 4px"}}>{m.from}</p>
            <p style={{fontFamily:V2_FONT,fontSize:17,fontWeight:600,color:V2_TEXT,margin:0,lineHeight:1.3}}>{m.summary || m.subject || "(no subject)"}</p>
            {m.snippet && <p style={{fontFamily:V2_FONT,fontSize:14,color:V2_MUT,margin:"6px 0 0",lineHeight:1.5}}>{m.snippet}</p>}
          </div>
        ))}

        <Hairline/>

        {/* To-Do */}
        <SectionH>To-Do</SectionH>
        {todos.length === 0 ? (
          <p style={{fontFamily:V2_FONT,fontSize:15,color:V2_MUT,margin:0}}>Nothing yet. Add an item below.</p>
        ) : todos.map(todo => (
          <div key={todo.id} onClick={()=>toggleTodo(todo.id)} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 0",cursor:"pointer"}}>
            <div style={{width:22,height:22,borderRadius:"50%",border:`1.5px solid ${V2_TEXT}`,background:todo.done?V2_TEXT:"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
              {todo.done && <svg width="10" height="10" viewBox="0 0 8 8" fill="none"><path d="M1 4.5L3.5 7L7.5 2" stroke={WHT} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
            <span style={{fontFamily:V2_FONT,fontSize:16,color:todo.done?V2_MUT:V2_TEXT,textDecoration:todo.done?"line-through":"none"}}>{todo.text}</span>
          </div>
        ))}
      </div>

      {/* Bottom input + nav */}
      <div style={{position:"absolute",bottom:0,left:0,right:0,background:GROUND,borderTop:"1px solid rgba(0,0,0,.08)",paddingBottom:"env(safe-area-inset-bottom)"}}>
        <div style={{padding:"14px 24px 10px",display:"flex",gap:12}}>
          <input
            value={newItem}
            onChange={e=>setNewItem(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&addTodo()}
            placeholder="+ Add item"
            style={{flex:1,height:46,border:`1px solid rgba(0,0,0,.15)`,borderRadius:23,padding:"0 20px",fontFamily:V2_FONT,fontSize:15,color:V2_TEXT,background:GROUND,outline:"none"}}
          />
          <button aria-label="Voice" style={{width:46,height:46,background:GROUND,border:`1px solid rgba(0,0,0,.15)`,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0}}>
            <svg width="20" height="20" viewBox="0 0 26 26" fill="none" stroke={V2_TEXT} strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="2" width="8" height="14" rx="4" strokeWidth="1.5"/>
              <path d="M5 13a8 8 0 0 0 16 0" strokeWidth="1.5"/>
              <path d="M13 21v3" strokeWidth="1.5"/>
            </svg>
          </button>
        </div>
        <div style={{display:"flex",justifyContent:"space-around",alignItems:"center",padding:"10px 24px 14px"}}>
          {/* Sun (today) */}
          <button onClick={()=>nav("home")} style={{background:"none",border:"none",cursor:"pointer",padding:0,color:V2_TEXT}}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4"/></svg>
          </button>
          {/* Chat */}
          <button onClick={()=>nav("chat")} style={{background:"none",border:"none",cursor:"pointer",padding:0,color:V2_MUT}}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a8 8 0 0 1-11.4 7.2L4 21l1.8-5.6A8 8 0 1 1 21 12z"/></svg>
          </button>
          {/* Lists */}
          <button onClick={()=>nav("lists")} style={{background:"none",border:"none",cursor:"pointer",padding:0,color:V2_MUT}}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
          </button>
          {/* Calendar */}
          <button onClick={()=>nav("calendar")} style={{background:"none",border:"none",cursor:"pointer",padding:0,color:V2_MUT}}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>
          </button>
          {/* Settings */}
          <button onClick={()=>nav("settings")} style={{background:"none",border:"none",cursor:"pointer",padding:0,color:V2_MUT}}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── CHAT ────────────────────────────────────────────────────
const Chat = ({nav}) => {
  // Robin opens with a different time-aware greeting each visit. Pool is written in Robin's voice — dry, competent, not performative.
  const [msgs,setMsgs]=useState(()=>{
    const h = new Date().getHours();
    const bucket = h>=5&&h<12 ? "morning" : h>=12&&h<17 ? "afternoon" : h>=17&&h<22 ? "evening" : "late";
    const pool = {
      morning: [
        "Morning. What do you need?",
        "Heads up — I'm here. What's first?",
        "Up and at 'em. What can I help with?",
        "Hey. Where do we start?",
        "Morning. Say it and I'll sort it.",
      ],
      afternoon: [
        "Hey, how's it going? What do you need help with?",
        "Quick check-in — what's on your mind?",
        "I got you. What's up?",
        "Hi. Where can I help?",
        "Hey. Drop it on me.",
      ],
      evening: [
        "Wrapping up. What's left?",
        "Almost done with the day. Need anything?",
        "Hey. What can I take off your plate before you log off?",
        "Evening. Say it and I'll handle it.",
      ],
      late: [
        "You up? I don't sleep either. What's the move?",
        "Quick one? I'm here.",
        "Late-night capture — what do you need?",
        "Still up. Drop it on me.",
      ],
    };
    const opts = pool[bucket];
    return [{role:"robin", text: opts[Math.floor(Math.random()*opts.length)]}];
  });
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const bottomRef=useRef(null);
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[msgs]);
  const send=async()=>{
    if(!input.trim()||loading)return;
    const m=input.trim();setInput("");
    setMsgs(p=>[...p,{role:"user",text:m}]);setLoading(true);
    try{
      const r=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-6",max_tokens:1000,system:`You are Robin — a warm, dry, competent personal assistant talking to Marian. Like a sharp friend who's tapped into culture and has dry wit. You handle things and occasionally say something that makes the user smile. You never crack jokes. You never sound like a corporate bot.

Voice canon (match this register, don't always copy verbatim):
- "I'm all over it." / "Say it and I'll sort it." / "I got you." / "On it boss." / "Already done." / "Already handled." / "Heads up." / "Holy free afternoon." / "You up? I don't sleep either."

Rules:
- Keep replies concise. Short sentences. Fragments OK.
- Contractions are default.
- Never write "Sure!" / "Of course!" / "How may I assist?" — that's not Robin.
- Never mention being an AI.
- No em-dashes when a period will do.`,messages:[...msgs,{role:"user",text:m}].map(x=>({role:x.role==="robin"?"assistant":"user",content:x.text}))})});
      const d=await r.json();
      const reply=d.content?.[0]?.text||d.error?.message||d.error||`No reply (HTTP ${r.status}): ${JSON.stringify(d).slice(0,200)}`;
      setMsgs(p=>[...p,{role:"robin",text:reply}]);
    }catch(e){setMsgs(p=>[...p,{role:"robin",text:`Fetch failed: ${e.message}`}]);}
    setLoading(false);
  };
  return (
    <div style={{height:"100%",position:"relative",display:"flex",flexDirection:"column",background:GROUND}}>
      <div style={{textAlign:"center",paddingTop:80,paddingBottom:14}}>
        <span style={{...s(11,MUT,"500",1.3),textTransform:"uppercase"}}>Robin · Online</span>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"4px 20px",display:"flex",flexDirection:"column",gap:12,paddingBottom:148}}>
        {msgs.map((m,i)=>(
          <div key={i} style={{maxWidth:"76%",alignSelf:m.role==="robin"?"flex-start":"flex-end",background:m.role==="robin"?GROUND:"#EAE6DD",border:m.role==="robin"?`.5px solid ${EGG_BDR}`:"none",borderRadius:18,padding:"12px 16px"}}>
            <p style={{...s(15,INK),lineHeight:1.5}}>{m.text}</p>
          </div>
        ))}
        {loading&&<div style={{alignSelf:"flex-start",background:GROUND,border:`.5px solid ${EGG_BDR}`,borderRadius:18,padding:"12px 16px"}}><p style={s(15,MUT)}>…</p></div>}
        <div ref={bottomRef}/>
      </div>
      <ChatBar nav={nav} active="chat" inputValue={input} onInputChange={setInput} onSend={send} loading={loading}/>
    </div>
  );
};

// ─── CALENDAR ────────────────────────────────────────────────
// Events come from /api/calendar-events (Google Calendar primary).
// Locally-added in-memory events live in the same {day:[events]} map and
// will be lost on refresh until we wire write-scope Calendar API access.

const AddEventModal = ({onClose, onAdd}) => {
  const [mode,setMode]=useState(null);
  const [title,setTitle]=useState("");
  const [time,setTime]=useState("");
  const [date,setDate]=useState("");
  const [days,setDays]=useState([]);
  const dow=["M","T","W","Th","F","Sa","Su"];
  const dowFull=["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
  const toggleDay=d=>setDays(p=>p.includes(d)?p.filter(x=>x!==d):[...p,d]);
  return (
    <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.45)",display:"flex",alignItems:"flex-end",zIndex:100}}>
      <div style={{background:GROUND,width:"100%",borderRadius:"24px 24px 0 0",padding:"0 0 32px",borderTop:`.5px solid ${EGG_BDR}`}}>
        <div style={{padding:"16px 24px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={s(15,INK,"500")}>{mode?"Add Event":"New"}</span>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontFamily:F,fontSize:22,color:MUT}}>×</button>
        </div>
        <div style={{height:.5,background:EGG_DIV}}/>
        {!mode&&(
          <div style={{padding:"16px 24px"}}>
            {[["Schedule an Event","event"],["Add Recurring Reminder","recurring"]].map(([lbl,m])=>(
              <button key={m} onClick={()=>setMode(m)} style={{width:"100%",height:52,borderRadius:26,border:`.5px solid ${EGG_BDR}`,background:GROUND,marginBottom:12,fontFamily:F,fontSize:13,color:INK,cursor:"pointer",textAlign:"left",padding:"0 22px"}}>{lbl}</button>
            ))}
          </div>
        )}
        {mode==="event"&&(
          <div style={{padding:"16px 24px"}}>
            <input placeholder="Event title" value={title} onChange={e=>setTitle(e.target.value)} style={{width:"100%",height:44,border:`.5px solid ${EGG_BDR}`,borderRadius:8,padding:"0 14px",fontFamily:F,fontSize:13,color:INK,outline:"none",boxSizing:"border-box",marginBottom:12,background:GROUND}}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,marginBottom:12}}>
              <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{height:44,border:`.5px solid ${EGG_BDR}`,borderRadius:8,padding:"0 14px",fontFamily:F,fontSize:12,color:INK,outline:"none",background:GROUND}}/>
              <input type="time" value={time} onChange={e=>setTime(e.target.value)} style={{height:44,border:`.5px solid ${EGG_BDR}`,borderRadius:8,padding:"0 14px",fontFamily:F,fontSize:12,color:INK,outline:"none",background:GROUND}}/>
            </div>
            <OutlinePill onClick={()=>{onAdd({title,time,date,type:"event"});onClose();}}>Add Event</OutlinePill>
          </div>
        )}
        {mode==="recurring"&&(
          <div style={{padding:"16px 24px"}}>
            <input placeholder="Reminder title" value={title} onChange={e=>setTitle(e.target.value)} style={{width:"100%",height:44,border:`.5px solid ${EGG_BDR}`,borderRadius:8,padding:"0 14px",fontFamily:F,fontSize:13,color:INK,outline:"none",boxSizing:"border-box",marginBottom:12,background:GROUND}}/>
            <input type="time" value={time} onChange={e=>setTime(e.target.value)} style={{width:"100%",height:44,border:`.5px solid ${EGG_BDR}`,borderRadius:8,padding:"0 14px",fontFamily:F,fontSize:12,color:INK,outline:"none",boxSizing:"border-box",marginBottom:12,background:GROUND}}/>
            <p style={{...s(11,MUT,"500",1.2),textTransform:"uppercase",marginBottom:8}}>Repeat on</p>
            <div style={{display:"flex",gap:6,marginBottom:16}}>
              {dow.map((d,i)=>{const on=days.includes(i);return(
                <button key={d} onClick={()=>toggleDay(i)} style={{width:36,height:36,borderRadius:18,border:`.5px solid ${on?INK:EGG_BDR}`,background:on?INK:GROUND,color:on?WHT:INK,fontFamily:F,fontSize:11,cursor:"pointer"}}>{d}</button>
              );})}
            </div>
            <OutlinePill onClick={()=>{onAdd({title,time,days:days.map(i=>dowFull[i]),type:"recurring"});onClose();}}>Add Reminder</OutlinePill>
          </div>
        )}
      </div>
    </div>
  );
};

const Calendar = ({nav, calendarEvents, setCalendarEvents}) => {
  const TODAY = useRef(new Date()).current;
  const [view,setView]=useState("day");
  const [viewYear,setViewYear]=useState(TODAY.getFullYear());
  const [viewMonth,setViewMonth]=useState(TODAY.getMonth()); // 0-indexed
  const [selectedDate,setSelectedDate]=useState(TODAY.getDate());
  const [hoveredDate,setHoveredDate]=useState(null);
  const [showAddEvent,setShowAddEvent]=useState(false);
  const [newEventInput,setNewEventInput]=useState("");
  // Local fallback if the router didn't pass shared state through.
  const [localEvents,setLocalEvents]=useState({});
  const events = calendarEvents ?? localEvents;
  const setEvents = setCalendarEvents ?? setLocalEvents;

  // Fetch Google Calendar events for the visible month.
  useEffect(()=>{
    let cancelled=false;
    (async()=>{
      try{
        const r=await fetch(`/api/calendar-events?year=${viewYear}&month=${viewMonth+1}`,{credentials:"same-origin"});
        if(cancelled||!r.ok) return;
        const d=await r.json();
        const byDay={};
        (d.events||[]).forEach(ev=>{
          const dt = ev.allDay ? new Date(ev.start+"T00:00:00") : new Date(ev.start);
          if(isNaN(dt.getTime())) return;
          if(dt.getFullYear()!==viewYear||dt.getMonth()!==viewMonth) return;
          const day=dt.getDate();
          if(!byDay[day]) byDay[day]=[];
          byDay[day].push({id:ev.id, time:formatEventTime(ev.start,ev.allDay), title:ev.title});
        });
        if(!cancelled) setEvents(byDay);
      }catch{}
    })();
    return ()=>{cancelled=true;};
  },[viewYear,viewMonth]);

  const addEvent=ev=>{
    if(!ev.title?.trim())return;
    const d=ev.date?new Date(ev.date).getDate():selectedDate;
    setEvents(p=>({...p,[d]:[...(p[d]||[]),{id:`local-${Date.now()}`,time:ev.time||"",title:ev.title}]}));
  };

  // Quick-add from the bottom input — typing or speaking creates an event
  // on the currently-selected day with no time (user can edit later for precision).
  const quickAdd = (title) => {
    const t = (title || "").trim();
    if (!t) return;
    addEvent({title: t});
    setNewEventInput("");
  };
  const onInputSubmit = () => quickAdd(newEventInput);
  const {onMicClick: micFn, isRecording, micStatus, micMsg} = useMic(
    tx => quickAdd(tx),
    tx => setNewEventInput(tx),   // live transcript appears in the event input
  );
  const onMicClick = () => { if (newEventInput.trim()) { onInputSubmit(); return; } micFn(); };

  const selectedEvents=events[selectedDate]||[];
  const daysOfWeek=["M","T","W","T","F","S","S"];

  // Derived month-shape values
  const firstWeekday = new Date(viewYear,viewMonth,1).getDay(); // 0=Sun
  const daysInMonth = new Date(viewYear,viewMonth+1,0).getDate();
  const prevMonthLastDay = new Date(viewYear,viewMonth,0).getDate();
  const monthDays=[...Array(daysInMonth)].map((_,i)=>i+1);
  const padCount=(firstWeekday+6)%7; // Monday-anchored padding
  const paddedDays=[...Array(padCount).fill(null),...monthDays];

  // Week strip for day view (Mon-anchored, with cross-month fill)
  const weekStart = selectedDate - ((selectedDate - 1 + firstWeekday + 6) % 7);
  const fullWeek = Array.from({length:7},(_,i)=>{
    const d = weekStart+i;
    if(d>=1&&d<=daysInMonth) return {date:d, inMonth:true};
    if(d<1)                  return {date:prevMonthLastDay+d, inMonth:false};
    if(d>daysInMonth)        return {date:d-daysInMonth, inMonth:false};
    return {date:null, inMonth:false};
  });

  const todayShort = `${String(TODAY.getMonth()+1).padStart(2,"0")}.${String(TODAY.getDate()).padStart(2,"0")}`;
  const selectedWeekday = new Date(viewYear,viewMonth,selectedDate).toLocaleDateString("en-US",{weekday:"long"});
  const monthName = new Date(viewYear,viewMonth,1).toLocaleDateString("en-US",{month:"long"});
  const selectedMonthDay = `${selectedWeekday.toUpperCase()} · ${monthName.toUpperCase()} ${String(selectedDate).padStart(2,"0")}`;

  const goToToday = () => {
    setViewYear(TODAY.getFullYear());
    setViewMonth(TODAY.getMonth());
    setSelectedDate(TODAY.getDate());
  };
  const goPrevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
    setSelectedDate(1);
  };
  const goNextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
    setSelectedDate(1);
  };
  const Chevron = ({dir, onClick}) => (
    <button onClick={onClick} aria-label={dir==="left"?"Previous month":"Next month"} style={{background:"none",border:"none",cursor:"pointer",padding:6,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <svg width="10" height="16" viewBox="0 0 10 16" fill="none" style={{transform:dir==="right"?"rotate(180deg)":"none"}}>
        <path d="M8 1L1 8L8 15" stroke={INK} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );

  return (
    <div style={{height:"100%",position:"relative",display:"flex",flexDirection:"column"}}>
      {/* Big weekday/month title + toggle. Month view gets prev/next chevrons. */}
      <div style={{padding:"40px 20px 14px"}}>
        {view==="month" ? (
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",margin:"0 0 14px"}}>
            <Chevron dir="left" onClick={goPrevMonth}/>
            <h1 style={{...s(43,INK,"500"),fontFamily:FH,margin:0,flex:1,textAlign:"center"}}>{monthName}{viewYear!==TODAY.getFullYear()?` ${viewYear}`:""}</h1>
            <Chevron dir="right" onClick={goNextMonth}/>
          </div>
        ) : (
          <h1 style={{...s(43,INK,"500"),fontFamily:FH,margin:"0 0 14px"}}>{selectedWeekday}</h1>
        )}
        <Toggle options={[["Month","month"],["Day","day"]]} value={view} onChange={setView}/>
      </div>

      {view==="month"&&(
        <div style={{flex:1,overflowY:"auto",paddingBottom:132}}>
          <Panel mt={0}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",textAlign:"center",padding:"14px 8px 12px"}}>
              {daysOfWeek.map((d,i)=><span key={i} style={{...s(11,MUT,"500",1.3),textTransform:"uppercase"}}>{d}</span>)}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",padding:"0 8px 14px",gap:"6px 0"}}>
              {paddedDays.map((d,i)=>{
                if(!d)return <div key={i}/>;
                const isSel=d===selectedDate;
                const isHov=d===hoveredDate;
                return(
                  <div key={i} onClick={()=>setSelectedDate(d)} onMouseEnter={()=>setHoveredDate(d)} onMouseLeave={()=>setHoveredDate(null)}
                    style={{display:"flex",justifyContent:"center",cursor:"pointer",padding:"3px 0"}}>
                    <div style={{width:32,height:32,borderRadius:"50%",background:isSel?INK:isHov?"#e8e8e8":"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"background .15s"}}>
                      <span style={s(15,isSel?WHT:INK,isSel?"600":"normal")}>{d}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Panel>
          <Panel>
            <Eyebrow>{selectedMonthDay}</Eyebrow>
            {selectedEvents.length===0
              ?<div style={{padding:"12px 14px",borderTop:`.5px solid ${EGG_DIV}`}}><span style={s(15,MUT)}>No events for this day.</span></div>
              :selectedEvents.map((ev,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:14,padding:"12px 14px",borderTop:`.5px solid ${EGG_DIV}`}}>
                  <span style={{...s(12,MUT),width:50,flexShrink:0}}>{ev.time}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{...s(15),overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ev.title}</div>
                    {ev.from&&<div style={{...s(11,MUT),marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>From {ev.from}</div>}
                  </div>
                </div>
              ))}
          </Panel>
        </div>
      )}

      {view==="day"&&(
        <div style={{flex:1,overflowY:"auto",paddingBottom:132}}>
          {/* Week strip — letter above, date below, selected day in a RECTANGLE outline (not circle) */}
          <Panel mt={0}>
            <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",padding:"14px 4px"}}>
              {fullWeek.map((entry,i)=>{
                const {date,inMonth}=entry;
                const isSel=date===selectedDate&&inMonth;
                return (
                  <div key={i} onClick={()=>date&&inMonth&&setSelectedDate(date)} style={{display:"flex",flexDirection:"column",alignItems:"center",cursor:date&&inMonth?"pointer":"default",opacity:inMonth?1:0.35}}>
                    <span style={{...s(11,MUT,"500",1.3),textTransform:"uppercase",marginBottom:6}}>{daysOfWeek[i]}</span>
                    {isSel?(
                      <div style={{width:36,height:36,borderRadius:"50%",background:INK,display:"flex",alignItems:"center",justifyContent:"center"}}>
                        <span style={s(16,WHT,"500",-0.3)}>{date}</span>
                      </div>
                    ):(
                      <div style={{width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center"}}>
                        <span style={s(16,INK,"400",-0.3)}>{date||""}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Panel>
          <Panel>
            <Eyebrow>{selectedMonthDay}</Eyebrow>
            {selectedEvents.length===0
              ?<div style={{padding:"14px 14px",borderTop:`.5px solid ${EGG_DIV}`}}><span style={s(15,MUT)}>No events today.</span></div>
              :selectedEvents.map((ev,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:14,padding:"14px 14px",borderTop:`.5px solid ${EGG_DIV}`}}>
                  <span style={{...s(12,MUT),width:50,flexShrink:0}}>{ev.time}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{...s(15),overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{ev.title}</div>
                    {ev.from&&<div style={{...s(12,MUT),marginTop:3,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>From {ev.from}</div>}
                  </div>
                </div>
              ))}
          </Panel>
        </div>
      )}

      <BottomNav active="calendar" nav={nav} placeholder="+ Add event" inputValue={newEventInput} onInputChange={setNewEventInput} onInputSubmit={onInputSubmit} onMicClick={onMicClick} isRecording={isRecording} micStatus={micStatus} micMsg={micMsg}/>
      {showAddEvent&&<AddEventModal onClose={()=>setShowAddEvent(false)} onAdd={addEvent}/>}
    </div>
  );
};

// ─── SETTINGS ────────────────────────────────────────────────
const SettingsRow = ({label, value, caption, to, nav, red=false, isFirst=false}) => (
  <div onClick={()=>to&&nav(to)} style={{cursor:to?"pointer":"default",borderTop:isFirst?"none":`.5px solid ${EGG_DIV}`}}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 14px"}}>
      <div>
        <p style={{...s(15,red?RED:INK),margin:0}}>{label}</p>
        {value&&<p style={{...s(12,MUT),marginTop:3}}>{value}</p>}
        {caption&&<p style={{...s(11,MUT),marginTop:2,letterSpacing:".3px"}}>{caption}</p>}
      </div>
      {to&&<ChevronR/>}
    </div>
  </div>
);

const Settings = ({nav}) => (
  <div style={{height:"100%",display:"flex",flexDirection:"column"}}>
    <BackNav nav={nav} to="home"/>
    <ScreenHeader title="Settings" withBack/>
    <div style={{overflowY:"auto",flex:1,paddingBottom:32}}>
      <Panel mt={0}>
        <SettingsRow isFirst label="Profile"          value="Marian Williams" to="settings-profile"       nav={nav}/>
        <SettingsRow         label="Connections"      value="Cal · Mail"      to="settings-connections"   nav={nav}/>
        <SettingsRow         label="Permissions"                              to="settings-permissions"   nav={nav}/>
        <SettingsRow         label="Robin's Hours"    value="7 AM – 9 PM"     to="settings-hours"         nav={nav}/>
        <SettingsRow         label="Speech Language"  value="English (US)"    to="settings-language"      nav={nav}/>
        <SettingsRow         label="Notifications"    caption="On"            to="settings-notifications" nav={nav}/>
        <SettingsRow         label="Billing"          value="Free"            to="settings-billing"       nav={nav}/>
        <SettingsRow         label="About Robin"      value="v0.3"            to="settings-about"         nav={nav}/>
      </Panel>
      <Panel>
        <SettingsRow isFirst label="Terms of Use"                          to="terms"                  nav={nav}/>
        <SettingsRow         label="Privacy Policy"                        to="privacy"                nav={nav}/>
        <SettingsRow         label="Contact Us"                            to="contact"                nav={nav}/>
      </Panel>
      <div style={{margin:"24px 20px 0"}}>
        <OutlinePill onClick={()=>nav("splash")}>Sign out</OutlinePill>
      </div>
      <div style={{textAlign:"center",marginTop:20,paddingBottom:32}}>
        <button onClick={()=>{}} style={{background:"none",border:"none",fontFamily:F,fontSize:10,color:RED,cursor:"pointer",letterSpacing:"1.32px",textTransform:"uppercase"}}>Delete account</button>
      </div>
    </div>
  </div>
);

// Settings sub-pages — all have prominent BackNav, no HR after it
const SettingsProfile = ({nav}) => {
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [picture,setPicture]=useState("");
  useEffect(()=>{
    fetch("/api/user-info",{credentials:"same-origin"})
      .then(r => r.ok ? r.json() : null)
      .then(d => {
        if (!d) return;
        setName(d.name || "");
        setEmail(d.email || "");
        setPicture(d.picture || "");
      })
      .catch(()=>{});
  },[]);
  return (
    <div style={{height:"100%",display:"flex",flexDirection:"column"}}>
      <BackNav nav={nav} to="settings"/>
      <ScreenHeader title="Profile" withBack/>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"0 24px 18px"}}>
        <div style={{width:96,height:96,borderRadius:"50%",background:GROUND,border:`1px solid ${EGG}`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:12,overflow:"hidden"}}>
          {picture
            ? <img src={picture} alt={name||"Profile"} width={96} height={96} style={{width:"100%",height:"100%",objectFit:"cover"}}/>
            : <ItemIcon type="camera" size={28} color={EGG}/>}
        </div>
        <p style={{...s(16,INK,"500"),margin:0}}>{name || "Signed-out user"}</p>
        <p style={{...s(11,MUT),margin:"4px 0 0",letterSpacing:".3px"}}>From your Google account</p>
      </div>
      <div style={{flex:1,overflowY:"auto",paddingBottom:32}}>
        <Panel mt={0}>
          {[["Name",name,setName],["Email",email,setEmail]].map(([lbl,val,setter],i)=>(
            <div key={lbl} style={{padding:"14px 14px",borderTop:i===0?"none":`.5px solid ${EGG_DIV}`}}>
              <p style={{...s(11,MUT,"500",1.3),textTransform:"uppercase",margin:"0 0 6px"}}>{lbl}</p>
              <input value={val} onChange={e=>setter(e.target.value)} style={{width:"100%",border:"none",borderBottom:`.5px solid ${EGG_DIV}`,background:"transparent",fontFamily:F,fontSize:15,color:INK,outline:"none",padding:"4px 0",boxSizing:"border-box"}}/>
            </div>
          ))}
        </Panel>
        <div style={{padding:"20px 20px 0"}}>
          <OutlinePill onClick={()=>nav("settings")}>Save Changes</OutlinePill>
        </div>
      </div>
    </div>
  );
};

// Connection logos — real Wikimedia SVGs via Special:FilePath redirect
const CONN_ICONS = {
  gcal:  "https://commons.wikimedia.org/wiki/Special:FilePath/Google_Calendar_icon_(2020).svg",
  gmail: "https://commons.wikimedia.org/wiki/Special:FilePath/Gmail_icon_(2020).svg",
  apple: "https://commons.wikimedia.org/wiki/Special:FilePath/Mail_(iOS).svg",
};

const SettingsConnections = ({nav}) => {
  const conns=[
    {icon:CONN_ICONS.gcal,  name:"Google Calendar", email:"marianfroelich@gmail.com",  perm:"Read + Write Events"},
    {icon:CONN_ICONS.gmail, name:"Gmail",           email:"marianfroelich@gmail.com",  perm:"Read-Only · Never Sends"},
    {icon:CONN_ICONS.apple, name:"Apple Mail",      email:"marianfroelich@icloud.com", perm:"Read-Only · Never Sends"},
  ];
  return (
    <div style={{height:"100%",display:"flex",flexDirection:"column"}}>
      <BackNav nav={nav} to="settings"/>
      <ScreenHeader title="Connections" subhead="What Robin can see — and can't." withBack/>
      <div style={{flex:1,overflowY:"auto",paddingBottom:32}}>
        {conns.map(c=>(
          <Panel key={c.name}>
            <div style={{padding:"14px 14px"}}>
              {/* Top row: icon + name/email + Live */}
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <img src={c.icon} alt={c.name} width="32" height="32" style={{flexShrink:0,objectFit:"contain"}}/>
                <div style={{flex:1,minWidth:0}}>
                  <p style={{...s(15,INK,"500"),margin:0}}>{c.name}</p>
                  <p style={{...s(11,MUT),marginTop:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.email}</p>
                </div>
                <div style={{display:"flex",alignItems:"center",gap:5,flexShrink:0}}>
                  <div style={{width:6,height:6,borderRadius:"50%",background:GRN}}/>
                  <span style={{...s(9,GRN,"500",1.1),textTransform:"uppercase"}}>Live</span>
                </div>
              </div>
            </div>
            <div style={{height:.5,background:EGG_DIV}}/>
            {/* Bottom row: permission caption + chevron */}
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"11px 14px",cursor:"pointer"}}>
              <span style={{...s(9,MUT,"500",1.1),textTransform:"uppercase"}}>{c.perm}</span>
              <ChevronR/>
            </div>
          </Panel>
        ))}
        <div style={{padding:"20px 20px 0"}}>
          <button style={{height:44,border:`.5px solid ${EGG_BDR}`,borderRadius:22,background:GROUND,fontFamily:F,fontSize:11,fontWeight:700,letterSpacing:"1.32px",textTransform:"uppercase",cursor:"pointer",padding:"0 22px",color:INK}}>+ Add Connection</button>
        </div>
      </div>
    </div>
  );
};

const SettingsHours = ({nav}) => {
  const [times,setTimes]=useState({morning:"07:00",evening:"20:00",qstart:"22:00",qend:"07:00"});
  const fmt=t=>{if(!t)return t;const[h,m]=t.split(":").map(Number);const ap=h<12?"AM":"PM";return`${h===0?12:h>12?h-12:h}:${String(m).padStart(2,"0")} ${ap}`;};
  return (
    <div style={{height:"100%",display:"flex",flexDirection:"column"}}>
      <BackNav nav={nav} to="settings"/>
      <ScreenHeader title="Robin's Hours" subhead="When Robin is active and available." withBack/>
      <div style={{flex:1,overflowY:"auto",paddingBottom:32}}>
        <Panel mt={0}>
          {[["Morning Brief","morning"],["Evening Recap","evening"],["Quiet Start","qstart"],["Quiet End","qend"]].map(([lbl,key],i)=>(
            <div key={key} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 14px",borderTop:i===0?"none":`.5px solid ${EGG_DIV}`}}>
              <span style={s(15)}>{lbl}</span>
              <input type="time" value={times[key]} onChange={e=>setTimes(p=>({...p,[key]:e.target.value}))} style={{border:"none",background:"transparent",fontFamily:F,fontSize:13,color:MUT,outline:"none",cursor:"pointer"}}/>
            </div>
          ))}
        </Panel>
        <div style={{padding:"20px 20px 0"}}>
          <OutlinePill onClick={()=>nav("settings")}>Save</OutlinePill>
        </div>
      </div>
    </div>
  );
};

const SettingsNotifications = ({nav}) => {
  const [prefs,setPrefs]=useState({"Daily Briefing":true,"Task Reminders":true,"Calendar Alerts":true,"Quiet Hours":true,"Mira's School":false,"Robin Nudges":true});
  const toggle=k=>setPrefs(p=>({...p,[k]:!p[k]}));
  return (
    <div style={{height:"100%",display:"flex",flexDirection:"column"}}>
      <BackNav nav={nav} to="settings"/>
      <ScreenHeader title="Notifications" subhead="Choose when Robin can reach you." withBack/>
      <div style={{flex:1,overflowY:"auto",paddingBottom:32}}>
        <Panel mt={0}>
          {Object.entries(prefs).map(([k,v],i)=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 14px",borderTop:i===0?"none":`.5px solid ${EGG_DIV}`}}>
              <span style={s(15)}>{k}</span>
              <div onClick={()=>toggle(k)} style={{width:40,height:24,borderRadius:12,background:v?INK:BDR,cursor:"pointer",position:"relative",transition:"background .2s",flexShrink:0}}>
                <div style={{position:"absolute",top:3,left:v?19:3,width:18,height:18,borderRadius:"50%",background:WHT,transition:"left .2s"}}/>
              </div>
            </div>
          ))}
        </Panel>
      </div>
    </div>
  );
};

const SettingsAbout = ({nav}) => (
  <div style={{height:"100%",display:"flex",flexDirection:"column"}}>
    <BackNav nav={nav} to="settings"/>
    <ScreenHeader title="About Robin" withBack/>
    <div style={{flex:1,paddingBottom:32}}>
      <Panel mt={0}>
        {[["Version","v0.3"],["Build","2025.05.01"],["Model","Claude Sonnet"],["Codebase","github.com/natescott12"]].map(([l,v],i)=>(
          <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"14px 14px",borderTop:i===0?"none":`.5px solid ${EGG_DIV}`}}>
            <span style={s(15)}>{l}</span><span style={s(15,MUT)}>{v}</span>
          </div>
        ))}
      </Panel>
    </div>
  </div>
);

const SettingsBilling = ({nav}) => (
  <div style={{height:"100%",display:"flex",flexDirection:"column"}}>
    <BackNav nav={nav} to="settings"/>
    <ScreenHeader title="Billing" subhead="Manage your plan and billing preferences." withBack/>
    <div style={{flex:1,overflowY:"auto",paddingBottom:32}}>
      <Panel mt={0}>
        <div style={{padding:"14px 14px"}}>
          <p style={{...s(11,MUT,"500",1.3),textTransform:"uppercase",margin:"0 0 6px"}}>Current Plan</p>
          <p style={{...s(15,INK),margin:0}}>Free</p>
        </div>
        <div style={{height:.5,background:EGG_DIV}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 14px"}}>
          <span style={s(15)}>Payment method</span>
          <span style={s(13,MUT)}>None on file</span>
        </div>
        <div style={{height:.5,background:EGG_DIV}}/>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 14px"}}>
          <span style={s(15)}>Next billing date</span>
          <span style={s(13,MUT)}>—</span>
        </div>
      </Panel>
      <div style={{padding:"20px 20px 0"}}>
        <OutlinePill onClick={()=>{}}>Manage subscription</OutlinePill>
      </div>
    </div>
  </div>
);

const SPEECH_LANGUAGES = [
  "English (US)", "English (UK)", "Spanish", "French", "German",
  "Italian", "Portuguese", "Japanese", "Korean", "Chinese (Simplified)",
];
const SettingsSpeechLanguage = ({nav}) => {
  const [lang,setLang]=useState("English (US)");
  return (
    <div style={{height:"100%",display:"flex",flexDirection:"column"}}>
      <BackNav nav={nav} to="settings"/>
      <ScreenHeader title="Speech Language" subhead="The language Robin listens for and speaks in." withBack/>
      <div style={{flex:1,overflowY:"auto",paddingBottom:32}}>
        <Panel mt={0}>
          {SPEECH_LANGUAGES.map((l,i)=>(
            <div key={l} onClick={()=>setLang(l)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 14px",borderTop:i===0?"none":`.5px solid ${EGG_DIV}`,cursor:"pointer"}}>
              <span style={s(15)}>{l}</span>
              {lang === l && (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 7L5 11L13 2" stroke={INK} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          ))}
        </Panel>
      </div>
    </div>
  );
};

const SettingsPermissions = ({nav}) => {
  const perms = [
    { app: "Google Calendar", level: "Read + Write Events" },
    { app: "Gmail",           level: "Read-Only" },
    { app: "Apple Mail",      level: "Read-Only" },
  ];
  return (
    <div style={{height:"100%",display:"flex",flexDirection:"column"}}>
      <BackNav nav={nav} to="settings"/>
      <ScreenHeader title="Permissions" subhead="What each connected app lets Robin do." withBack/>
      <div style={{flex:1,overflowY:"auto",paddingBottom:32}}>
        <Panel mt={0}>
          {perms.map((p,i)=>(
            <div key={p.app} style={{padding:"14px 14px",borderTop:i===0?"none":`.5px solid ${EGG_DIV}`}}>
              <p style={{...s(15,INK),margin:0}}>{p.app}</p>
              <p style={{...s(11,MUT,"500",1.3),textTransform:"uppercase",margin:"4px 0 0"}}>{p.level}</p>
            </div>
          ))}
        </Panel>
      </div>
    </div>
  );
};

const TERMS=[["Overview","By using Robin, you agree to these Terms."],["Acceptable Use","Robin is for personal, non-commercial use only."],["Your Data","Robin accesses your calendar and contacts. We don't sell your data."],["Updates","Continued use means you accept revised terms."],["Contact","hello@robinapp.co"]];
const PRIVACY=[["What We Collect","Name, email, calendar events, to-dos, anonymised usage."],["How We Use It","To power briefings, set reminders, personalise your experience."],["Sharing","We don't sell your data."],["Storage","Encrypted at rest and in transit."],["Your Rights","Delete your data anytime from Settings → Delete Account."],["Contact","hello@robinapp.co"]];

const Legal = ({nav, title, sections}) => (
  <div style={{height:"100%",display:"flex",flexDirection:"column"}}>
    <BackNav nav={nav} to="settings"/>
    <ScreenHeader title={title} subhead="Effective May 2026" withBack/>
    <div style={{overflowY:"auto",flex:1,paddingBottom:32}}>
      <Panel mt={0}>
        {sections.map(([lbl,body],i)=>(
          <div key={lbl} style={{padding:"14px 14px",borderTop:i===0?"none":`.5px solid ${EGG_DIV}`}}>
            <p style={{...s(11,MUT,"500",1.3),textTransform:"uppercase",marginBottom:8}}>{lbl}</p>
            <p style={{...s(15,MUT),lineHeight:1.65,margin:0}}>{body}</p>
          </div>
        ))}
      </Panel>
    </div>
  </div>
);

const ContactUs = ({nav}) => (
  <div style={{height:"100%",display:"flex",flexDirection:"column"}}>
    <BackNav nav={nav} to="settings"/>
    <ScreenHeader title="Contact Us" subhead="We'd love to hear from you." withBack/>
    <div style={{flex:1,paddingBottom:32}}>
      <Panel mt={0}>
        {[["General","hello@robinapp.co"],["Support","support@robinapp.co"],["Feature Ideas","robinapp.co/ideas"],["Report a Bug","github.com/robinapp"]].map(([lbl,val],i)=>(
          <div key={lbl} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 14px",borderTop:i===0?"none":`.5px solid ${EGG_DIV}`}}>
            <div><p style={{...s(15),margin:0}}>{lbl}</p><p style={{...s(12,MUT),marginTop:3}}>{val}</p></div>
            <ChevronR/>
          </div>
        ))}
      </Panel>
    </div>
  </div>
);

// ─── ROUTER ──────────────────────────────────────────────────
function RobinApp() {
  const [screen,setScreen]=useState("splash");
  const [selectedList,setSelectedList]=useState(null);
  const [lists,setLists]=useState([]);
  const [calendarEvents,setCalendarEvents]=useState({});
  const [pendingHomeAdd,setPendingHomeAdd]=useState(null);
  const [toast,setToast]=useState(null);
  // If the page was opened with ?list=<slug>, render the standalone shared
  // list view instead of the main app. Read once at first render so refresh
  // keeps the recipient in the same place.
  const [sharedSlug] = useState(() => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get("list");
  });
  // ?v=2 swaps the Today screen for the simplified-design preview (HomeV2).
  // Comparison-only — does not replace anything in the existing app.
  const [previewVersion] = useState(() => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get("v");
  });
  const nav=to=>setScreen(to);

  // ─── Action Button hand-off ───
  // Reads ?add=<text> from the URL on first mount (delivered by the iOS
  // Shortcut described in the README) and queues it for the Home screen.
  // Shows a brief toast and cleans the URL so a refresh doesn't re-add.
  useEffect(()=>{
    const params = new URLSearchParams(window.location.search);
    const add = params.get("add");
    const google = params.get("google");
    if (add && add.trim()) {
      setPendingHomeAdd(add.trim());
      setToast(`Added: ${add.trim()}`);
      setTimeout(()=>setToast(null), 3500);
      // Strip the param so a refresh doesn't replay
      window.history.replaceState({}, "", window.location.pathname);
      // Land on Home so the user can see what got added
      setScreen("home");
    } else if (google === "connected") {
      setToast("Signed in with Google");
      setTimeout(()=>setToast(null), 3500);
      window.history.replaceState({}, "", window.location.pathname);
      setScreen("welcome");
    }
  },[]);

  // Switch-based router — one element per render, clean identity tracking
  const renderScreen=()=>{
    if (sharedSlug) return <SharedListView slug={sharedSlug}/>;
    if (previewVersion === "2" && (screen === "splash" || screen === "home")) return <HomeV2 nav={nav}/>;
    switch(screen){
      case "splash":                  return <Splash nav={nav}/>;
      case "welcome":                 return <WelcomeFromRobin nav={nav}/>;
      case "signin":                  return <SignIn nav={nav}/>;
      case "tell-robin":              return <TellRobin nav={nav}/>;
      case "putting-it-together":     return <PuttingItTogether nav={nav}/>;
      case "goals":                   return <Goals nav={nav}/>;
      case "robins-hours-setup":      return <RobinsHoursSetup nav={nav}/>;
      case "notifications-intro":     return <NotificationsIntro nav={nav}/>;
      case "loading":                 return <Loading nav={nav}/>;
      case "home":                    return <Home nav={nav} pendingAdd={pendingHomeAdd} onPendingConsumed={()=>setPendingHomeAdd(null)} calendarEvents={calendarEvents} setCalendarEvents={setCalendarEvents} setToast={setToast}/>;
      case "lists":                   return <ListsGrid nav={nav} setSelectedList={setSelectedList} lists={lists} setLists={setLists}/>;
      case "list-detail":             return <ListDetail nav={nav} list={selectedList} lists={lists} setLists={setLists}/>;
      case "chat":                    return <Chat nav={nav}/>;
      case "calendar":                return <Calendar nav={nav} calendarEvents={calendarEvents} setCalendarEvents={setCalendarEvents}/>;
      case "settings":                return <Settings nav={nav}/>;
      case "settings-profile":        return <SettingsProfile nav={nav}/>;
      case "settings-connections":    return <SettingsConnections nav={nav}/>;
      case "settings-hours":          return <SettingsHours nav={nav}/>;
      case "settings-notifications":  return <SettingsNotifications nav={nav}/>;
      case "settings-billing":        return <SettingsBilling nav={nav}/>;
      case "settings-language":       return <SettingsSpeechLanguage nav={nav}/>;
      case "settings-permissions":    return <SettingsPermissions nav={nav}/>;
      case "settings-about":          return <SettingsAbout nav={nav}/>;
      case "terms":                   return <Legal nav={nav} title="Terms of Use" sections={TERMS}/>;
      case "privacy":                 return <Legal nav={nav} title="Privacy Policy" sections={PRIVACY}/>;
      case "contact":                 return <ContactUs nav={nav}/>;
      default:                        return <Home nav={nav} pendingAdd={pendingHomeAdd} onPendingConsumed={()=>setPendingHomeAdd(null)} calendarEvents={calendarEvents} setCalendarEvents={setCalendarEvents} setToast={setToast}/>;
    }
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@100;200;300;400;500;600;700&family=Rokkitt:wght@500&display=swap" rel="stylesheet"/>
      <style>{`
        /* Default (mobile / PWA fullscreen): no frame, fills viewport */
        .robin-outer {
          min-height: 100dvh;
          display: flex;
          justify-content: center;
          align-items: flex-start;
          background: ${GROUND};
          margin: 0; padding: 0;
        }
        .robin-phone {
          width: 100vw;
          height: 100dvh;
          position: relative;
          overflow: hidden;
          font-family: ${F};
          background-color: ${GROUND};
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='g' width='10' height='10' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 10 0 L 0 0 0 10' fill='none' stroke='%235BBFC7' stroke-width='0.5' stroke-opacity='0.38'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g)'/%3E%3C/svg%3E");
          padding-top: env(safe-area-inset-top);
          /* bottom safe area is handled inside BottomNav/ChatBar so the nav sits flush against the viewport */
        }
        /* Desktop preview (wider than phone-ish): show the 393×852 phone frame */
        @media (min-width: 480px) {
          .robin-outer {
            padding: 2rem 0;
            background: var(--color-background-tertiary, #d8d8d8);
          }
          .robin-phone {
            width: 393px;
            height: 852px;
            min-height: 0;
            border-radius: 48px;
            border: .5px solid ${BDR};
            padding-top: 0;
            padding-bottom: 0;
          }
        }
        /* Toast (Action Button add confirmation) */
        .robin-toast {
          position: absolute;
          left: 50%; transform: translateX(-50%);
          top: calc(env(safe-area-inset-top) + 20px);
          background: ${INK}; color: ${WHT};
          padding: 12px 18px;
          border-radius: 10px;
          font-family: ${F};
          font-size: 14px;
          letter-spacing: .2px;
          box-shadow: 0 8px 28px rgba(0,0,0,.18);
          z-index: 9999;
          max-width: calc(100vw - 40px);
          animation: toast-in .3s ease-out;
        }
        @keyframes toast-in { from { opacity: 0; transform: translate(-50%, -8px); } to { opacity: 1; transform: translate(-50%, 0); } }
      `}</style>
      <div className="robin-outer">
        <div className="robin-phone">
          {renderScreen()}
          {toast && <div className="robin-toast">{toast}</div>}
        </div>
      </div>
    </>
  );
}
