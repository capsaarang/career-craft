import { useState, useEffect } from "react";
import { supabase } from "../supabase.js";
import { COLORS } from "../constants.js";

const STATUS_COLORS = { "Applied":"#5B8FF9","Interviewing":"#F59E0B","Offer":"#00C9A7","Rejected":"#EF4444","Ghosted":"#6B7280" };

export default function Tracker({ session }) {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("Applied");
  const [notes, setNotes] = useState("");
  const [interviewDate, setInterviewDate] = useState("");

  useEffect(() => { loadApps(); }, []);

  const loadApps = async () => {
    setLoading(true);
    const { data } = await supabase.from("applications").select("*").eq("user_id", session.user.id).order("applied_at", { ascending:false });
    if (data) setApps(data);
    setLoading(false);
  };

  const addApp = async () => {
    if (!company && !role) return;
    await supabase.from("applications").insert({ user_id:session.user.id, company, role, status, notes, interview_date:interviewDate||null, applied_at:new Date().toISOString() });
    setCompany(""); setRole(""); setStatus("Applied"); setNotes(""); setInterviewDate("");
    loadApps();
  };

  const updateStatus = async (id, status) => {
    await supabase.from("applications").update({ status }).eq("id", id);
    loadApps();
  };

  const updateNotes = async (id, notes) => {
    await supabase.from("applications").update({ notes }).eq("id", id);
  };

  const deleteApp = async (id) => {
    await supabase.from("applications").delete().eq("id", id);
    loadApps();
  };

  const exportCSV = () => {
    const rows = [["Company","Role","Status","Applied","Interview Date","Notes"],
      ...apps.map(a=>[a.company,a.role,a.status,new Date(a.applied_at).toLocaleDateString(),a.interview_date||"",a.notes||""])];
    const csv = rows.map(r=>r.map(v=>`"${v}"`).join(",")).join("\n");
    const a = document.createElement("a"); a.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"})); a.download="applications.csv"; a.click();
  };

  const S = {
    card: { background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:"10px", padding:"1.25rem" },
    label: { display:"block", fontSize:"0.7rem", color:COLORS.teal, fontFamily:"monospace", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"0.4rem" },
    input: { background:COLORS.bg2, border:`1px solid ${COLORS.border}`, borderRadius:"6px", color:COLORS.text, padding:"0.55rem 0.75rem", fontFamily:"inherit", fontSize:"0.84rem", outline:"none", width:"100%", boxSizing:"border-box" },
    btn: (v) => ({ background:v==="primary"?COLORS.accent:"transparent", color:v==="primary"?"#fff":COLORS.text, border:v==="ghost"?`1px solid ${COLORS.border}`:"none", borderRadius:"6px", padding:"0.55rem 1.1rem", cursor:"pointer", fontSize:"0.82rem", fontWeight:600, fontFamily:"inherit" }),
    select: { background:COLORS.bg2, border:`1px solid ${COLORS.border}`, borderRadius:"6px", color:COLORS.text, padding:"0.55rem 0.75rem", fontFamily:"inherit", fontSize:"0.84rem", outline:"none" },
  };

  const stats = ["Applied","Interviewing","Offer","Rejected","Ghosted"].map(s=>({ label:s, count:apps.filter(a=>a.status===s).length, color:STATUS_COLORS[s] }));

  return (
    <div>
      <div style={{marginBottom:"1.5rem",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          <h1 style={{fontFamily:"Georgia,serif",fontSize:"1.6rem",fontWeight:700,letterSpacing:"-0.02em",marginBottom:"0.3rem"}}>Application <span style={{color:COLORS.teal,fontStyle:"italic"}}>tracker</span></h1>
          <p style={{color:COLORS.muted,fontSize:"0.88rem"}}>Track every application. Never lose sight of an opportunity.</p>
        </div>
        {apps.length>0 && <button style={S.btn("ghost")} onClick={exportCSV}>Export CSV ↓</button>}
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:"0.75rem",marginBottom:"1.5rem"}}>
        {stats.map(s=>(
          <div key={s.label} style={{...S.card,textAlign:"center",padding:"1rem",borderColor:s.color+"40"}}>
            <div style={{fontSize:"1.8rem",fontWeight:700,color:s.color,fontFamily:"Georgia,serif"}}>{s.count}</div>
            <div style={{fontSize:"0.68rem",color:COLORS.muted,fontFamily:"monospace",textTransform:"uppercase",letterSpacing:"0.06em",marginTop:"0.2rem"}}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{...S.card,marginBottom:"1.25rem"}}>
        <label style={S.label}>Add Application</label>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr auto",gap:"0.75rem",alignItems:"flex-end"}}>
          <div><div style={{fontSize:"0.7rem",color:COLORS.muted,marginBottom:"0.3rem"}}>Company</div><input style={S.input} placeholder="Goldman Sachs" value={company} onChange={e=>setCompany(e.target.value)} /></div>
          <div><div style={{fontSize:"0.7rem",color:COLORS.muted,marginBottom:"0.3rem"}}>Role</div><input style={S.input} placeholder="TPM Intern" value={role} onChange={e=>setRole(e.target.value)} /></div>
          <div><div style={{fontSize:"0.7rem",color:COLORS.muted,marginBottom:"0.3rem"}}>Status</div><select style={S.select} value={status} onChange={e=>setStatus(e.target.value)}>{Object.keys(STATUS_COLORS).map(s=><option key={s}>{s}</option>)}</select></div>
          <div><div style={{fontSize:"0.7rem",color:COLORS.muted,marginBottom:"0.3rem"}}>Interview Date</div><input style={S.input} type="date" value={interviewDate} onChange={e=>setInterviewDate(e.target.value)} /></div>
          <button style={S.btn("primary")} onClick={addApp}>+ Add</button>
        </div>
      </div>

      {loading ? (
        <div style={{...S.card,textAlign:"center",padding:"3rem",color:COLORS.muted}}>Loading...</div>
      ) : apps.length===0 ? (
        <div style={{...S.card,textAlign:"center",padding:"3rem",color:COLORS.muted}}>
          <div style={{fontSize:"2rem",marginBottom:"0.75rem"}}>⊞</div>
          <div>No applications yet. Add one above or tailor a resume to auto-log it.</div>
        </div>
      ) : (
        <div style={S.card}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:"0.84rem"}}>
            <thead><tr style={{borderBottom:`1px solid ${COLORS.border}`}}>{["Company","Role","Status","Applied","Interview","Notes",""].map(h=><th key={h} style={{padding:"0.6rem 0.75rem",textAlign:"left",color:COLORS.muted,fontWeight:500,fontSize:"0.7rem",fontFamily:"monospace",textTransform:"uppercase",letterSpacing:"0.06em"}}>{h}</th>)}</tr></thead>
            <tbody>
              {apps.map(app=>(
                <tr key={app.id} style={{borderBottom:`1px solid ${COLORS.border}20`}}>
                  <td style={{padding:"0.7rem 0.75rem",color:COLORS.text,fontWeight:600}}>{app.company}</td>
                  <td style={{padding:"0.7rem 0.75rem",color:COLORS.muted}}>{app.role}</td>
                  <td style={{padding:"0.7rem 0.75rem"}}>
                    <select style={{background:STATUS_COLORS[app.status]+"15",border:`1px solid ${STATUS_COLORS[app.status]}40`,color:STATUS_COLORS[app.status],borderRadius:"4px",padding:"0.2rem 0.5rem",fontSize:"0.7rem",outline:"none",fontFamily:"monospace",fontWeight:700}} value={app.status} onChange={e=>updateStatus(app.id,e.target.value)}>
                      {Object.keys(STATUS_COLORS).map(s=><option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td style={{padding:"0.7rem 0.75rem",color:COLORS.dim,fontFamily:"monospace",fontSize:"0.75rem"}}>{new Date(app.applied_at).toLocaleDateString()}</td>
                  <td style={{padding:"0.7rem 0.75rem",color:COLORS.dim,fontFamily:"monospace",fontSize:"0.75rem"}}>{app.interview_date?new Date(app.interview_date).toLocaleDateString():"—"}</td>
                  <td style={{padding:"0.7rem 0.75rem"}}><input style={{background:"transparent",border:"none",borderBottom:`1px solid ${COLORS.border}`,color:COLORS.muted,fontFamily:"inherit",fontSize:"0.78rem",outline:"none",width:"140px"}} placeholder="Add notes..." defaultValue={app.notes||""} onBlur={e=>updateNotes(app.id,e.target.value)} /></td>
                  <td style={{padding:"0.7rem 0.75rem"}}><button style={{background:"none",border:"none",color:COLORS.dim,cursor:"pointer"}} onClick={()=>deleteApp(app.id)}>✕</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
