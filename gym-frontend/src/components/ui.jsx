import { Link, useNavigate, useLocation } from "react-router-dom";

// ─────────────── LOGO ───────────────
export function Logo({ size = 36 }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
      <div style={{ width:size, height:size, background:"var(--accent)", borderRadius:"8px", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <svg width={size*0.5} height={size*0.5} viewBox="0 0 24 24" fill="none">
          <path d="M6.5 6.5h2v11h-2zM15.5 6.5h2v11h-2zM3 9.5h18v2H3zM3 12.5h18v2H3z" fill="#0a0a0a"/>
        </svg>
      </div>
      <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:size*0.62, letterSpacing:"3px", color:"var(--text)" }}>
        IRON<span style={{ color:"var(--accent)" }}>FIT</span>
      </span>
    </div>
  );
}

// ─────────────── SIDEBAR ───────────────
export function Sidebar({ items }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const user = (() => { try { return JSON.parse(localStorage.getItem("user")) || {}; } catch { return {}; } })();
  const initials = user.name ? user.name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2) : "U";

  const logout = () => { localStorage.clear(); navigate("/"); };

  const roleTag = { admin:"Administrator", gym_owner:"Gym Owner", client:"Member" }[user.role] || user.role;
  const roleColor = { admin:"var(--red)", gym_owner:"var(--blue)", client:"var(--accent)" }[user.role] || "var(--accent)";

  return (
    <aside style={ss.sb}>
      <div style={ss.top}>
        <div style={{ paddingLeft:8, marginBottom:32 }}><Logo size={34}/></div>
        <nav style={ss.nav}>
          {items.map(item => {
            const active = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path} style={{ ...ss.navItem, ...(active ? ss.navActive : {}) }}>
                <span style={{ color: active ? "var(--accent)" : "var(--muted)", display:"flex" }}>{item.icon}</span>
                <span>{item.label}</span>
                {active && <span style={ss.navDot}/>}
              </Link>
            );
          })}
        </nav>
      </div>
      <div>
        <div style={ss.roleTag}>
          <span style={{ ...ss.rolePill, background:`${roleColor}18`, color:roleColor, border:`1px solid ${roleColor}30` }}>{roleTag}</span>
        </div>
        <div style={ss.userRow}>
          <div style={{ ...ss.av, background:"var(--accent)", color:"var(--black)" }}>{initials}</div>
          <div style={{ flex:1, overflow:"hidden" }}>
            <div style={{ fontSize:13, fontWeight:500, whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user.name}</div>
            <div style={{ fontSize:11, color:"var(--muted)", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{user.email}</div>
          </div>
          <button onClick={logout} title="Logout" style={ss.logoutBtn}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><polyline points="16 17 21 12 16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>
      </div>
    </aside>
  );
}

const ss = {
  sb:{ width:240, flexShrink:0, background:"var(--surface)", borderRight:"1px solid var(--border)", display:"flex", flexDirection:"column", justifyContent:"space-between", padding:"28px 16px", position:"sticky", top:0, height:"100vh" },
  top:{ display:"flex", flexDirection:"column" },
  nav:{ display:"flex", flexDirection:"column", gap:4 },
  navItem:{ display:"flex", alignItems:"center", gap:12, padding:"11px 14px", borderRadius:10, fontSize:14, color:"var(--muted)", textDecoration:"none", position:"relative", transition:"all .15s", fontWeight:400 },
  navActive:{ background:"var(--accent-dim)", color:"var(--text)", fontWeight:500 },
  navDot:{ position:"absolute", right:12, width:6, height:6, background:"var(--accent)", borderRadius:"50%" },
  roleTag:{ marginBottom:12, paddingLeft:6 },
  rolePill:{ fontSize:11, padding:"4px 12px", borderRadius:20, fontWeight:600, letterSpacing:".3px", textTransform:"uppercase" },
  userRow:{ display:"flex", alignItems:"center", gap:10 },
  av:{ width:34, height:34, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, fontSize:13, flexShrink:0 },
  logoutBtn:{ background:"var(--surface2)", border:"1px solid var(--border)", color:"var(--muted)", borderRadius:8, padding:"7px", display:"flex", alignItems:"center", cursor:"pointer", flexShrink:0 },
};

// ─────────────── SHELL (sidebar + main) ───────────────
export function Shell({ items, children }) {
  return (
    <div style={{ display:"flex", minHeight:"100vh", background:"var(--black)" }}>
      <Sidebar items={items}/>
      <main style={{ flex:1, padding:"36px 40px", overflowY:"auto", position:"relative" }}>
        {children}
      </main>
    </div>
  );
}

// ─────────────── PAGE HEADER ───────────────
export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:32 }}>
      <div>
        <h1 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:42, letterSpacing:1, lineHeight:1, marginBottom:6 }}>{title}</h1>
        {subtitle && <p style={{ color:"var(--muted)", fontSize:13 }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ─────────────── TOAST ───────────────
export function Toast({ toast }) {
  if (!toast) return null;
  const isOk = toast.type === "success";
  return (
    <div style={{
      position:"fixed", top:20, right:20, zIndex:9999,
      padding:"14px 20px", borderRadius:10, border:"1px solid",
      fontSize:14, fontWeight:500, boxShadow:"0 8px 32px rgba(0,0,0,.5)",
      animation:"fadeUp .3s ease", maxWidth:360,
      background: isOk ? "rgba(232,255,71,.12)" : "rgba(255,71,87,.12)",
      borderColor: isOk ? "rgba(232,255,71,.3)" : "rgba(255,71,87,.3)",
      color: isOk ? "var(--accent)" : "#ff6b78",
    }}>
      {isOk ? "✓" : "✕"} {toast.msg}
    </div>
  );
}

// ─────────────── SPINNER ───────────────
export function Spinner({ size = 32 }) {
  return (
    <div style={{ display:"flex", justifyContent:"center", padding:"60px 0" }}>
      <div style={{ width:size, height:size, border:"3px solid var(--surface3)", borderTopColor:"var(--accent)", borderRadius:"50%", animation:"spin .7s linear infinite" }}/>
    </div>
  );
}

// ─────────────── STATUS BADGE ───────────────
const statusMap = {
  approved:  { color:"var(--green)",  bg:"var(--green-dim)",  label:"Approved" },
  pending:   { color:"var(--orange)", bg:"var(--orange-dim)", label:"Pending" },
  rejected:  { color:"var(--red)",    bg:"var(--red-dim)",    label:"Rejected" },
  confirmed: { color:"var(--accent)", bg:"var(--accent-dim)", label:"Confirmed" },
  cancelled: { color:"var(--red)",    bg:"var(--red-dim)",    label:"Cancelled" },
  completed: { color:"var(--green)",  bg:"var(--green-dim)",  label:"Completed" },
  day_pass:  { color:"var(--blue)",   bg:"var(--blue-dim)",   label:"Day Pass" },
  monthly_membership: { color:"var(--accent)", bg:"var(--accent-dim)", label:"Membership" },
};

export function Badge({ status }) {
  const m = statusMap[status] || { color:"var(--muted)", bg:"var(--surface2)", label:status };
  return (
    <span style={{ padding:"4px 12px", borderRadius:20, fontSize:12, fontWeight:600, color:m.color, background:m.bg, whiteSpace:"nowrap", letterSpacing:".3px" }}>
      {m.label}
    </span>
  );
}

// ─────────────── CARD ───────────────
export function Card({ children, style }) {
  return (
    <div style={{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--r)", padding:24, ...style }}>
      {children}
    </div>
  );
}

// ─────────────── STAT CARD ───────────────
export function StatCard({ emoji, value, label, delta, color }) {
  return (
    <Card>
      <div style={{ fontSize:24, marginBottom:12 }}>{emoji}</div>
      <div style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:40, lineHeight:1, letterSpacing:1, color: color || "var(--text)" }}>{value ?? "–"}</div>
      <div style={{ fontSize:11, color:"var(--muted)", textTransform:"uppercase", letterSpacing:".6px", marginTop:4, fontWeight:500 }}>{label}</div>
      {delta && <div style={{ fontSize:11, color:"var(--accent)", marginTop:6 }}>{delta}</div>}
    </Card>
  );
}

// ─────────────── BUTTON ───────────────
export function Btn({ children, onClick, variant="primary", disabled, style, type="button", small }) {
  const variants = {
    primary:  { background:"var(--accent)",   color:"var(--black)", border:"none" },
    danger:   { background:"var(--red-dim)",  color:"var(--red)",   border:"1px solid rgba(255,71,87,.25)" },
    ghost:    { background:"var(--surface2)", color:"var(--muted)", border:"1px solid var(--border)" },
    success:  { background:"var(--green-dim)",color:"var(--green)", border:"1px solid rgba(46,213,115,.25)" },
  };
  const v = variants[variant] || variants.primary;
  return (
    <button type={type} onClick={onClick} disabled={disabled} style={{
      ...v, padding: small ? "7px 14px" : "12px 20px",
      borderRadius:8, fontSize: small ? 12 : 13, fontWeight:600,
      cursor: disabled ? "not-allowed" : "pointer",
      opacity: disabled ? 0.6 : 1,
      display:"flex", alignItems:"center", gap:6, transition:"opacity .15s",
      ...style,
    }}>
      {children}
    </button>
  );
}

// ─────────────── INPUT ───────────────
export function Input({ label, ...props }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
      {label && <label style={{ fontSize:11, fontWeight:500, color:"var(--muted)", textTransform:"uppercase", letterSpacing:".8px" }}>{label}</label>}
      <input {...props} style={{
        background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:8,
        color:"var(--text)", fontSize:14, padding:"13px 14px", outline:"none",
        transition:"border-color .2s", width:"100%", ...props.style,
      }}
        onFocus={e => e.target.style.borderColor="var(--accent)"}
        onBlur={e  => e.target.style.borderColor="var(--border)"}
      />
    </div>
  );
}

// ─────────────── SELECT ───────────────
export function Select({ label, options, ...props }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
      {label && <label style={{ fontSize:11, fontWeight:500, color:"var(--muted)", textTransform:"uppercase", letterSpacing:".8px" }}>{label}</label>}
      <select {...props} style={{
        background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:8,
        color:"var(--text)", fontSize:14, padding:"13px 14px", outline:"none", width:"100%", ...props.style,
      }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

// ─────────────── EMPTY STATE ───────────────
export function Empty({ icon="📭", title, desc, action }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", padding:"80px 0", textAlign:"center", gap:12 }}>
      <div style={{ fontSize:52, marginBottom:8 }}>{icon}</div>
      <h3 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:26, letterSpacing:".5px" }}>{title}</h3>
      {desc && <p style={{ color:"var(--muted)", fontSize:14, maxWidth:320 }}>{desc}</p>}
      {action && <div style={{ marginTop:8 }}>{action}</div>}
    </div>
  );
}

// ─────────────── SECTION TITLE ───────────────
export function SectionTitle({ children, tag }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
      <h2 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:22, letterSpacing:".5px" }}>{children}</h2>
      {tag && <span style={{ fontSize:11, background:"var(--surface2)", border:"1px solid var(--border)", color:"var(--muted)", padding:"3px 10px", borderRadius:20, textTransform:"uppercase", letterSpacing:".5px" }}>{tag}</span>}
    </div>
  );
}

// ─────────────── MINI SPINNER ───────────────
export function MiniSpinner({ color }) {
  return <span style={{ width:14, height:14, border:"2px solid rgba(255,255,255,.15)", borderTopColor: color||"currentColor", borderRadius:"50%", display:"inline-block", animation:"spin .7s linear infinite" }}/>;
}

// ─────────────── USE TOAST HOOK ───────────────
import { useState } from "react";
export function useToast() {
  const [toast, setToast] = useState(null);
  const show = (msg, type="success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };
  return { toast, show };
}