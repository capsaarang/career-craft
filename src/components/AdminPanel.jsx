import { useState, useEffect } from "react";
import { supabase } from "../supabase.js";
import { COLORS } from "../constants.js";

export default function AdminPanel({ session }) {
  const [users, setUsers] = useState([]);
  const [apps, setApps] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => { loadAll(); }, []);

  const loadAll = async () => {
    setLoading(true);
    const [{ data: profiles }, { data: applications }, { data: community }] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending:false }),
      supabase.from("applications").select("*, profiles(full_name,email)").order("applied_at", { ascending:false }),
      supabase.from("community_posts").select("*").order("created_at", { ascending:false }),
    ]);
    if (profiles) setUsers(profiles);
    if (applications) setApps(applications);
    if (community) setPosts(community);
    setLoading(false);
  };

  const deletePost = async (id) => {
    await supabase.from("community_posts").delete().eq("id", id);
    loadAll();
  };

  const exportAll = () => {
    const rows = [["User","Email","Company","Role","Status","Applied","Notes"],
      ...apps.map(a=>[a.profiles?.full_name||"",a.profiles?.email||"",a.company,a.role,a.status,new Date(a.applied_at).toLocaleDateString(),a.notes||""])];
    const csv = rows.map(r=>r.map(v=>`"${v}"`).join(",")).join("\n");
    const el = document.createElement("a"); el.href=URL.createObjectURL(new Blob([csv],{type:"text/csv"})); el.download="all_applications.csv"; el.click();
  };

  const statusColor = (s) => ({ "Applied":"#5B8FF9","Interviewing":"#F59E0B","Offer":"#00C9A7","Rejected":"#EF4444","Ghosted":"#6B7280" }[s]||"#5B8FF9");

  const companyCounts = apps.reduce((acc,a)=>{ acc[a.company]=(acc[a.company]||0)+1; return acc; }, {});
  const topCompanies = Object.entries(companyCounts).sort((a,b)=>b[1]-a[1]).slice(0,10);

  const S = {
    card: { background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:"10px", padding:"1.25rem" },
    label: { fontSize:"0.7rem", color:COLORS.teal, fontFamily:"monospace", textTransform:"uppercase", letterSpacing:"0.1em" },
    tab: (a) => ({ background:a?COLORS.accent:"transparent", color:a?"#fff":COLORS.muted, border:`1px solid ${a?COLORS.accent:COLORS.border}`, borderRadius:"6px", padding:"0.4rem 0.9rem", cursor:"pointer", fontSize:"0.8rem", fontWeight:a?600:400, fontFamily:"inherit" }),
  };

  const statCards = [
    { label:"Total Users", value:users.length, color:COLORS.accent },
    { label:"Total Applications", value:apps.length, color:COLORS.teal },
    { label:"Offers", value:apps.filter(a=>a.status==="Offer").length, color:"#00C9A7" },
    { label:"Community Posts", value:posts.length, color:"#8B5CF6" },
  ];

  return (
    <div>
      <div style={{marginBottom:"1.5rem",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          <h1 style={{fontFamily:"Georgia,serif",fontSize:"1.6rem",fontWeight:700,letterSpacing:"-0.02em",marginBottom:"0.3rem"}}>Admin <span style={{color:"#F59E0B",fontStyle:"italic"}}>panel</span></h1>
          <p style={{color:COLORS.muted,fontSize:"0.88rem"}}>Full visibility into all users, applications, and community activity.</p>
        </div>
        <button onClick={exportAll} style={{background:"none",border:`1px solid ${COLORS.border}`,color:COLORS.text,borderRadius:"6px",padding:"0.5rem 1rem",cursor:"pointer",fontSize:"0.82rem",fontFamily:"inherit"}}>Export All CSV ↓</button>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"0.75rem",marginBottom:"1.5rem"}}>
        {statCards.map(s=>(
          <div key={s.label} style={{...S.card,textAlign:"center",borderColor:s.color+"40"}}>
            <div style={{fontSize:"2rem",fontWeight:700,color:s.color,fontFamily:"Georgia,serif"}}>{s.value}</div>
            <div style={{fontSize:"0.72rem",color:COLORS.muted,fontFamily:"monospace",textTransform:"uppercase",letterSpacing:"0.06em",marginTop:"0.25rem"}}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{display:"flex",gap:"0.5rem",marginBottom:"1.25rem"}}>
        {["overview","users","applications","community"].map(t=>(
          <button key={t} style={S.tab(activeTab===t)} onClick={()=>setActiveTab(t)}>{t.charAt(0).toUpperCase()+t.slice(1)}</button>
        ))}
      </div>

      {loading ? <div style={{...S.card,textAlign:"center",padding:"3rem",color:COLORS.muted}}>Loading...</div> : (
        <>
          {activeTab==="overview" && (
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"1.25rem"}}>
              <div style={S.card}>
                <div style={{...S.label,display:"block",marginBottom:"1rem"}}>Top Companies Applied</div>
                {topCompanies.map(([company,count],i)=>(
                  <div key={company} style={{display:"flex",justifyContent:"space-between",padding:"0.4rem 0",borderBottom:i<topCompanies.length-1?`1px solid ${COLORS.border}20`:"none",fontSize:"0.84rem"}}>
                    <span style={{color:COLORS.text}}>{company}</span>
                    <span style={{color:COLORS.muted,fontFamily:"monospace"}}>{count}</span>
                  </div>
                ))}
              </div>
              <div style={S.card}>
                <div style={{...S.label,display:"block",marginBottom:"1rem"}}>Application Status Breakdown</div>
                {["Applied","Interviewing","Offer","Rejected","Ghosted"].map(s=>(
                  <div key={s} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0.4rem 0",borderBottom:`1px solid ${COLORS.border}20`,fontSize:"0.84rem"}}>
                    <span style={{color:statusColor(s),fontWeight:600}}>{s}</span>
                    <span style={{color:COLORS.muted,fontFamily:"monospace"}}>{apps.filter(a=>a.status===s).length}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab==="users" && (
            <div style={S.card}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:"0.84rem"}}>
                <thead><tr style={{borderBottom:`1px solid ${COLORS.border}`}}>{["Name","Email","Joined","Apps"].map(h=><th key={h} style={{padding:"0.6rem 0.75rem",textAlign:"left",color:COLORS.muted,fontWeight:500,fontSize:"0.7rem",fontFamily:"monospace",textTransform:"uppercase"}}>{h}</th>)}</tr></thead>
                <tbody>{users.map(u=>(
                  <tr key={u.id} style={{borderBottom:`1px solid ${COLORS.border}20`}}>
                    <td style={{padding:"0.7rem 0.75rem",color:COLORS.text,fontWeight:600}}>{u.full_name||"—"}</td>
                    <td style={{padding:"0.7rem 0.75rem",color:COLORS.muted}}>{u.email}</td>
                    <td style={{padding:"0.7rem 0.75rem",color:COLORS.dim,fontFamily:"monospace",fontSize:"0.75rem"}}>{u.created_at?new Date(u.created_at).toLocaleDateString():"—"}</td>
                    <td style={{padding:"0.7rem 0.75rem",color:COLORS.accent,fontWeight:600}}>{apps.filter(a=>a.user_id===u.id).length}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}

          {activeTab==="applications" && (
            <div style={S.card}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:"0.84rem"}}>
                <thead><tr style={{borderBottom:`1px solid ${COLORS.border}`}}>{["User","Company","Role","Status","Applied"].map(h=><th key={h} style={{padding:"0.6rem 0.75rem",textAlign:"left",color:COLORS.muted,fontWeight:500,fontSize:"0.7rem",fontFamily:"monospace",textTransform:"uppercase"}}>{h}</th>)}</tr></thead>
                <tbody>{apps.map(a=>(
                  <tr key={a.id} style={{borderBottom:`1px solid ${COLORS.border}20`}}>
                    <td style={{padding:"0.7rem 0.75rem",color:COLORS.muted,fontSize:"0.78rem"}}>{a.profiles?.full_name||a.profiles?.email||"—"}</td>
                    <td style={{padding:"0.7rem 0.75rem",color:COLORS.text,fontWeight:600}}>{a.company}</td>
                    <td style={{padding:"0.7rem 0.75rem",color:COLORS.muted}}>{a.role}</td>
                    <td style={{padding:"0.7rem 0.75rem"}}><span style={{color:statusColor(a.status),fontSize:"0.78rem",fontWeight:600,fontFamily:"monospace"}}>{a.status}</span></td>
                    <td style={{padding:"0.7rem 0.75rem",color:COLORS.dim,fontFamily:"monospace",fontSize:"0.75rem"}}>{new Date(a.applied_at).toLocaleDateString()}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}

          {activeTab==="community" && (
            <div style={S.card}>
              <table style={{width:"100%",borderCollapse:"collapse",fontSize:"0.84rem"}}>
                <thead><tr style={{borderBottom:`1px solid ${COLORS.border}`}}>{["Author","Category","Content","Likes","Date",""].map(h=><th key={h} style={{padding:"0.6rem 0.75rem",textAlign:"left",color:COLORS.muted,fontWeight:500,fontSize:"0.7rem",fontFamily:"monospace",textTransform:"uppercase"}}>{h}</th>)}</tr></thead>
                <tbody>{posts.map(p=>(
                  <tr key={p.id} style={{borderBottom:`1px solid ${COLORS.border}20`}}>
                    <td style={{padding:"0.7rem 0.75rem",color:COLORS.text,fontWeight:600}}>{p.author_name||"—"}</td>
                    <td style={{padding:"0.7rem 0.75rem",color:COLORS.muted,fontSize:"0.78rem"}}>{p.category}</td>
                    <td style={{padding:"0.7rem 0.75rem",color:COLORS.muted,maxWidth:"300px",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.content}</td>
                    <td style={{padding:"0.7rem 0.75rem",color:COLORS.accent}}>{p.likes||0}</td>
                    <td style={{padding:"0.7rem 0.75rem",color:COLORS.dim,fontFamily:"monospace",fontSize:"0.75rem"}}>{new Date(p.created_at).toLocaleDateString()}</td>
                    <td style={{padding:"0.7rem 0.75rem"}}><button onClick={()=>deletePost(p.id)} style={{background:"none",border:"none",color:"#EF4444",cursor:"pointer",fontSize:"0.8rem"}}>Delete</button></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}
