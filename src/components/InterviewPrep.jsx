import { useState } from "react";
import { COLORS } from "../constants.js";

export default function InterviewPrep({ session }) {
  const [jd, setJd] = useState("");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateQuestions = async () => {
    if (!jd.trim()) { setError("Please paste the job description."); return; }
    setError(""); setLoading(true); setQuestions([]);
    try {
      const res = await fetch("/.netlify/functions/claude", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-6", max_tokens:2000,
          system:`You are an expert interview coach specializing in tech and business roles. Generate realistic interview questions based on a job description.`,
          messages:[{ role:"user", content:`Generate 15 likely interview questions for this role at ${company||"this company"}:\n\nRole: ${role||"unknown"}\n\nJob Description:\n${jd}\n\nOrganize into sections: Behavioral (5), Technical/Role-Specific (5), Case/Problem-Solving (3), Culture/Motivation (2). For each question, add a brief tip on how to answer it. Return as JSON array: [{"category": "Behavioral", "question": "...", "tip": "..."}]` }]
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      let text = data.content?.[0]?.text || "[]";
      text = text.replace(/^```json\n?/,"").replace(/^```\n?/,"").replace(/```$/,"").trim();
      setQuestions(JSON.parse(text));
    } catch(err) { setError("Error: " + err.message); }
    finally { setLoading(false); }
  };

  const categoryColor = (c) => ({ "Behavioral":"#5B8FF9","Technical/Role-Specific":"#00C9A7","Case/Problem-Solving":"#F59E0B","Culture/Motivation":"#8B5CF6" }[c]||"#5B8FF9");

  const S = {
    card: { background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:"10px", padding:"1.25rem" },
    label: { display:"block", fontSize:"0.7rem", color:COLORS.teal, fontFamily:"monospace", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"0.4rem" },
    ta: { width:"100%", background:COLORS.bg2, border:`1px solid ${COLORS.border}`, borderRadius:"6px", color:COLORS.text, padding:"0.75rem", fontFamily:"inherit", fontSize:"0.84rem", lineHeight:1.6, resize:"vertical", outline:"none", boxSizing:"border-box" },
    btn: (v) => ({ background:v==="primary"?COLORS.accent:"transparent", color:v==="primary"?"#fff":COLORS.text, border:v==="ghost"?`1px solid ${COLORS.border}`:"none", borderRadius:"6px", padding:"0.6rem 1.2rem", cursor:"pointer", fontSize:"0.84rem", fontWeight:600, fontFamily:"inherit" }),
    input: { background:COLORS.bg2, border:`1px solid ${COLORS.border}`, borderRadius:"6px", color:COLORS.text, padding:"0.55rem 0.75rem", fontFamily:"inherit", fontSize:"0.84rem", outline:"none", width:"100%", boxSizing:"border-box" },
    error: { background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", color:"#EF4444", borderRadius:"6px", padding:"0.75rem 1rem", fontSize:"0.82rem", marginBottom:"1rem" },
  };

  const grouped = questions.reduce((acc,q)=>{ (acc[q.category]=acc[q.category]||[]).push(q); return acc; }, {});

  return (
    <div>
      <div style={{marginBottom:"1.5rem"}}>
        <h1 style={{fontFamily:"Georgia,serif",fontSize:"1.6rem",fontWeight:700,letterSpacing:"-0.02em",marginBottom:"0.3rem"}}>Interview <span style={{color:COLORS.accent,fontStyle:"italic"}}>prep</span></h1>
        <p style={{color:COLORS.muted,fontSize:"0.88rem"}}>Paste a job description and get AI-generated interview questions tailored to the role.</p>
      </div>

      {error && <div style={S.error}>{error}</div>}

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1.25rem",marginBottom:"1.25rem"}}>
        <div style={S.card}>
          <label style={S.label}>Job Description</label>
          <textarea style={{...S.ta,height:"300px"}} placeholder="Paste the full job description..." value={jd} onChange={e=>setJd(e.target.value)} />
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:"1rem"}}>
          <div style={S.card}>
            <label style={S.label}>Company (optional)</label>
            <input style={S.input} placeholder="Goldman Sachs" value={company} onChange={e=>setCompany(e.target.value)} />
          </div>
          <div style={S.card}>
            <label style={S.label}>Role (optional)</label>
            <input style={S.input} placeholder="TPM Intern" value={role} onChange={e=>setRole(e.target.value)} />
          </div>
          <div style={{...S.card,background:"rgba(91,143,249,0.05)",borderColor:"rgba(91,143,249,0.2)"}}>
            <div style={{fontSize:"0.82rem",color:COLORS.muted,lineHeight:1.6,marginBottom:"1rem"}}>
              Claude will generate <strong style={{color:COLORS.text}}>15 interview questions</strong> organized by category — Behavioral, Technical, Case, and Culture — each with a tip on how to answer.
            </div>
            <button style={S.btn("primary")} onClick={generateQuestions} disabled={loading}>{loading?"Generating questions...":"◈ Generate Interview Questions"}</button>
          </div>
        </div>
      </div>

      {questions.length>0 && (
        <div>
          {Object.entries(grouped).map(([category, qs])=>(
            <div key={category} style={{...S.card,marginBottom:"1rem"}}>
              <div style={{display:"flex",alignItems:"center",gap:"0.6rem",marginBottom:"1rem",paddingBottom:"0.75rem",borderBottom:`1px solid ${COLORS.border}`}}>
                <div style={{width:"8px",height:"8px",borderRadius:"50%",background:categoryColor(category)}}></div>
                <span style={{fontFamily:"Georgia,serif",fontWeight:700,fontSize:"1rem",color:COLORS.text}}>{category}</span>
                <span style={{fontSize:"0.72rem",color:COLORS.muted,fontFamily:"monospace"}}>{qs.length} questions</span>
              </div>
              {qs.map((q,i)=>(
                <div key={i} style={{marginBottom:"1rem",paddingBottom:"1rem",borderBottom:i<qs.length-1?`1px solid ${COLORS.border}20`:"none"}}>
                  <div style={{fontSize:"0.9rem",color:COLORS.text,fontWeight:500,marginBottom:"0.4rem"}}>{i+1}. {q.question}</div>
                  <div style={{fontSize:"0.78rem",color:COLORS.muted,background:COLORS.bg2,borderRadius:"6px",padding:"0.5rem 0.75rem",borderLeft:`3px solid ${categoryColor(category)}`}}>
                    💡 {q.tip}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
