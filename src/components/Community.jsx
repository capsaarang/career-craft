import { useState, useEffect } from "react";
import { supabase } from "../supabase.js";
import { COLORS } from "../constants.js";

export default function Community({ session }) {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("tip");
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState({ topCompanies:[], totalApps:0, offers:0 });

  useEffect(() => { loadPosts(); loadInsights(); }, []);

  const loadPosts = async () => {
    setLoading(true);
    const { data } = await supabase.from("community_posts").select("*, profiles(full_name)").order("created_at", { ascending:false }).limit(50);
    if (data) setPosts(data);
    setLoading(false);
  };

  const loadInsights = async () => {
    const { data: apps } = await supabase.from("applications").select("company, status");
    if (apps) {
      const total = apps.length;
      const offers = apps.filter(a=>a.status==="Offer").length;
      const companyCounts = {};
      apps.forEach(a=>{ companyCounts[a.company]=(companyCounts[a.company]||0)+1; });
      const topCompanies = Object.entries(companyCounts).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([company,count])=>({company,count}));
      setInsights({ topCompanies, totalApps:total, offers });
    }
  };

  const addPost = async () => {
    if (!content.trim()) return;
    const userName = session.user.user_metadata?.full_name || session.user.email.split("@")[0];
    await supabase.from("community_posts").insert({ user_id:session.user.id, content, category, author_name:userName });
    setContent("");
    loadPosts();
  };

  const likePost = async (post) => {
    const likes = (post.likes||0) + 1;
    await supabase.from("community_posts").update({ likes }).eq("id", post.id);
    loadPosts();
  };

  const categoryColor = (c) => ({ tip:"#5B8FF9", win:"#00C9A7", question:"#F59E0B", resource:"#8B5CF6" }[c]||"#5B8FF9");
  const categoryLabel = (c) => ({ tip:"💡 Tip", win:"🎉 Win", question:"❓ Question", resource:"📚 Resource" }[c]||c);

  const S = {
    card: { background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:"10px", padding:"1.25rem" },
    label: { display:"block", fontSize:"0.7rem", color:COLORS.teal, fontFamily:"monospace", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"0.4rem" },
    ta: { width:"100%", background:COLORS.bg2, border:`1px solid ${COLORS.border}`, borderRadius:"6px", color:COLORS.text, padding:"0.75rem", fontFamily:"inherit", fontSize:"0.88rem", lineHeight:1.6, resize:"vertical", outline:"none", boxSizing:"border-box" },
    btn: (v) => ({ background:v==="primary"?COLORS.accent:"transparent", color:v==="primary"?"#fff":COLORS.text, border:v==="ghost"?`1px solid ${COLORS.border}`:"none", borderRadius:"6px", padding:"0.55rem 1.1rem", cursor:"pointer", fontSize:"0.82rem", fontWeight:600, fontFamily:"inherit" }),
    select: { background:COLORS.bg2, border:`1px solid ${COLORS.border}`, borderRadius:"6px", color:COLORS.text, padding:"0.55rem 0.75rem", fontFamily:"inherit", fontSize:"0.84rem", outline:"none" },
    postCard: { background:COLORS.card, border:`1px solid ${COLORS.border}`, borderRadius:"10px", padding:"1.1rem", marginBottom:"0.75rem", transition:"border-color 0.2s" },
    catBadge: (c) => ({ background:categoryColor(c)+"15", border:`1px solid ${categoryColor(c)}40`, color:categoryColor(c), padding:"0.12rem 0.5rem", borderRadius:"4px", fontSize:"0.68rem", fontFamily:"monospace", fontWeight:700 }),
  };

  return (
    <div style={{display:"grid",gridTemplateColumns:"1fr 320px",gap:"1.5rem"}}>
      <div>
        <div style={{marginBottom:"1.5rem"}}>
          <h1 style={{fontFamily:"Georgia,serif",fontSize:"1.6rem",fontWeight:700,letterSpacing:"-0.02em",marginBottom:"0.3rem"}}>Community <span style={{color:COLORS.teal,fontStyle:"italic"}}>feed</span></h1>
          <p style={{color:COLORS.muted,fontSize:"0.88rem"}}>Share tips, celebrate wins, ask questions. Help each other land the job.</p>
        </div>

        <div style={{...S.card,marginBottom:"1.5rem"}}>
          <label style={S.label}>Share with the community</label>
          <textarea style={{...S.ta,height:"100px",marginBottom:"0.75rem"}} placeholder="Share a tip, celebrate a win, ask a question..." value={content} onChange={e=>setContent(e.target.value)} />
          <div style={{display:"flex",gap:"0.75rem",alignItems:"center"}}>
            <select style={S.select} value={category} onChange={e=>setCategory(e.target.value)}>
              <option value="tip">💡 Tip</option>
              <option value="win">🎉 Win</option>
              <option value="question">❓ Question</option>
              <option value="resource">📚 Resource</option>
            </select>
            <button style={S.btn("primary")} onClick={addPost}>Post</button>
          </div>
        </div>

        {loading ? (
          <div style={{...S.card,textAlign:"center",padding:"3rem",color:COLORS.muted}}>Loading community posts...</div>
        ) : posts.length===0 ? (
          <div style={{...S.card,textAlign:"center",padding:"3rem",color:COLORS.muted}}>
            <div style={{fontSize:"2rem",marginBottom:"0.75rem"}}>❋</div>
            <div>Be the first to post! Share a tip or celebrate a win.</div>
          </div>
        ) : posts.map(post=>(
          <div key={post.id} style={S.postCard}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"0.6rem"}}>
              <div style={{display:"flex",alignItems:"center",gap:"0.6rem"}}>
                <div style={{width:"28px",height:"28px",borderRadius:"50%",background:`linear-gradient(135deg,${COLORS.accent},${COLORS.teal})`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"0.75rem",fontWeight:700,color:"#fff"}}>{(post.author_name||"U")[0].toUpperCase()}</div>
                <span style={{fontSize:"0.82rem",fontWeight:600,color:COLORS.text}}>{post.author_name||"Anonymous"}</span>
                <span style={{fontSize:"0.72rem",color:COLORS.dim}}>{new Date(post.created_at).toLocaleDateString()}</span>
              </div>
              <span style={S.catBadge(post.category)}>{categoryLabel(post.category)}</span>
            </div>
            <div style={{fontSize:"0.88rem",color:COLORS.text,lineHeight:1.65,marginBottom:"0.75rem"}}>{post.content}</div>
            <button onClick={()=>likePost(post)} style={{background:"none",border:`1px solid ${COLORS.border}`,color:COLORS.muted,borderRadius:"20px",padding:"0.2rem 0.65rem",cursor:"pointer",fontSize:"0.75rem",fontFamily:"inherit"}}>
              👍 {post.likes||0}
            </button>
          </div>
        ))}
      </div>

      <div>
        <div style={{...S.card,marginBottom:"1rem"}}>
          <label style={S.label}>Community Insights</label>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0.75rem",marginBottom:"1rem"}}>
            <div style={{background:COLORS.bg2,borderRadius:"8px",padding:"0.85rem",textAlign:"center"}}>
              <div style={{fontSize:"1.5rem",fontWeight:700,color:COLORS.accent,fontFamily:"Georgia,serif"}}>{insights.totalApps}</div>
              <div style={{fontSize:"0.68rem",color:COLORS.muted,marginTop:"0.2rem"}}>Total Applications</div>
            </div>
            <div style={{background:COLORS.bg2,borderRadius:"8px",padding:"0.85rem",textAlign:"center"}}>
              <div style={{fontSize:"1.5rem",fontWeight:700,color:COLORS.teal,fontFamily:"Georgia,serif"}}>{insights.offers}</div>
              <div style={{fontSize:"0.68rem",color:COLORS.muted,marginTop:"0.2rem"}}>Offers Received</div>
            </div>
          </div>
          {insights.topCompanies.length>0 && (
            <div>
              <div style={{fontSize:"0.7rem",color:COLORS.muted,fontFamily:"monospace",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:"0.6rem"}}>Most Applied Companies</div>
              {insights.topCompanies.map((c,i)=>(
                <div key={c.company} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"0.4rem 0",borderBottom:i<insights.topCompanies.length-1?`1px solid ${COLORS.border}20`:"none"}}>
                  <span style={{fontSize:"0.82rem",color:COLORS.text}}>{c.company}</span>
                  <span style={{fontSize:"0.72rem",color:COLORS.muted,fontFamily:"monospace"}}>{c.count} apps</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={S.card}>
          <label style={S.label}>Quick Tips</label>
          {[
            "Tailor every resume — generic resumes get ignored",
            "Apply within 48hrs of a job posting — early applicants get more callbacks",
            "Mirror exact keywords from the JD in your resume",
            "One rejection = one step closer to the right offer",
            "Follow up after applying — 80% of people don't",
          ].map((tip,i)=>(
            <div key={i} style={{display:"flex",gap:"0.6rem",padding:"0.5rem 0",borderBottom:i<4?`1px solid ${COLORS.border}20`:"none",fontSize:"0.8rem",color:COLORS.muted,lineHeight:1.5}}>
              <span style={{color:COLORS.teal,flexShrink:0}}>✦</span>{tip}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
