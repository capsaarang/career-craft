import { useState } from "react";
import { supabase } from "../supabase.js";
import { COLORS, MOTIVATIONAL_QUOTES } from "../constants.js";

export default function Auth() {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const quote = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];

  const handleSubmit = async () => {
    setError(""); setMessage(""); setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { data: { full_name: name } }
        });
        if (error) throw error;
        if (data.user) {
          await supabase.from("profiles").upsert({ id: data.user.id, full_name: name, email });
          setMessage("Account created! You can now sign in.");
          setMode("login");
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const S = {
    page: { minHeight:"100vh", background:COLORS.bg, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Inter',sans-serif", padding:"2rem" },
    grid: { display:"grid", gridTemplateColumns:"1fr 1fr", maxWidth:"900px", width:"100%", minHeight:"560px", borderRadius:"16px", overflow:"hidden", border:`1px solid ${COLORS.border}` },
    left: { background:`linear-gradient(135deg, ${COLORS.bg2}, #0D1A35)`, padding:"3rem", display:"flex", flexDirection:"column", justifyContent:"space-between" },
    right: { background:COLORS.card, padding:"3rem", display:"flex", flexDirection:"column", justifyContent:"center" },
    logo: { fontFamily:"Georgia,serif", fontSize:"1.5rem", fontWeight:700, color:COLORS.accent, marginBottom:"0.25rem" },
    tagline: { fontSize:"0.82rem", color:COLORS.muted, marginBottom:"3rem" },
    quoteText: { fontFamily:"Georgia,serif", fontSize:"1.1rem", fontStyle:"italic", color:COLORS.text, lineHeight:1.7, marginBottom:"0.75rem" },
    quoteAuthor: { fontSize:"0.78rem", color:COLORS.muted },
    title: { fontFamily:"Georgia,serif", fontSize:"1.6rem", fontWeight:700, color:COLORS.text, marginBottom:"0.3rem" },
    sub: { fontSize:"0.84rem", color:COLORS.muted, marginBottom:"2rem" },
    label: { display:"block", fontSize:"0.7rem", color:COLORS.teal, fontFamily:"monospace", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"0.4rem" },
    input: { width:"100%", background:COLORS.bg2, border:`1px solid ${COLORS.border}`, borderRadius:"6px", color:COLORS.text, padding:"0.7rem 0.85rem", fontFamily:"inherit", fontSize:"0.88rem", outline:"none", boxSizing:"border-box", marginBottom:"1rem" },
    btn: { width:"100%", background:COLORS.accent, color:"#fff", border:"none", borderRadius:"6px", padding:"0.75rem", cursor:"pointer", fontSize:"0.9rem", fontWeight:600, fontFamily:"inherit", marginTop:"0.5rem" },
    error: { background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", color:"#EF4444", borderRadius:"6px", padding:"0.6rem 0.85rem", fontSize:"0.8rem", marginBottom:"1rem" },
    success: { background:"rgba(0,201,167,0.1)", border:"1px solid rgba(0,201,167,0.3)", color:COLORS.teal, borderRadius:"6px", padding:"0.6rem 0.85rem", fontSize:"0.8rem", marginBottom:"1rem" },
    toggle: { textAlign:"center", marginTop:"1.5rem", fontSize:"0.82rem", color:COLORS.muted },
    toggleBtn: { background:"none", border:"none", color:COLORS.accent, cursor:"pointer", fontFamily:"inherit", fontSize:"0.82rem", fontWeight:600 },
    features: { display:"flex", flexDirection:"column", gap:"0.75rem", marginTop:"2rem" },
    feature: { display:"flex", alignItems:"center", gap:"0.75rem", fontSize:"0.82rem", color:COLORS.muted },
    featureIcon: { width:"28px", height:"28px", borderRadius:"6px", background:"rgba(91,143,249,0.1)", border:`1px solid rgba(91,143,249,0.2)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.9rem", flexShrink:0 },
  };

  return (
    <div style={S.page}>
      <div style={S.grid}>
        <div style={S.left}>
          <div>
            <div style={S.logo}>CareerCraft ✦</div>
            <div style={S.tagline}>AI-powered resume tailoring for ambitious professionals</div>
            <div style={S.features}>
              {[
                ["✦", "Tailor your resume to any JD in seconds"],
                ["◈", "Track every application in one place"],
                ["⊞", "Community insights from fellow job seekers"],
                ["❋", "AI-generated interview prep questions"],
                ["↗", "Direct Overleaf integration"],
              ].map(([icon, text]) => (
                <div key={text} style={S.feature}>
                  <div style={S.featureIcon}>{icon}</div>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={S.quoteText}>"{quote.quote}"</div>
            <div style={S.quoteAuthor}>— {quote.author}</div>
          </div>
        </div>
        <div style={S.right}>
          <div style={S.title}>{mode === "login" ? "Welcome back" : "Create account"}</div>
          <div style={S.sub}>{mode === "login" ? "Sign in to your CareerCraft account" : "Start tailoring your resume today"}</div>
          {error && <div style={S.error}>{error}</div>}
          {message && <div style={S.success}>{message}</div>}
          {mode === "register" && (
            <div>
              <label style={S.label}>Full Name</label>
              <input style={S.input} placeholder="Saarang Govinda Rajan" value={name} onChange={e=>setName(e.target.value)} />
            </div>
          )}
          <div>
            <label style={S.label}>Email</label>
            <input style={S.input} type="email" placeholder="you@email.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSubmit()} />
          </div>
          <div>
            <label style={S.label}>Password</label>
            <input style={S.input} type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSubmit()} />
          </div>
          <button style={S.btn} onClick={handleSubmit} disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Create Account"}
          </button>
          <div style={S.toggle}>
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button style={S.toggleBtn} onClick={()=>{setMode(mode==="login"?"register":"login");setError("");setMessage("");}}>
              {mode === "login" ? "Sign up free" : "Sign in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
