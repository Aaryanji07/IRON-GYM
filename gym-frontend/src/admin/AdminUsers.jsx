import { useEffect, useState } from "react";
import { Shell, PageHeader, Spinner, Badge, useToast, Toast, Empty } from "../components/ui";
import API from "../api";

const NAV = [
  { path:"/admin",          label:"Dashboard", icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/></svg> },
  { path:"/admin/gyms",     label:"Manage Gyms", icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2"/></svg> },
  { path:"/admin/users",    label:"Users", icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/></svg> },
  { path:"/admin/bookings", label:"Bookings", icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/></svg> },
];

const roleColor = { admin:"var(--red)", gym_owner:"var(--blue)", client:"var(--accent)" };
const roleLabel = { admin:"Admin", gym_owner:"Gym Owner", client:"Client" };

export default function AdminUsers() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter]   = useState("all");
  const { toast, show }       = useToast();

  useEffect(() => { API.get("/auth/users").then(r=>setUsers(r.data)).catch(()=>show("Failed","error")).finally(()=>setLoading(false)); }, []);

  const shown = filter === "all" ? users : users.filter(u => u.role === filter);

  return (
    <Shell items={NAV}>
      <Toast toast={toast}/>
      <PageHeader title="All Users" subtitle={`${users.length} registered users`}/>
      <div style={s.filters}>
        {["all","client","gym_owner","admin"].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{...s.fBtn,...(filter===f?s.fActive:{})}}>
            {f==="gym_owner"?"Gym Owners":f.charAt(0).toUpperCase()+f.slice(1)} ({f==="all"?users.length:users.filter(u=>u.role===f).length})
          </button>
        ))}
      </div>
      {loading ? <Spinner/> : shown.length===0 ? <Empty icon="👥" title="No users found"/> : (
        <div style={s.list} className="fade-in">
          {shown.map(u => (
            <div key={u._id} style={s.row}>
              <div style={{...s.av, background:`${roleColor[u.role]||"#888"}20`, color:roleColor[u.role]||"#888"}}>
                {u.name.charAt(0).toUpperCase()}
              </div>
              <div style={{flex:1}}>
                <div style={s.name}>{u.name}</div>
                <div style={s.meta}>{u.email}{u.phone ? ` · ${u.phone}` : ""}</div>
              </div>
              <span style={{fontSize:12,fontWeight:600,padding:"4px 12px",borderRadius:20,background:`${roleColor[u.role]||"#888"}18`,color:roleColor[u.role]||"#888",border:`1px solid ${roleColor[u.role]||"#888"}30`}}>
                {roleLabel[u.role]||u.role}
              </span>
              <div style={{fontSize:11,color:"var(--muted)"}}>
                {new Date(u.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </Shell>
  );
}

const s = {
  filters:{display:"flex",gap:8,marginBottom:24},
  fBtn:{padding:"8px 18px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:20,color:"var(--muted)",fontSize:13,cursor:"pointer",fontFamily:"inherit"},
  fActive:{background:"var(--accent-dim)",border:"1px solid rgba(232,255,71,.3)",color:"var(--accent)"},
  list:{display:"flex",flexDirection:"column",gap:8},
  row:{display:"flex",alignItems:"center",gap:16,background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,padding:"16px 20px"},
  av:{width:38,height:38,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:16,flexShrink:0},
  name:{fontSize:14,fontWeight:500,marginBottom:3},
  meta:{fontSize:12,color:"var(--muted)"},
};