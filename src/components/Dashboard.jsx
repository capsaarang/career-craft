import { useState, useEffect } from "react";
import { supabase, ADMIN_EMAIL } from "../supabase.js";
import { COLORS, MOTIVATIONAL_QUOTES } from "../constants.js";
import Tailor from "./Tailor.jsx";
import Tracker from "./Tracker.jsx";
import Community from "./Community.jsx";
import AdminPanel from "./AdminPanel.jsx";
import InterviewPrep from "./InterviewPrep.jsx";

export default function Dashboard({ session }) {
  const [tab, setTab] = useState("tailor");
  const [quote, setQuote] = useState(MOTIVATIONAL_QUOTES[0]);
  const isAdmin = session.user.email === ADMIN_EMAIL;

  useEffect(() => {
    const q = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];
    setQuote(q);
  }, []);

  const signOut = () => supabase.auth.signOut();
  const userName = session.user.user_metadata?.full_name || session.user.email.split("@")[0];

  const tabs = [
    { id:"tailor", label:"✦ Tailor Resume" },
    { id:"tracker", label:"⊞ Applications" },
    { id:"community", label:"❋ Community" },
    { id:"interview", label:"◈ Interview Prep" },
    ...(isAdmin ? [{ id:"admin", label:"⚡ Admin" }] : []),
  ];

  const S = {
    app: { minHeight:"100vh", background:COLORS.bg, color:COLORS.text, fontFamily:"'Inter',sans-serif", fontSize:"14px" },
    nav: { background:COLORS.bg2, borderBottom:`1px solid ${COLORS.border}`, padding:"0 2rem", display:"flex", alignItems:"center", justifyContent:"space-between", position:"sticky", top:0, zIndex:100 },
    navLeft: { display:"flex", alignItems:"center" },
    logo: { fontFamily:"Georgia,serif", fontWeight:700, fontSize:"1rem", color:COLORS.accent, padding:"1rem 1.5rem 1rem 0", borderRight:`1px solid ${COLORS.border}`, marginRight:"1rem" },
    tabBtn: (a) => ({ background:"none", border:"none", color:a?COLORS.text:COLORS.muted, padding:"1rem 1.1rem", cursor:"pointer", fontSize:"0.82rem", fontWeight:a?600:400, borderBottom:a?`2px solid ${COLORS.accent}`:"2px solid transparent", transition:"all 0.2s", fontFamily:"inherit" }),
    navRight: { display:"flex", alignItems:"center", gap:"1rem", fontSize:"0.82rem" },
    userName: { color:COLORS.muted },
    adminBadge: { background:"rgba(245,158,11,0.1)", border:"1px solid rgba(245,158,11,0.3)", color:"#F59E0B", padding:"0.15rem 0.5rem", borderRadius:"4px", fontSize:"0.68rem", fontFamily:"monospace", fontWeight:700 },
    signOut: { background:"none", border:`1px solid ${COLORS.border}`, color:COLORS.muted, borderRadius:"6px", padding:"0.3rem 0.75rem", cursor:"pointer", fontFamily:"inherit", fontSize:"0.78rem" },
    quoteBanner: { background:`linear-gradient(135deg, ${COLORS.card}, ${COLORS.card2})`, borderBottom:`1px solid ${COLORS.border}`, padding:"0.6rem 2rem", display:"flex", alignItems:"center", gap:"1rem" },
    quoteText: { fontSize:"0.78rem", color:COLORS.muted, fontStyle:"italic" },
    quoteAuthor: { fontSize:"0.72rem", color:COLORS.dim },
    main: { maxWidth:"1400px", margin:"0 auto", padding:"2rem" },
  };

  return (
    <div style={S.app}>
      <nav style={S.nav}>
        <div style={S.navLeft}>
          <div style={S.logo}>CareerCraft ✦</div>
          {tabs.map(t => <button key={t.id} style={S.tabBtn(tab===t.id)} onClick={()=>setTab(t.id)}>{t.label}</button>)}
        </div>
        <div style={S.navRight}>
          {isAdmin && <span style={S.adminBadge}>ADMIN</span>}
          <span style={S.userName}>👤 {userName}</span>
          <button style={S.signOut} onClick={signOut}>Sign out</button>
        </div>
      </nav>
      <div style={S.quoteBanner}>
        <span style={{color:COLORS.accent,fontSize:"1rem"}}>✦</span>
        <span style={S.quoteText}>"{quote.quote}"</span>
        <span style={S.quoteAuthor}>— {quote.author}</span>
      </div>
      <div style={S.main}>
        {tab==="tailor" && <Tailor session={session} />}
        {tab==="tracker" && <Tracker session={session} />}
        {tab==="community" && <Community session={session} />}
        {tab==="interview" && <InterviewPrep session={session} />}
        {tab==="admin" && isAdmin && <AdminPanel session={session} />}
      </div>
    </div>
  );
}
