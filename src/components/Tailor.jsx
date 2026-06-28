import { useState, useEffect } from "react";
import { supabase } from "../supabase.js";
import { COLORS, DEFAULT_PROMPT } from "../constants.js";

export default function Tailor({ session }) {
  const [originalResume, setOriginalResume] = useState("");
  const [latexTemplate, setLatexTemplate] = useState("");
  const [jd, setJd] = useState("");
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [companyInput, setCompanyInput] = useState("");
  const [roleInput, setRoleInput] = useState("");
  const [showPrompt, setShowPrompt] = useState(false);
  const [savedResumes, setSavedResumes] = useState([]);
  const [saveResumeName, setSaveResumeName] = useState("");
  const [showSaveModal, setShowSaveModal] = useState(false);

  useEffect(() => {
    const r = localStorage.getItem("cc_original");
    const l = localStorage.getItem("cc_latex");
    const p = localStorage.getItem("cc_prompt");
    if (r) setOriginalResume(r);
    if (l) setLatexTemplate(l);
    if (p) setPrompt(p);
    loadSavedResumes();
  }, []);

  useEffect(() => { localStorage.setItem("cc_original", originalResume); }, [originalResume]);
  useEffect(() => { localStorage.setItem("cc_latex", latexTemplate); }, [latexTemplate]);
  useEffect(() => { localStorage.setItem("cc_prompt", prompt); }, [prompt]);

  const loadSavedResumes = async () => {
    const { data } = await supabase.from("resume_library").select("*").eq("user_id", session.user.id).order("created_at", { ascending:false });
    if (data) setSavedResumes(data);
  };

  const saveResume = async () => {
    if (!saveResumeName.trim()) return;
    await supabase.from("resume_library").insert({ user_id:session.user.id, name:saveResumeName, original_text:originalResume, latex_template:latexTemplate });
    setShowSaveModal(false); setSaveResumeName("");
    loadSavedResumes();
  };

  const loadResume = (r) => { setOriginalResume(r.original_text); setLatexTemplate(r.latex_template); };

  const tailorResume = async () => {
    if (!originalResume.trim()) { setError("Please paste your original resume."); return; }
    if (!latexTemplate.trim()) { setError("Please paste your LaTeX template."); return; }
    if (!jd.trim()) { setError("Please paste the job description."); return; }
    setError(""); setLoading(true); setOutput("");
    try {
      const res = await fetch("/.netlify/functions/claude", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          model:"claude-sonnet-4-6", max_tokens:4000, system:prompt,
          messages:[{ role:"user", content:`ORIGINAL RESUME:\n${originalResume}\n\n---\n\nLATEX TEMPLATE:\n${latexTemplate}\n\n---\n\nJOB DESCRIPTION:\n${jd}\n\n---\n\nTailor the resume. Return only complete LaTeX source code.` }]
        })
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);
      let result = data.content?.[0]?.text || "";
      result = result.replace(/^```latex\n?/,"").replace(/^```\n?/,"").replace(/```$/,"").trim();
      setOutput(result);
      if (companyInput || roleInput) {
        await supabase.from("applications").insert({
          user_id:session.user.id, company:companyInput||"Unknown", role:roleInput||"Unknown",
          status:"Applied", resume_latex:result, jd_text:jd,
          applied_at: new Date().toISOString()
        });
      }
    } catch(err) { setError("Error: " + err.message); }
    finally { setLoading(false); }
  };

  const copyToClipboard = () => { navigator.clipboard.writeText(output).then(()=>{ setCopied(true); setTimeout(()=>setCopied(false),2000); }); };

  const downloadTex = () => {
    const company = companyInput.trim().replace(/\s+/g,"_")||"Company";
    const role = roleInput.trim().replace(/\s+/g,"_")||"Role";
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([output],{type:"text/plain"}));
    a.download = `Saarang_GR_${company}_${role}.tex`; a.click();
  };

  const openOverleaf = () => {
    const form = document.createElement("form");
    form.method="POST"; form.action="https://www.overleaf.com/docs"; form.target="_blank";
    const input = document.createElement("input");
    input.type="hidden"; input.name="snip"; input.value=output;
    form.appendChild(input); document.body.appendChild(form); form.submit(); document.body.removeChild(form);
  };

  const S = {
    card: { background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:"10px", padding:"1.25rem" },
    label: { display:"block", fontSize:"0.7rem", color:COLORS.teal, fontFamily:"monospace", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"0.4rem" },
    ta: { width:"100%", background:COLORS.bg2, border:`1px solid ${COLORS.border}`, borderRadius:"6px", color:COLORS.text, padding:"0.75rem", fontFamily:"monospace", fontSize:"0.78rem", lineHeight:1.6, resize:"vertical", outline:"none", boxSizing:"border-box" },
    btn: (v) => ({ background:v==="primary"?COLORS.accent:v==="teal"?COLORS.teal:v==="danger"?"rgba(239,68,68,0.1)":"transparent", color:v==="teal"?"#000":v==="primary"?"#fff":v==="danger"?"#EF4444":COLORS.text, border:v==="ghost"||v==="danger"?`1px solid ${v==="danger"?"rgba(239,68,68,0.3)":COLORS.border}`:"none", borderRadius:"6px", padding:"0.55rem 1.1rem", cursor:"pointer", fontSize:"0.82rem", fontWeight:600, fontFamily:"inherit", transition:"all 0.2s" }),
    input: { background:COLORS.bg2, border:`1px solid ${COLORS.border}`, borderRadius:"6px", color:COLORS.text, padding:"0.55rem 0.75rem", fontFamily:"inherit", fontSize:"0.84rem", outline:"none", width:"100%", boxSizing:"border-box" },
    error: { background:"rgba(239,68,68,0.1)", border:"1px solid rgba(239,68,68,0.3)", color:"#EF4444", borderRadius:"6px", padding:"0.75rem 1rem", fontSize:"0.82rem", marginBottom:"1rem" },
  };

  return (
    <div>
      <div style={{marginBottom:"1.5rem",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          <h1 style={{fontFamily:"Georgia,serif",fontSize:"1.6rem",fontWeight:700,letterSpacing:"-0.02em",marginBottom:"0.3rem"}}>Tailor your <span style={{color:COLORS.accent,fontStyle:"italic"}}>resume</span></h1>
          <p style={{color:COLORS.muted,fontSize:"0.88rem"}}>Three inputs → one perfectly tailored LaTeX resume in seconds.</p>
        </div>
        <div style={{display:"flex",gap:"0.75rem"}}>
          {savedResumes.length>0 && (
            <select style={{...S.input,width:"auto"}} onChange={e=>{const r=savedResumes.find(x=>x.id===e.target.value);if(r)loadResume(r);}}>
              <option value="">Load saved resume...</option>
              {savedResumes.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}
            </select>
          )}
          <button style={S.btn("ghost")} onClick={()=>setShowSaveModal(true)}>Save Resume</button>
          <button style={S.btn("ghost")} onClick={()=>setShowPrompt(!showPrompt)}>{showPrompt?"Hide":"⚙"} Prompt</button>
        </div>
      </div>

      {showPrompt && (
        <div style={{...S.card,marginBottom:"1.25rem"}}>
          <label style={S.label}>System Prompt</label>
          <textarea style={{...S.ta,height:"200px"}} value={prompt} onChange={e=>setPrompt(e.target.value)} />
          <button style={{...S.btn("ghost"),marginTop:"0.5rem",fontSize:"0.75rem"}} onClick={()=>setPrompt(DEFAULT_PROMPT)}>Reset to Default</button>
        </div>
      )}

      {showSaveModal && (
        <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200}}>
          <div style={{...S.card,width:"360px"}}>
            <label style={S.label}>Resume Library Name</label>
            <input style={{...S.input,marginBottom:"1rem"}} placeholder="e.g. TPM Version, Consulting Version..." value={saveResumeName} onChange={e=>setSaveResumeName(e.target.value)} />
            <div style={{display:"flex",gap:"0.75rem"}}>
              <button style={S.btn("primary")} onClick={saveResume}>Save</button>
              <button style={S.btn("ghost")} onClick={()=>setShowSaveModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {error && <div style={S.error}>{error}</div>}

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"1.25rem",marginBottom:"1.25rem"}}>
        <div style={S.card}>
          <label style={S.label}>① Original Resume (Plain Text)</label>
          <div style={{fontSize:"0.72rem",color:COLORS.muted,marginBottom:"0.5rem"}}>Content source — paste your full resume</div>
          <textarea style={{...S.ta,height:"400px"}} placeholder="Paste your full resume in plain text..." value={originalResume} onChange={e=>setOriginalResume(e.target.value)} />
        </div>
        <div style={S.card}>
          <label style={S.label}>② LaTeX Template</label>
          <div style={{fontSize:"0.72rem",color:COLORS.muted,marginBottom:"0.5rem"}}>Formatting structure — paste your .tex file</div>
          <textarea style={{...S.ta,height:"400px"}} placeholder="\documentclass{article}&#10;\begin{document}&#10;..." value={latexTemplate} onChange={e=>setLatexTemplate(e.target.value)} />
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:"1.25rem"}}>
          <div style={S.card}>
            <label style={S.label}>③ Job Description</label>
            <textarea style={{...S.ta,height:"240px"}} placeholder="Paste the full job description..." value={jd} onChange={e=>setJd(e.target.value)} />
          </div>
          <div style={S.card}>
            <label style={S.label}>Application Details</label>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.75rem"}}>
              <div><div style={{fontSize:"0.7rem",color:COLORS.muted,marginBottom:"0.3rem"}}>Company</div><input style={S.input} placeholder="Goldman Sachs" value={companyInput} onChange={e=>setCompanyInput(e.target.value)} /></div>
              <div><div style={{fontSize:"0.7rem",color:COLORS.muted,marginBottom:"0.3rem"}}>Role</div><input style={S.input} placeholder="TPM Intern" value={roleInput} onChange={e=>setRoleInput(e.target.value)} /></div>
            </div>
          </div>
        </div>
      </div>

      <div style={{display:"flex",gap:"0.75rem",alignItems:"center",marginBottom:"2rem"}}>
        <button style={S.btn("primary")} onClick={tailorResume} disabled={loading}>{loading?"Tailoring...":"✦ Tailor Resume"}</button>
        {loading && <span style={{color:COLORS.muted,fontSize:"0.82rem"}}>Claude is tailoring your resume...</span>}
      </div>

      {output && (
        <div style={S.card}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"1rem"}}>
            <label style={S.label}>Tailored Output — {companyInput && roleInput ? `Saarang_GR_${companyInput.replace(/\s+/g,"_")}_${roleInput.replace(/\s+/g,"_")}.tex` : "resume.tex"}</label>
            <div style={{display:"flex",gap:"0.75rem"}}>
              <button style={S.btn("ghost")} onClick={copyToClipboard}>{copied?"✓ Copied!":"Copy LaTeX"}</button>
              <button style={S.btn("teal")} onClick={downloadTex}>⬇ Download .tex</button>
              <button style={S.btn("ghost")} onClick={openOverleaf}>Open in Overleaf ↗</button>
            </div>
          </div>
          <textarea style={{...S.ta,height:"500px"}} value={output} onChange={e=>setOutput(e.target.value)} spellCheck={false} />
        </div>
      )}
    </div>
  );
}
