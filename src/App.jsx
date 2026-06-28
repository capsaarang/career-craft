import { useState, useEffect } from "react";
import Auth from "./components/Auth.jsx";
import Dashboard from "./components/Dashboard.jsx";
import { supabase } from "./supabase.js";

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#080C18", display:"flex", alignItems:"center", justifyContent:"center", color:"#EEF2FF", fontFamily:"Georgia,serif", fontSize:"1.2rem" }}>
      Loading CareerCraft...
    </div>
  );

  return session ? <Dashboard session={session} /> : <Auth />;
}
