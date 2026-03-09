import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api";
import { Logo } from "../components/ui";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ email:"", password:"" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const res = await API.post("/auth/login", form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user",  JSON.stringify(res.data.user));
      const role = res.data.user.role;
      if (role === "admin")                    navigate("/admin");
      else if (role === "gym_owner")           navigate("/owner");
      else /* client or user or anything else */ navigate("/client");
    } catch (e) {
      setError(e.response?.data?.message || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div style={s.page}>
      <div style={s.bg}/><div style={s.grid}/>
      <div style={s.wrap} className="fade-in">
        <Logo size={38}/>
        <div style={s.card}>
          <h1 style={s.title}>Sign In</h1>
          <p style={s.sub}>Access your dashboard</p>
          {error && <div style={s.err}>{error}</div>}
          <form onSubmit={submit} style={s.form}>
            <div style={s.field}>
              <label style={s.lbl}>Email</label>
              <input type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com" required style={s.inp} onFocus={e=>e.target.style.borderColor="var(--accent)"} onBlur={e=>e.target.style.borderColor="var(--border)"}/>
            </div>
            <div style={s.field}>
              <label style={s.lbl}>Password</label>
              <input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="••••••••" required style={s.inp} onFocus={e=>e.target.style.borderColor="var(--accent)"} onBlur={e=>e.target.style.borderColor="var(--border)"}/>
            </div>
            <button type="submit" disabled={loading} style={{...s.btn, opacity:loading?.7:1}}>
              {loading ? "Signing in…" : "Sign In →"}
            </button>
          </form>
          <div style={s.links}>
            <Link to="/register/client" style={s.link}>New client? Register</Link>
            <span style={{color:"var(--dim)"}}>·</span>
            <Link to="/register/owner" style={s.link}>Gym Owner? Register</Link>
          </div>
          <Link to="/" style={{...s.link, display:"block", textAlign:"center", marginTop:16, fontSize:12}}>← Back to home</Link>
        </div>
      </div>
    </div>
  );
}

const s = {
  page:{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--black)",padding:24,position:"relative",overflow:"hidden"},
  bg:{position:"fixed",inset:0,background:"radial-gradient(ellipse at 60% 20%, rgba(232,255,71,.04) 0%,transparent 60%)",pointerEvents:"none"},
  grid:{position:"fixed",inset:0,backgroundImage:"linear-gradient(rgba(255,255,255,.015) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.015) 1px,transparent 1px)",backgroundSize:"60px 60px",pointerEvents:"none"},
  wrap:{width:"100%",maxWidth:400,position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:28},
  card:{width:"100%",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:20,padding:40,boxShadow:"0 40px 80px rgba(0,0,0,.5)"},
  title:{fontFamily:"'Bebas Neue',sans-serif",fontSize:36,letterSpacing:1,lineHeight:1,marginBottom:6},
  sub:{color:"var(--muted)",fontSize:13,fontWeight:300,marginBottom:28},
  err:{background:"var(--red-dim)",border:"1px solid rgba(255,71,87,.2)",borderRadius:8,padding:"11px 14px",fontSize:13,color:"#ff6b78",marginBottom:20},
  form:{display:"flex",flexDirection:"column",gap:18},
  field:{display:"flex",flexDirection:"column",gap:7},
  lbl:{fontSize:11,fontWeight:500,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".8px"},
  inp:{background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:8,color:"var(--text)",fontSize:14,padding:"13px 14px",outline:"none",transition:"border-color .2s"},
  btn:{padding:"14px",background:"var(--accent)",color:"var(--black)",border:"none",borderRadius:8,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"inherit"},
  links:{display:"flex",justifyContent:"center",gap:12,marginTop:20,fontSize:13},
  link:{color:"var(--accent)",fontWeight:500},
};