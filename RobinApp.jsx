/**
 * Robin — Interactive Prototype v3
 * Font: IBM Plex Mono  |  Live Chat (Anthropic API)  |  Live weather (Open-Meteo)
 * Voice mic (Web Speech API)  |  Briefing playback (SpeechSynthesis)
 */
const { useState, useEffect, useRef } = React;

const F   = "'IBM Plex Mono', monospace";
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
  <div style={{padding:"0 20px",marginTop:withBack?8:18,marginBottom:18}}>
    <h1 style={{...s(32,INK,"300",-3.7),margin:0}}>{title}</h1>
    {subhead&&<p style={{...s(15,MUT),margin:"8px 0 0",lineHeight:1.5}}>{subhead}</p>}
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
// "Magical" mode: tap to start, speak, pause ~2 seconds → auto-commits the transcript.
// Pass a callback that receives the recognized transcript text.
// Returns { onMicClick, isRecording, micStatus, micMsg } to wire into BottomNav.
const useMic = (onTranscript) => {
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
      transcriptRef.current = (finalText + interimText).trim();
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
  <div style={{display:"flex",alignItems:"center",gap:8,padding:"0 23.5px",marginTop:72,marginBottom:4}}>
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M10 3L5 8L10 13" stroke={INK} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
    <span style={{...s(15,INK,"500"),cursor:"pointer"}} onClick={()=>nav(to)}>Back</span>
  </div>
);

const BottomNav = ({active, nav, inputValue, onInputChange, onInputSubmit, onMicClick, isRecording=false, micStatus="idle", micMsg="", placeholder="+ Add item"}) => {
  const icons=["home","chat","lists","calendar","settings"];
  const isLive=onInputChange!==undefined;
  const isErr=micStatus==="error";
  const ph=isRecording?"Listening…":micMsg||placeholder;
  const border=isRecording?RED:isErr?"#c84b00":BDR;
  return (
    <div style={{position:"absolute",bottom:0,left:0,right:0,height:132,background:GROUND,borderTop:`.5px solid ${EGG_BDR}`}}>
      <div style={{margin:"14px 24px 10px",display:"flex",gap:12}}>
        {isLive?(
          <input value={inputValue} onChange={e=>onInputChange(e.target.value)} onKeyDown={e=>e.key==="Enter"&&onInputSubmit&&onInputSubmit()} placeholder={ph}
            style={{flex:1,height:44,border:`.5px solid ${border}`,borderRadius:22,padding:"0 20px",fontFamily:F,fontSize:15,color:INK,background:GROUND,outline:"none",transition:"border-color .2s"}}/>
        ):(
          <div style={{flex:1,height:44,border:`.5px solid ${EGG_BDR}`,borderRadius:22,display:"flex",alignItems:"center",padding:"0 20px",background:GROUND}}>
            <span style={s(15,MUT)}>{placeholder}</span>
          </div>
        )}
        <button onClick={onMicClick||onInputSubmit} style={{width:44,height:44,background:isRecording?EGG:GROUND,border:`.5px solid ${EGG}`,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",flexShrink:0,transition:"background .2s"}}>
          <svg width="20" height="20" viewBox="0 0 26 26" fill="none" stroke={INK} strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="2" width="8" height="14" rx="4" strokeWidth="1.5"/>
            <path d="M5 13a8 8 0 0 0 16 0" strokeWidth="1.5"/>
            <path d="M13 21v3" strokeWidth="1.5"/>
          </svg>
        </button>
      </div>
      <div style={{height:.5,background:EGG_DIV}}/>
      <div style={{display:"flex",justifyContent:"space-around",alignItems:"center",padding:"10px 8px 0"}}>
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
    <div style={{position:"absolute",bottom:0,left:0,right:0,height:132,background:GROUND,borderTop:`.5px solid ${EGG_BDR}`}}>
      <div style={{margin:"14px 24px 10px",display:"flex",gap:12}}>
        <input value={inputValue} onChange={e=>onInputChange(e.target.value)} onKeyDown={e=>e.key==="Enter"&&onSend()} placeholder="Message Robin…"
          style={{flex:1,height:44,border:`.5px solid ${EGG_BDR}`,borderRadius:22,padding:"0 20px",fontFamily:F,fontSize:15,color:INK,background:GROUND,outline:"none"}}/>
        <button onClick={onSend} disabled={loading}
          style={{width:44,height:44,background:GROUND,border:`1px solid ${EGG}`,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",cursor:loading?"default":"pointer",flexShrink:0,opacity:loading?.5:1}}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke={INK} strokeWidth="1.5" strokeLinecap="round">
            <path d="M9 15V3M3 9l6-6 6 6"/>
          </svg>
        </button>
      </div>
      <div style={{height:.5,background:EGG_DIV}}/>
      <div style={{display:"flex",justifyContent:"space-around",alignItems:"center",padding:"10px 8px 0"}}>
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
      @keyframes tagline-in { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
      @keyframes caret-blink { 50% { opacity: 0; } }
      @keyframes caret-fade { to { opacity: 0; } }
      .robin-logo-anim { animation: robin-type 1.3s steps(14, end) forwards; }
      .robin-tagline-anim { opacity: 0; animation: tagline-in .55s .95s forwards; }
      .robin-caret { display: inline-block; width: 1.5px; height: 36px; background: #141414; margin-left: 6px; vertical-align: middle; animation: caret-blink 1s infinite, caret-fade .35s 1.5s forwards; }
    `}</style>
    <StatusBar time="9:41"/>
    <div style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:22}}>
      <div style={{display:"flex",alignItems:"center"}}>
        <div className="robin-logo-anim" style={{display:"inline-block",overflow:"hidden"}}>
          <RobinLogo color="#141414" width={240}/>
        </div>
        <div className="robin-caret"/>
      </div>
      <p className="robin-tagline-anim" style={s(15,INK)}>A serious tool.</p>
    </div>
    <div style={{padding:"0 20px 64px"}}>
      <OutlinePill onClick={()=>nav("signin")}>Get started →</OutlinePill>
    </div>
  </div>
);

const SignIn = ({nav}) => (
  <div style={{height:"100%",display:"flex",flexDirection:"column"}}>
    <StatusBar/>
    <div style={{paddingTop:75}}>
      <ScreenHeader title="Sign In" subhead="Choose your preferred sign-in method."/>
    </div>
    <div style={{padding:"6px 20px 0",display:"flex",flexDirection:"column",gap:14}}>
      <button onClick={()=>nav("goals")} style={{width:"100%",height:52,borderRadius:26,background:GROUND,border:`1.75px solid ${EGG}`,display:"flex",alignItems:"center",justifyContent:"center",gap:12,fontFamily:F,fontSize:15,color:INK,cursor:"pointer"}}>
        <GoogleLogo/> Sign in with Google
      </button>
      <button onClick={()=>nav("goals")} style={{width:"100%",height:52,borderRadius:26,background:GROUND,border:`1.75px solid ${EGG}`,display:"flex",alignItems:"center",justifyContent:"center",gap:12,fontFamily:F,fontSize:15,color:INK,cursor:"pointer"}}>
        <AppleLogo color={INK}/> Sign in with Apple
      </button>
      <button onClick={()=>nav("goals")} style={{background:"none",border:"none",fontFamily:F,fontSize:11,color:MUT,letterSpacing:".88px",textTransform:"uppercase",cursor:"pointer",marginTop:8}}>Continue as Guest</button>
    </div>
  </div>
);

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
      <StatusBar/>
      <div style={{paddingTop:75}}>
        <div style={{padding:"0 20px"}}>
          <p style={{...s(11,MUT,"500",1.3),textTransform:"uppercase"}}>Setup · 1 of 4</p>
        </div>
        <ScreenHeader title="How can Robin help?"/>
      </div>
      <div style={{padding:"0 20px",display:"flex",flexDirection:"column",gap:10}}>
        {opts.map(({label,icon})=>{
          const on=sel.includes(label);
          return (
            <button key={label} onClick={()=>setSel(s=>on?s.filter(x=>x!==label):[...s,label])}
              style={{width:"100%",minHeight:60,borderRadius:4,padding:"14px 18px",
                background:on?EGG:GROUND,
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
      <div style={{padding:"32px 20px 0"}}>
        <OutlinePill onClick={()=>nav("robins-hours-setup")}>Next</OutlinePill>
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
      <StatusBar/>
      <div style={{paddingTop:75}}>
        <div style={{padding:"0 20px"}}>
          <p style={{...s(11,MUT,"500",1.3),textTransform:"uppercase"}}>Setup · 3 of 4</p>
        </div>
        <ScreenHeader title="Robin's Hours" subhead="Tell Robin what you need and when."/>
      </div>
      <Panel mt={0}>
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
      <div style={{padding:"24px 20px 0"}}>
        <PrimaryPill onClick={()=>nav("notifications-intro")}>Continue</PrimaryPill>
      </div>
    </div>
  );
};

const NotificationsIntro = ({nav}) => {
  const SYS = "-apple-system, 'SF Pro Display', 'SF Pro Text', system-ui, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif";
  return (
  <div style={{height:"100%",display:"flex",flexDirection:"column"}}>
    <StatusBar/>
    <div style={{paddingTop:75}}>
      <div style={{padding:"0 20px"}}>
        <p style={{...s(11,MUT,"500",1.3),textTransform:"uppercase"}}>Notifications · 4 of 4</p>
      </div>
      <ScreenHeader title="Nudges" subhead="Allow notifications so Robin can nudge you at the right moment."/>
    </div>
    {/* iOS lock-screen preview — uses system font, not Plex Mono */}
    <div style={{margin:"0 20px",background:"linear-gradient(160deg,#2c2c5a 0%,#1a3a6e 40%,#0a2848 100%)",borderRadius:38,padding:"22px 16px 32px",overflow:"hidden",position:"relative"}}>
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
    <div style={{padding:"24px 20px 0"}}>
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
      <StatusBar/>
      <div style={{paddingTop:75}}>
        <ScreenHeader title="Setting up Marian's Day" subhead="Just a moment."/>
      </div>
      <Panel mt={0}>
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
const Home = ({nav, pendingAdd, onPendingConsumed}) => {
  const [todos,setTodos]=useState([{id:1,text:"Schedule Wu-Wu's vet visit",done:false},{id:2,text:"Willa's permission slip",done:false}]);
  const [newItem,setNewItem]=useState("");
  const [weather,setWeather]=useState(null);
  const [isPlaying,setIsPlaying]=useState(false);

  // Action Button hand-off: if the router queued an item (from the iOS Shortcut
  // double-tap), add it to todos and let the router know we consumed it.
  useEffect(()=>{
    if (pendingAdd) {
      setTodos(p => [...p, {id: Date.now(), text: pendingAdd, done: false}]);
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
  useEffect(()=>()=>{window.speechSynthesis?.cancel();},[]);

  const toggleTodo=id=>setTodos(p=>p.map(t=>t.id===id?{...t,done:!t.done}:t));
  const addTodo=()=>{const tx=newItem.trim();if(!tx)return;setTodos(p=>[...p,{id:Date.now(),text:tx,done:false}]);setNewItem("");};

  // Voice input — uses shared hook. Adds spoken text directly to todos.
  const {onMicClick: micFn, isRecording, micStatus, micMsg} = useMic(tx => {
    setTodos(p => [...p, {id: Date.now(), text: tx, done: false}]);
  });
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

  const briefingScript="Good morning, Marian. Three things need your attention today. Maria call at 10 a.m. Call Dad at 5 p.m. Tee time at 6 p.m. And don't forget — Wu-Wu's vet visit still needs scheduling.";
  const toggleBriefing=()=>{
    if(!window.speechSynthesis)return;
    if(isPlaying){window.speechSynthesis.cancel();setIsPlaying(false);return;}
    const u=new SpeechSynthesisUtterance(briefingScript);
    u.rate=.92;u.pitch=1.05;u.volume=1;
    if(briefingVoiceRef.current){u.voice=briefingVoiceRef.current;u.lang=briefingVoiceRef.current.lang;}else{u.lang="en-GB";}
    u.onend=()=>setIsPlaying(false);u.onerror=()=>setIsPlaying(false);
    setIsPlaying(true);window.speechSynthesis.speak(u);
  };

  const now=new Date();
  const dayName=now.toLocaleDateString("en-US",{weekday:"long"});
  const dateStr=`${String(now.getMonth()+1).padStart(2,"0")}/${String(now.getDate()).padStart(2,"0")}`;
  const captionDate=now.toLocaleDateString("en-US",{month:"long",day:"numeric"}).toUpperCase();
  const timeStr=`${now.getHours()}:${String(now.getMinutes()).padStart(2,"0")}`;

  return (
    <div style={{height:"100%",position:"relative"}}>
      <div style={{height:"100%",overflowY:"auto",paddingBottom:132}}>
        <StatusBar time={timeStr}/>

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
            <div style={{fontFamily:F,fontSize:32,fontWeight:300,color:INK,letterSpacing:"-3.5px"}}>{dayName}</div>
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
            <p style={{...s(15),lineHeight:1.6,margin:0}}>Good morning, Marian. Three things need your attention. Maria call 10am — following up on the brief. Call Dad at 5; tee time at 6. Wu-Wu's vet still needs scheduling.</p>
          </div>
        </Panel>

        {/* ─── Container 2: Schedule ─── */}
        <Panel>
          <Eyebrow>Schedule</Eyebrow>
          {[{t:"10am",e:"Maria call"},{t:"5pm",e:"Call Dad"},{t:"6pm",e:"Tee time"}].map(({t:time,e})=>(
            <div key={e} style={{display:"flex",alignItems:"center",gap:14,padding:"11px 14px",borderTop:`.5px solid ${EGG_DIV}`}}>
              <span style={{...s(12,MUT),width:42,flexShrink:0}}>{time}</span>
              <span style={{...s(15),flex:1}}>{e}</span>
              <ItemIcon type={iconFor(e)} size={13} color={INK}/>
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
const LISTS_DATA=[
  {id:1,title:"Grocery list",category:"grocery",
    departments:[{name:"Produce",items:["Bananas","Apples","Spinach","Lemons"]},{name:"Dairy",items:["The good butter","Eggs","Parmesan"]},{name:"Bakery",items:["Bread","Bagels"]},{name:"Pantry",items:["Almond milk","Olive oil"]}],
    items:["Bananas","Apples","Spinach","The good butter","Bread","Bagels","Almond milk","Eggs","Parmesan","Lemons","Olive oil"]},
  {id:2,title:"Whole Foods",category:"shopping",items:["Kids jerkey","Deli meats","Deli cheeses","Romaine hearts","Large avocado oil","Brown sugar","Fancy mustard","Good crackers"]},
  {id:3,title:"Costco",category:"shopping",items:["Flushable wipes","Cerave","Coconut water case","Toothpaste","Protein powder","TP"]},
  {id:4,title:"House To Dos",category:"todo",items:["Talk to Bob about bathroom","Fix broken chair","Klipsch speaker to Sam","Amplifiers to repair","Hardwood floors quote","Laundry room built ins"]},
  {id:5,title:"Trip — Mexico",category:"todo",items:["Passport","Book hotel","Dog sitter","Sunscreen","Packing list","Mira's forms"]},
  {id:6,title:"School bag · Mira",category:"todo",items:["Bug spray","Rain jacket","Sleeping bag","Water bottle","Flashlight","Extra socks"]},
];

const ListsGrid = ({nav, setSelectedList, listsShared, setListsShared, lists, setLists}) => {
  const [view,setView]=useState("grid");
  const [newListInput,setNewListInput]=useState("");
  const left=lists.filter((_,i)=>i%2===0);
  const right=lists.filter((_,i)=>i%2===1);

  // Create a new (empty) list from typed or spoken text — title becomes the new list's name.
  const addNewList = (title) => {
    const t = (title || "").trim();
    if (!t) return;
    const newList = {
      id: Date.now(),
      title: t,
      category: "todo",
      items: [],
    };
    setLists(p => [...p, newList]);
    setNewListInput("");
  };
  const onInputSubmit = () => addNewList(newListInput);
  // Voice → new list (same behavior as typing + Enter)
  const {onMicClick: micFn, isRecording, micStatus, micMsg} = useMic(tx => addNewList(tx));
  const onMicClick = () => { if (newListInput.trim()) { onInputSubmit(); return; } micFn(); };

  const Card=({list})=>{
    const shared=listsShared[list.id];
    return (
    <div onClick={()=>{setSelectedList(list);nav("list-detail");}} style={{background:GROUND,border:`.5px solid ${EGG_BDR}`,padding:13,cursor:"pointer"}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:6,marginBottom:8}}>
        <p style={{...s(15,INK,"500"),margin:0,flex:1}}>{list.title}</p>
        {shared&&<ItemIcon type="share" size={13} color={EGG}/>}
      </div>
      {list.items.slice(0,5).map((item,i)=>(
        <div key={i} style={{display:"flex",alignItems:"flex-start",gap:6,marginBottom:4}}>
          <div style={{width:10,height:10,border:`.5px solid ${EGG}`,borderRadius:"50%",flexShrink:0,marginTop:3,background:"transparent"}}/>
          <span style={{...s(12),lineHeight:1.4}}>{item}</span>
        </div>
      ))}
      {list.items.length>5&&<p style={{...s(11,MUT),marginTop:5}}>+ {list.items.length-5} more</p>}
      {list.items.length===0&&<p style={{...s(11,MUT),marginTop:5}}>Empty — tap to add items</p>}
    </div>
    );
  };
  return (
    <div style={{height:"100%",position:"relative",display:"flex",flexDirection:"column"}}>
      <StatusBar time="7:42"/>
      <div style={{paddingTop:18,paddingBottom:14}}>
        <div style={{padding:"0 20px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <h1 style={{...s(32,INK,"300",-3.7),margin:0}}>Lists</h1>
          <Toggle options={[["Grid","grid"],["List","list"]]} value={view} onChange={setView}/>
        </div>
      </div>
      <div style={{overflowY:"auto",flex:1,paddingBottom:132}}>
        {view==="grid"?(
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,padding:"4px 20px",alignItems:"start"}}>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>{left.map(l=><Card key={l.id} list={l}/>)}</div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>{right.map(l=><Card key={l.id} list={l}/>)}</div>
          </div>
        ):(
          <Panel mt={0}>
            {lists.map((list,i)=>{
              const shared=listsShared[list.id];
              return (
              <div key={list.id} onClick={()=>{setSelectedList(list);nav("list-detail");}} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"14px 14px",cursor:"pointer",borderTop:i===0?"none":`.5px solid ${EGG_DIV}`}}>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <p style={{...s(15),margin:0}}>{list.title}</p>
                    {shared&&<ItemIcon type="share" size={13} color={EGG}/>}
                  </div>
                  <p style={{...s(12,MUT),marginTop:3}}>{list.items.length} items{shared?` · Shared with ${shared}`:""}</p>
                </div>
                <ChevronR/>
              </div>
              );
            })}
          </Panel>
        )}
      </div>
      <BottomNav active="lists" nav={nav} inputValue={newListInput} onInputChange={setNewListInput} onInputSubmit={onInputSubmit} onMicClick={onMicClick} isRecording={isRecording} micStatus={micStatus} micMsg={micMsg} placeholder="+ New list"/>
    </div>
  );
};

const ShareModal = ({onClose, onShare, defaultEmail}) => {
  const [email,setEmail]=useState(defaultEmail||"");
  return (
    <div style={{position:"absolute",inset:0,background:"rgba(0,0,0,.45)",display:"flex",alignItems:"flex-end",zIndex:100}}>
      <div style={{background:GROUND,width:"100%",borderRadius:"24px 24px 0 0",padding:"0 0 32px",borderTop:`.5px solid ${EGG_BDR}`}}>
        <div style={{padding:"16px 24px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={s(15,INK,"500")}>Share this list</span>
          <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontFamily:F,fontSize:22,color:MUT}}>×</button>
        </div>
        <div style={{height:.5,background:EGG_DIV}}/>
        <div style={{padding:"16px 24px"}}>
          <p style={{...s(15,MUT),lineHeight:1.5,margin:"0 0 12px"}}>They'll get an invite by email and can add and check off items in real time.</p>
          <input placeholder="name@example.com" value={email} onChange={e=>setEmail(e.target.value)} type="email"
            style={{width:"100%",height:48,border:`.5px solid ${EGG_BDR}`,borderRadius:8,padding:"0 14px",fontFamily:F,fontSize:14,color:INK,outline:"none",boxSizing:"border-box",marginBottom:14,background:GROUND}}/>
          <PrimaryPill onClick={()=>{if(email.trim()){onShare(email.trim());onClose();}}}>Send invite</PrimaryPill>
        </div>
      </div>
    </div>
  );
};

const ListDetail = ({nav, list, listsShared, setListsShared}) => {
  const isGrocery=list?.category==="grocery";
  const initItems=isGrocery
    ?list.departments.flatMap(d=>d.items.map((t,i)=>({id:`${d.name}-${i}`,text:t,done:false,dept:d.name})))
    :(list?.items||[]).map((t,i)=>({id:i,text:t,done:false}));
  const [items,setItems]=useState(initItems);
  const [newItem,setNewItem]=useState("");
  const [showShare,setShowShare]=useState(false);
  if(!list)return null;
  const addItem=()=>{const tx=newItem.trim();if(!tx)return;setItems(p=>[...p,{id:Date.now(),text:tx,done:false,dept:isGrocery?"Other":undefined}]);setNewItem("");};
  const toggle=id=>setItems(p=>p.map(t=>t.id===id?{...t,done:!t.done}:t));
  const depts=isGrocery?[...new Set(items.map(i=>i.dept))]:null;
  const sharedWith=listsShared[list.id];
  // Voice input — spoken text becomes a new list item
  const {onMicClick: micFn, isRecording, micStatus, micMsg} = useMic(tx => {
    setItems(p => [...p, {id: Date.now(), text: tx, done: false, dept: isGrocery ? "Other" : undefined}]);
  });
  const onMicClick = () => { if(newItem.trim()) { addItem(); return; } micFn(); };
  // POST to /api/share-list on Vercel — fails silently locally, will work after deploy
  const handleShare=async(email)=>{
    setListsShared(p=>({...p,[list.id]:email}));
    try{
      await fetch("/api/share-list",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({listId:list.id,listTitle:list.title,email})});
    }catch{}
  };
  return (
    <div style={{height:"100%",position:"relative",display:"flex",flexDirection:"column"}}>
      <StatusBar time="7:42"/>
      <BackNav nav={nav} to="lists"/>
      <div style={{padding:"0 20px",marginTop:8,marginBottom:18}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
          <h1 style={{...s(32,INK,"300",-3.7),margin:0,flex:1,minWidth:0}}>{list.title}</h1>
          <button onClick={()=>setShowShare(true)} aria-label="Share list" style={{background:"none",border:"none",cursor:"pointer",padding:6,display:"flex",alignItems:"center",justifyContent:"center"}}>
            <ItemIcon type="share" size={20} color={sharedWith?EGG:MUT}/>
          </button>
        </div>
        <p style={{...s(15,MUT),margin:"8px 0 0",lineHeight:1.5}}>{items.length} items · {items.filter(i=>i.done).length} done{sharedWith?` · Shared with ${sharedWith}`:""}</p>
      </div>
      <div style={{overflowY:"auto",flex:1,paddingBottom:132}}>
        {isGrocery?depts.map(dept=>{
          const deptItems=items.filter(i=>i.dept===dept);
          return (
            <Panel key={dept}>
              <Eyebrow>{dept}</Eyebrow>
              {deptItems.map(item=>(
                <div key={item.id} onClick={()=>toggle(item.id)} style={{display:"flex",alignItems:"center",gap:13,padding:"11px 14px",cursor:"pointer",borderTop:`.5px solid ${EGG_DIV}`}}>
                  <div style={{width:17,height:17,borderRadius:"50%",border:`1px solid ${item.done?INK:EGG}`,background:item.done?INK:"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s"}}>
                    {item.done&&<svg width="9" height="9" viewBox="0 0 8 8" fill="none"><path d="M1 4.5L3.5 7L7.5 2" stroke={WHT} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                  </div>
                  <span style={{...s(15,item.done?MUT:INK),textDecoration:item.done?"line-through":"none"}}>{item.text}</span>
                </div>
              ))}
            </Panel>
          );
        }):(
          <Panel>
            {items.map((item,i)=>(
              <div key={item.id} onClick={()=>toggle(item.id)} style={{display:"flex",alignItems:"center",gap:13,padding:"12px 14px",cursor:"pointer",borderTop:i===0?"none":`.5px solid ${EGG_DIV}`}}>
                <div style={{width:17,height:17,borderRadius:"50%",border:`1px solid ${item.done?INK:EGG}`,background:item.done?INK:"transparent",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",transition:"all .15s"}}>
                  {item.done&&<svg width="9" height="9" viewBox="0 0 8 8" fill="none"><path d="M1 4.5L3.5 7L7.5 2" stroke={WHT} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <span style={{...s(15,item.done?MUT:INK),textDecoration:item.done?"line-through":"none"}}>{item.text}</span>
              </div>
            ))}
          </Panel>
        )}
      </div>
      {showShare&&<ShareModal onClose={()=>setShowShare(false)} onShare={handleShare} defaultEmail={sharedWith||"natescott@gmail.com"}/>}
      <BottomNav active="lists" nav={nav} inputValue={newItem} onInputChange={setNewItem} onInputSubmit={addItem} onMicClick={onMicClick} isRecording={isRecording} micStatus={micStatus} micMsg={micMsg}/>
    </div>
  );
};

// ─── CHAT ────────────────────────────────────────────────────
const Chat = ({nav}) => {
  const [msgs,setMsgs]=useState([{role:"robin",text:"Morning. Three things need your attention today. Want to hear them?"}]);
  const [input,setInput]=useState("");
  const [loading,setLoading]=useState(false);
  const bottomRef=useRef(null);
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[msgs]);
  const send=async()=>{
    if(!input.trim()||loading)return;
    const m=input.trim();setInput("");
    setMsgs(p=>[...p,{role:"user",text:m}]);setLoading(true);
    try{
      const r=await fetch("/api/claude",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,system:"You are Robin, a warm smart personal assistant talking to Marian. Keep replies concise. Never mention being an AI.",messages:[...msgs,{role:"user",text:m}].map(x=>({role:x.role==="robin"?"assistant":"user",content:x.text}))})});
      const d=await r.json();setMsgs(p=>[...p,{role:"robin",text:d.content?.[0]?.text||"…"}]);
    }catch{setMsgs(p=>[...p,{role:"robin",text:"Something went wrong. Try again."}]);}
    setLoading(false);
  };
  return (
    <div style={{height:"100%",position:"relative",display:"flex",flexDirection:"column",background:GROUND}}>
      <StatusBar time="7:42"/>
      <div style={{textAlign:"center",paddingTop:76,paddingBottom:14}}>
        <span style={{...s(11,MUT,"500",1.3),textTransform:"uppercase"}}>Robin · Online</span>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"4px 20px",display:"flex",flexDirection:"column",gap:12,paddingBottom:148}}>
        {msgs.map((m,i)=>(
          <div key={i} style={{maxWidth:"76%",alignSelf:m.role==="robin"?"flex-start":"flex-end",background:m.role==="robin"?GROUND:INK,border:m.role==="robin"?`.5px solid ${EGG_BDR}`:"none",borderRadius:18,padding:"12px 16px"}}>
            <p style={{...s(15,m.role==="robin"?INK:WHT),lineHeight:1.5}}>{m.text}</p>
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
const EVENTS={
  1:[{time:"10am",title:"Maria call"},{time:"12pm",title:"Lunch hold"},{time:"3:30",title:"Mira pickup"},{time:"5pm",title:"Call Dad",from:"Robin"},{time:"6pm",title:"Tee time"}],
  5:[{time:"2pm",title:"Dentist"}],
  8:[{time:"6pm",title:"Dinner — Michael"}],
  12:[{time:"10am",title:"Maria call"},{time:"12pm",title:"Lunch hold"},{time:"3:30",title:"Mira pickup"},{time:"5pm",title:"Call Dad",from:"Robin"},{time:"6pm",title:"Tee time"}],
  15:[{time:"9am",title:"School pickup"}],20:[{time:"3pm",title:"Wu-Wu vet"}],25:[{time:"11am",title:"Contractor"}],
};

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
  const [view,setView]=useState("day");
  const [selectedDate,setSelectedDate]=useState(12);
  const [hoveredDate,setHoveredDate]=useState(null);
  const [showAddEvent,setShowAddEvent]=useState(false);
  const [newEventInput,setNewEventInput]=useState("");
  // Fall back to local state if router didn't pass shared state (back-compat).
  const [localEvents,setLocalEvents]=useState(EVENTS);
  const events = calendarEvents ?? localEvents;
  const setEvents = setCalendarEvents ?? setLocalEvents;
  const monthDays=[...Array(31)].map((_,i)=>i+1);
  const paddedDays=[...Array(1).fill(null),...monthDays];
  const addEvent=ev=>{if(!ev.title?.trim())return;const d=ev.date?new Date(ev.date).getDate():selectedDate;setEvents(p=>({...p,[d]:[...(p[d]||[]),{time:ev.time||"",title:ev.title}]}));};

  // Quick-add from the bottom input — typing or speaking creates an event
  // on the currently-selected day with no time (user can edit later for precision).
  const quickAdd = (title) => {
    const t = (title || "").trim();
    if (!t) return;
    addEvent({title: t});
    setNewEventInput("");
  };
  const onInputSubmit = () => quickAdd(newEventInput);
  const {onMicClick: micFn, isRecording, micStatus, micMsg} = useMic(tx => quickAdd(tx));
  const onMicClick = () => { if (newEventInput.trim()) { onInputSubmit(); return; } micFn(); };
  const selectedEvents=events[selectedDate]||[];
  const daysOfWeek=["M","T","W","T","F","S","S"];
  // Build the week containing the selected date (Mon-anchored)
  const may1Weekday = new Date(2026,4,1).getDay(); // 0=Sun
  const weekStart = selectedDate - ((selectedDate - 1 + may1Weekday + 6) % 7); // Monday of selected date's week
  // Pad with cross-month dates instead of nulls — matches the comp's "27 28 29 30 1 2 3" week strip
  const fullWeek = Array.from({length:7},(_,i)=>{
    const d = weekStart+i;
    if(d>=1&&d<=31) return {date:d, inMonth:true};
    if(d<1)         return {date:30+d, inMonth:false}; // previous month (April has 30)
    if(d>31)        return {date:d-31, inMonth:false}; // next month
    return {date:null, inMonth:false};
  });
  // Today's date for the return-to-today affordance
  const TODAY = new Date();
  const todayShort = `${String(TODAY.getMonth()+1).padStart(2,"0")}.${String(TODAY.getDate()).padStart(2,"0")}`;
  // Weekday name of selected date (May 2026)
  const selectedWeekday = new Date(2026,4,selectedDate).toLocaleDateString("en-US",{weekday:"long"});
  const selectedMonthDay = `${selectedWeekday.toUpperCase()} · MAY ${String(selectedDate).padStart(2,"0")}`;

  return (
    <div style={{height:"100%",position:"relative",display:"flex",flexDirection:"column"}}>
      <StatusBar time="7:42"/>
      {/* Top eyebrow row: section indicator (left) + return-to-today (right) */}
      <div style={{padding:"18px 20px 0",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <span style={{...s(11,MUT,"500",1.3),textTransform:"uppercase"}}>{selectedDate} / Calendar</span>
        <div onClick={()=>setSelectedDate(TODAY.getDate())} style={{textAlign:"right",cursor:"pointer"}}>
          <div style={{display:"flex",alignItems:"center",gap:5,justifyContent:"flex-end"}}>
            <ItemIcon type="return" size={11} color={MUT}/>
            <span style={{...s(11,MUT,"500",1.3),textTransform:"uppercase"}}>Today</span>
          </div>
          <div style={{...s(15,INK),marginTop:2}}>{todayShort}</div>
        </div>
      </div>
      {/* Big weekday/month title + toggle */}
      <div style={{padding:"6px 20px 14px"}}>
        <h1 style={{...s(40,INK,"300",-4),margin:"0 0 14px"}}>{view==="day"?selectedWeekday:"May"}</h1>
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
                <div key={i} style={{display:"flex",alignItems:"flex-start",gap:14,padding:"12px 14px",borderTop:`.5px solid ${EGG_DIV}`}}>
                  <span style={{...s(12,MUT),width:46,flexShrink:0,marginTop:2}}>{ev.time}</span>
                  <div style={{flex:1}}>
                    <div style={s(15)}>{ev.title}</div>
                    {ev.from&&<div style={{...s(11,MUT),marginTop:2}}>From {ev.from}</div>}
                  </div>
                  <ItemIcon type={iconFor(ev.title)} size={18} color={INK}/>
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
                      <div style={{width:34,height:46,border:`1px solid ${INK}`,borderRadius:3,display:"flex",alignItems:"center",justifyContent:"center"}}>
                        <span style={s(18,INK,"500",-0.3)}>{date}</span>
                      </div>
                    ):(
                      <div style={{width:34,height:46,display:"flex",alignItems:"center",justifyContent:"center"}}>
                        <span style={s(18,INK,"400",-0.3)}>{date||""}</span>
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
                <div key={i} style={{display:"flex",alignItems:"flex-start",gap:14,padding:"14px 14px",borderTop:`.5px solid ${EGG_DIV}`}}>
                  <span style={{...s(15,MUT),width:54,flexShrink:0,marginTop:2}}>{ev.time}</span>
                  <div style={{flex:1}}>
                    <div style={s(15)}>{ev.title}</div>
                    {ev.from&&<div style={{...s(12,MUT),marginTop:3}}>From {ev.from}</div>}
                  </div>
                  <ItemIcon type={iconFor(ev.title)} size={20} color={INK}/>
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
  <div style={{height:"100%",position:"relative",display:"flex",flexDirection:"column"}}>
    <StatusBar time="7:42"/>
    <ScreenHeader title="Settings"/>
    <div style={{overflowY:"auto",flex:1,paddingBottom:132}}>
      <Panel mt={0}>
        <SettingsRow isFirst label="Profile"       value="Marian Williams" to="settings-profile"       nav={nav}/>
        <SettingsRow         label="Connections"   value="Cal · Mail"      to="settings-connections"   nav={nav}/>
        <SettingsRow         label="Robin's Hours" value="7 AM – 9 PM"     to="settings-hours"         nav={nav}/>
        <SettingsRow         label="Notifications" caption="On"            to="settings-notifications" nav={nav}/>
        <SettingsRow         label="About Robin"   value="v0.3"            to="settings-about"         nav={nav}/>
      </Panel>
      <Panel>
        <SettingsRow isFirst label="Terms of Use"                          to="terms"                  nav={nav}/>
        <SettingsRow         label="Privacy Policy"                        to="privacy"                nav={nav}/>
        <SettingsRow         label="Contact Us"                            to="contact"                nav={nav}/>
      </Panel>
      <div style={{margin:"24px 20px 0"}}>
        <OutlinePill onClick={()=>nav("splash")}>Sign out</OutlinePill>
      </div>
      <div style={{textAlign:"center",marginTop:20}}>
        <button onClick={()=>{}} style={{background:"none",border:"none",fontFamily:F,fontSize:10,color:RED,cursor:"pointer",letterSpacing:"1.32px",textTransform:"uppercase"}}>Delete account</button>
      </div>
    </div>
    <BottomNav active="settings" nav={nav}/>
  </div>
);

// Settings sub-pages — all have prominent BackNav, no HR after it
const SettingsProfile = ({nav}) => {
  const [name,setName]=useState("Marian Williams");
  const [email,setEmail]=useState("marian@froelich.co");
  return (
    <div style={{height:"100%",display:"flex",flexDirection:"column"}}>
      <StatusBar time="7:42"/>
      <BackNav nav={nav} to="settings"/>
      <ScreenHeader title="Profile" withBack/>
      <div style={{display:"flex",flexDirection:"column",alignItems:"center",padding:"0 24px 18px"}}>
        <button style={{width:96,height:96,borderRadius:"50%",background:GROUND,border:`1px solid ${EGG}`,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:12,cursor:"pointer"}}>
          <ItemIcon type="camera" size={28} color={EGG}/>
        </button>
        <p style={{...s(16,INK,"500"),margin:0}}>Marian Williams</p>
        <button style={{...s(12,MUT),background:"none",border:"none",cursor:"pointer",marginTop:6,fontFamily:F}}>Add photo</button>
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
      <StatusBar time="7:42"/>
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
      <StatusBar time="7:42"/>
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
      <StatusBar time="7:42"/>
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
    <StatusBar time="7:42"/>
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

const TERMS=[["Overview","By using Robin, you agree to these Terms."],["Acceptable Use","Robin is for personal, non-commercial use only."],["Your Data","Robin accesses your calendar and contacts. We don't sell your data."],["Updates","Continued use means you accept revised terms."],["Contact","hello@robinapp.co"]];
const PRIVACY=[["What We Collect","Name, email, calendar events, to-dos, anonymised usage."],["How We Use It","To power briefings, set reminders, personalise your experience."],["Sharing","We don't sell your data."],["Storage","Encrypted at rest and in transit."],["Your Rights","Delete your data anytime from Settings → Delete Account."],["Contact","hello@robinapp.co"]];

const Legal = ({nav, title, sections}) => (
  <div style={{height:"100%",display:"flex",flexDirection:"column"}}>
    <StatusBar time="7:42"/>
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
    <StatusBar time="7:42"/>
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
  const [listsShared,setListsShared]=useState({});
  const [lists,setLists]=useState(LISTS_DATA);
  const [calendarEvents,setCalendarEvents]=useState(EVENTS);
  const [pendingHomeAdd,setPendingHomeAdd]=useState(null);
  const [toast,setToast]=useState(null);
  const nav=to=>setScreen(to);

  // ─── Action Button hand-off ───
  // Reads ?add=<text> from the URL on first mount (delivered by the iOS
  // Shortcut described in the README) and queues it for the Home screen.
  // Shows a brief toast and cleans the URL so a refresh doesn't re-add.
  useEffect(()=>{
    const params = new URLSearchParams(window.location.search);
    const add = params.get("add");
    if (add && add.trim()) {
      setPendingHomeAdd(add.trim());
      setToast(`Added: ${add.trim()}`);
      setTimeout(()=>setToast(null), 3500);
      // Strip the param so a refresh doesn't replay
      window.history.replaceState({}, "", window.location.pathname);
      // Land on Home so the user can see what got added
      setScreen("home");
    }
  },[]);

  // Switch-based router — one element per render, clean identity tracking
  const renderScreen=()=>{
    switch(screen){
      case "splash":                  return <Splash nav={nav}/>;
      case "signin":                  return <SignIn nav={nav}/>;
      case "goals":                   return <Goals nav={nav}/>;
      case "robins-hours-setup":      return <RobinsHoursSetup nav={nav}/>;
      case "notifications-intro":     return <NotificationsIntro nav={nav}/>;
      case "loading":                 return <Loading nav={nav}/>;
      case "home":                    return <Home nav={nav} pendingAdd={pendingHomeAdd} onPendingConsumed={()=>setPendingHomeAdd(null)}/>;
      case "lists":                   return <ListsGrid nav={nav} setSelectedList={setSelectedList} listsShared={listsShared} setListsShared={setListsShared} lists={lists} setLists={setLists}/>;
      case "list-detail":             return <ListDetail nav={nav} list={selectedList} listsShared={listsShared} setListsShared={setListsShared}/>;
      case "chat":                    return <Chat nav={nav}/>;
      case "calendar":                return <Calendar nav={nav} calendarEvents={calendarEvents} setCalendarEvents={setCalendarEvents}/>;
      case "settings":                return <Settings nav={nav}/>;
      case "settings-profile":        return <SettingsProfile nav={nav}/>;
      case "settings-connections":    return <SettingsConnections nav={nav}/>;
      case "settings-hours":          return <SettingsHours nav={nav}/>;
      case "settings-notifications":  return <SettingsNotifications nav={nav}/>;
      case "settings-about":          return <SettingsAbout nav={nav}/>;
      case "terms":                   return <Legal nav={nav} title="Terms of Use" sections={TERMS}/>;
      case "privacy":                 return <Legal nav={nav} title="Privacy Policy" sections={PRIVACY}/>;
      case "contact":                 return <ContactUs nav={nav}/>;
      default:                        return <Home nav={nav} pendingAdd={pendingHomeAdd} onPendingConsumed={()=>setPendingHomeAdd(null)}/>;
    }
  };

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@100;200;300;400;500;600;700&display=swap" rel="stylesheet"/>
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
          min-height: 100dvh;
          position: relative;
          overflow: hidden;
          font-family: ${F};
          background-color: ${GROUND};
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3Cpattern id='g' width='10' height='10' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 10 0 L 0 0 0 10' fill='none' stroke='%235BBFC7' stroke-width='0.5' stroke-opacity='0.38'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width='100%25' height='100%25' fill='url(%23g)'/%3E%3C/svg%3E");
          padding-top: env(safe-area-inset-top);
          padding-bottom: env(safe-area-inset-bottom);
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
