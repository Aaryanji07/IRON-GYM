import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";
import { Logo } from "../components/ui";

export default function RegisterOwner() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ name:"", email:"", password:"", phone:"" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const res = await API.post("/auth/register/owner", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user",  JSON.stringify(res.data.user));
      navigate("/owner");
    } catch (e) {
      setError(e.response?.data?.message || "Registration failed. Please try again.");
    } finally { setLoading(false); }
  };

  return (
    <div style={s.page}>
      <div style={s.bg}/><div style={s.grid}/>
      <div style={s.wrap} className="fade-in">
        <Logo size={38}/>
        <div style={s.card}>
          <div style={s.roleBadge}>GYM OWNER</div>
          <h1 style={s.title}>Register as Gym Owner</h1>
          <p style={s.sub}>Submit your gym for admin approval</p>
          {error && <div style={s.err}>{error}</div>}
          <form onSubmit={submit} style={s.form}>
            <div style={s.field}>
              <label style={s.lbl}>Full Name</label>
              <input type="text" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Alex Johnson" required style={s.inp} onFocus={e=>e.target.style.borderColor="#4facfe"} onBlur={e=>e.target.style.borderColor="var(--border)"}/>
            </div>
            <div style={s.field}>
              <label style={s.lbl}>Email</label>
              <input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com" required style={s.inp} onFocus={e=>e.target.style.borderColor="#4facfe"} onBlur={e=>e.target.style.borderColor="var(--border)"}/>
            </div>
            <div style={s.field}>
              <label style={s.lbl}>Phone (optional)</label>
              <input type="tel" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="+91 99999 00000" style={s.inp} onFocus={e=>e.target.style.borderColor="#4facfe"} onBlur={e=>e.target.style.borderColor="var(--border)"}/>
            </div>
            <div style={s.field}>
              <label style={s.lbl}>Password</label>
              <input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="Min. 6 characters" required style={s.inp} onFocus={e=>e.target.style.borderColor="#4facfe"} onBlur={e=>e.target.style.borderColor="var(--border)"}/>
            </div>
            <button type="submit" disabled={loading} style={{...s.btn, opacity:loading?0.7:1}}>
              {loading ? "Creating account…" : "Register as Gym Owner →"}
            </button>
          </form>
          <p style={s.foot}>Already have an account? <Link to="/login" style={{color:"#4facfe",fontWeight:500}}>Sign In</Link></p>
          <Link to="/" style={{display:"block",textAlign:"center",marginTop:10,fontSize:12,color:"var(--muted)"}}>← Back to home</Link>
        </div>
      </div>
    </div>
  );
}

const s = {
  page:{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--black)",padding:24,position:"relative",overflow:"hidden"},
  bg:{position:"fixed",inset:0,background:"radial-gradient(ellipse at 40% 30%, rgba(79,172,254,.04) 0%,transparent 60%)",pointerEvents:"none"},
  grid:{position:"fixed",inset:0,backgroundImage:"linear-gradient(rgba(255,255,255,.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.015) 1px,transparent 1px)",backgroundSize:"60px 60px",pointerEvents:"none"},
  wrap:{width:"100%",maxWidth:420,position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:28},
  card:{width:"100%",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:20,padding:40,boxShadow:"0 40px 80px rgba(0,0,0,.5)"},
  roleBadge:{display:"inline-block",fontSize:11,fontWeight:700,padding:"4px 12px",borderRadius:20,letterSpacing:1,marginBottom:14,textTransform:"uppercase",background:"rgba(79,172,254,.12)",color:"#4facfe",border:"1px solid rgba(79,172,254,.25)"},
  title:{fontFamily:"'Bebas Neue',sans-serif",fontSize:34,letterSpacing:1,lineHeight:1,marginBottom:6},
  sub:{color:"var(--muted)",fontSize:13,fontWeight:300,marginBottom:24},
  err:{background:"var(--red-dim)",border:"1px solid rgba(255,71,87,.2)",borderRadius:8,padding:"11px 14px",fontSize:13,color:"#ff6b78",marginBottom:18},
  form:{display:"flex",flexDirection:"column",gap:16},
  field:{display:"flex",flexDirection:"column",gap:7},
  lbl:{fontSize:11,fontWeight:500,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".8px"},
  inp:{background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:8,color:"var(--text)",fontSize:14,padding:"12px 14px",outline:"none",transition:"border-color .2s"},
  btn:{padding:"14px",background:"#4facfe",color:"var(--black)",border:"none",borderRadius:8,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit",marginTop:4},
  foot:{textAlign:"center",fontSize:13,color:"var(--muted)",marginTop:20},
};