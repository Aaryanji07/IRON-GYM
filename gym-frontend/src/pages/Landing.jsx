import { Link } from "react-router-dom";
import { Logo } from "../components/ui";

export default function Landing() {
  return (
    <div style={s.page}>
      <div style={s.bg1}/><div style={s.bg2}/><div style={s.grid}/>
      <div style={s.wrap} className="fade-in">
        <Logo size={44}/>
        <div style={s.hero}>
          <h1 style={s.h1}>YOUR GYM.<br/><span style={{color:"var(--accent)"}}>YOUR RULES.</span></h1>
          <p style={s.sub}>Book slots, manage gyms, track everything — all in one place.</p>
        </div>
        <div style={s.cards}>
          <div style={s.card}>
            <div style={s.cardIcon}>🏃</div>
            <h3 style={s.cardTitle}>I'm a Client</h3>
            <p style={s.cardDesc}>Search gyms, book day passes or monthly memberships</p>
            <Link to="/register/client" style={s.cardBtnPrimary}>Get Started →</Link>
            <Link to="/login" style={s.cardBtnGhost}>Sign In</Link>
          </div>
          <div style={{...s.card, borderColor:"rgba(79,172,254,.2)"}}>
            <div style={s.cardIcon}>🏋️</div>
            <h3 style={s.cardTitle}>I'm a Gym Owner</h3>
            <p style={s.cardDesc}>Register your gym, add slots, and manage bookings</p>
            <Link to="/register/owner" style={{...s.cardBtnPrimary, background:"var(--blue-dim)", color:"var(--blue)", border:"1px solid rgba(79,172,254,.3)"}}>Register Gym →</Link>
            <Link to="/login" style={s.cardBtnGhost}>Sign In</Link>
          </div>
          <div style={{...s.card, borderColor:"rgba(255,71,87,.2)"}}>
            <div style={s.cardIcon}>⚡</div>
            <h3 style={s.cardTitle}>Admin</h3>
            <p style={s.cardDesc}>Approve gyms, manage users, view platform analytics</p>
            <Link to="/login" style={{...s.cardBtnPrimary, background:"var(--red-dim)", color:"var(--red)", border:"1px solid rgba(255,71,87,.3)"}}>Admin Login →</Link>
          </div>
        </div>
        <p style={s.legal}>© 2025 IronFit Platform</p>
      </div>
    </div>
  );
}

const s = {
  page:{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--black)",padding:24,position:"relative",overflow:"hidden"},
  bg1:{position:"fixed",top:-200,right:-200,width:700,height:700,background:"radial-gradient(circle,rgba(232,255,71,.05) 0%,transparent 70%)",pointerEvents:"none"},
  bg2:{position:"fixed",bottom:-300,left:-200,width:800,height:800,background:"radial-gradient(circle,rgba(79,172,254,.04) 0%,transparent 70%)",pointerEvents:"none"},
  grid:{position:"fixed",inset:0,backgroundImage:"linear-gradient(rgba(255,255,255,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.02) 1px,transparent 1px)",backgroundSize:"60px 60px",pointerEvents:"none"},
  wrap:{width:"100%",maxWidth:900,position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:40},
  hero:{textAlign:"center"},
  h1:{fontFamily:"'Bebas Neue',sans-serif",fontSize:"clamp(48px,8vw,88px)",letterSpacing:2,lineHeight:.95,marginBottom:16},
  sub:{color:"var(--muted)",fontSize:16,fontWeight:300,maxWidth:480,margin:"0 auto"},
  cards:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,width:"100%"},
  card:{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:20,padding:28,display:"flex",flexDirection:"column",gap:14,transition:"transform .2s,border-color .2s"},
  cardIcon:{fontSize:36},
  cardTitle:{fontFamily:"'Bebas Neue',sans-serif",fontSize:24,letterSpacing:1},
  cardDesc:{color:"var(--muted)",fontSize:13,lineHeight:1.5,flex:1},
  cardBtnPrimary:{display:"block",textAlign:"center",padding:"12px",background:"var(--accent)",color:"var(--black)",borderRadius:8,fontSize:13,fontWeight:600,border:"none"},
  cardBtnGhost:{display:"block",textAlign:"center",padding:"10px",background:"var(--surface2)",color:"var(--muted)",borderRadius:8,fontSize:13,border:"1px solid var(--border)"},
  legal:{fontSize:11,color:"var(--dim)"},
};