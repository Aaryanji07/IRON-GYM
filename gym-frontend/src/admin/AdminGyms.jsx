import { useEffect, useState } from "react";
import { Shell, PageHeader, Spinner, Badge, SectionTitle, useToast, Toast, Empty } from "../components/ui";
import API from "../api";

const NAV = [
  { path:"/admin",          label:"Dashboard",   icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/></svg> },
  { path:"/admin/gyms",     label:"Manage Gyms", icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2"/></svg> },
  { path:"/admin/users",    label:"Users",       icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/></svg> },
  { path:"/admin/bookings", label:"Bookings",    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/></svg> },
];

export default function AdminGyms() {
  const [gyms, setGyms]     = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const { toast, show }     = useToast();

  useEffect(() => { fetchGyms(); }, []);

  const fetchGyms = async () => {
    setLoading(true);
    try { const r = await API.get("/gyms/admin/all"); setGyms(r.data); }
    catch { show("Failed to load","error"); }
    finally { setLoading(false); }
  };

  const approve = async (id) => {
    try { await API.put(`/gyms/${id}/approve`); show("Gym approved ✓"); fetchGyms(); }
    catch (e) { show(e.response?.data?.message||"Error","error"); }
  };

  const reject = async (id) => {
    const reason = prompt("Rejection reason:") || "Does not meet requirements";
    try { await API.put(`/gyms/${id}/reject`, { reason }); show("Gym rejected"); fetchGyms(); }
    catch (e) { show(e.response?.data?.message||"Error","error"); }
  };

  const shown = filter === "all" ? gyms : gyms.filter(g => g.status === filter);

  return (
    <Shell items={NAV}>
      <Toast toast={toast}/>
      <PageHeader title="Manage Gyms" subtitle={`${gyms.length} total gyms registered`}/>

      <div style={s.filters}>
        {["all","pending","approved","rejected"].map(f => (
          <button key={f} onClick={()=>setFilter(f)} style={{...s.fBtn, ...(filter===f?s.fActive:{})}}>
            {f.charAt(0).toUpperCase()+f.slice(1)} ({f==="all"?gyms.length:gyms.filter(g=>g.status===f).length})
          </button>
        ))}
      </div>

      {loading ? <Spinner/> : shown.length === 0 ? <Empty icon="🏢" title="No gyms found" desc="No gyms match this filter"/> : (
        <div style={s.list} className="fade-in">
          {shown.map(gym => (
            <div key={gym._id} style={s.card}>
              <div style={s.cardTop}>
                <div style={s.left}>
                  <div style={s.icon}>🏢</div>
                  <div>
                    <div style={s.name}>{gym.name}</div>
                    <div style={s.meta}>{gym.city} · {gym.address}</div>
                    <div style={s.meta}>Owner: <strong style={{color:"var(--text)"}}>{gym.owner?.name}</strong> · {gym.owner?.email}</div>
                  </div>
                </div>
                <Badge status={gym.status}/>
              </div>

              <div style={s.details}>
                {gym.description && <p style={s.desc}>{gym.description}</p>}
                <div style={s.infoRow}>
                  <span style={s.infoItem}>🕐 Weekdays: {gym.openingHours?.weekdays?.open}–{gym.openingHours?.weekdays?.close}</span>
                  <span style={s.infoItem}>📅 Weekends: {gym.openingHours?.weekends?.open}–{gym.openingHours?.weekends?.close}</span>
                  <span style={s.infoItem}>🎟️ Day Pass: ₹{gym.pricing?.dayPass}</span>
                  <span style={s.infoItem}>💳 Monthly: ₹{gym.pricing?.monthlyMembership}</span>
                </div>
              </div>

              {gym.status === "rejected" && gym.rejectionReason && (
                <div style={s.rejReason}>⚠️ Rejection reason: {gym.rejectionReason}</div>
              )}

              {gym.status === "pending" && (
                <div style={s.actions}>
                  <button onClick={()=>approve(gym._id)} style={{...s.btn, background:"var(--green-dim)", color:"var(--green)", border:"1px solid rgba(46,213,115,.25)"}}>✓ Approve Gym</button>
                  <button onClick={()=>reject(gym._id)}  style={{...s.btn, background:"var(--red-dim)",   color:"var(--red)",   border:"1px solid rgba(255,71,87,.25)"}}>✕ Reject</button>
                </div>
              )}
              {gym.status === "approved" && (
                <div style={s.actions}>
                  <button onClick={()=>reject(gym._id)} style={{...s.btn, background:"var(--red-dim)", color:"var(--red)", border:"1px solid rgba(255,71,87,.25)"}}>✕ Revoke Approval</button>
                </div>
              )}
              {gym.status === "rejected" && (
                <div style={s.actions}>
                  <button onClick={()=>approve(gym._id)} style={{...s.btn, background:"var(--green-dim)", color:"var(--green)", border:"1px solid rgba(46,213,115,.25)"}}>✓ Approve Now</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Shell>
  );
}

const s = {
  filters:{display:"flex",gap:8,marginBottom:24,flexWrap:"wrap"},
  fBtn:{padding:"8px 18px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:20,color:"var(--muted)",fontSize:13,cursor:"pointer",fontFamily:"inherit"},
  fActive:{background:"var(--accent-dim)",border:"1px solid rgba(232,255,71,.3)",color:"var(--accent)"},
  list:{display:"flex",flexDirection:"column",gap:14},
  card:{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:"var(--r)",padding:24,display:"flex",flexDirection:"column",gap:16},
  cardTop:{display:"flex",justifyContent:"space-between",alignItems:"flex-start"},
  left:{display:"flex",gap:16,alignItems:"flex-start"},
  icon:{width:48,height:48,background:"var(--surface2)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0},
  name:{fontSize:17,fontWeight:600,marginBottom:4},
  meta:{fontSize:12,color:"var(--muted)",marginBottom:2},
  details:{borderTop:"1px solid var(--border)",paddingTop:14},
  desc:{fontSize:13,color:"var(--muted)",marginBottom:10,lineHeight:1.5},
  infoRow:{display:"flex",flexWrap:"wrap",gap:12},
  infoItem:{fontSize:12,color:"var(--muted)",background:"var(--surface2)",padding:"5px 12px",borderRadius:20,border:"1px solid var(--border)"},
  rejReason:{fontSize:13,color:"var(--orange)",background:"var(--orange-dim)",borderRadius:8,padding:"10px 14px",border:"1px solid rgba(255,165,2,.2)"},
  actions:{display:"flex",gap:10},
  btn:{padding:"10px 18px",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"},
};