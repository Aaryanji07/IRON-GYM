import { useEffect, useState } from "react";
import { Shell, PageHeader, StatCard, Spinner, SectionTitle, Badge, useToast, Toast } from "../components/ui";
import API from "../api";

const NAV = [
  { path:"/admin",          label:"Dashboard",  icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/></svg> },
  { path:"/admin/gyms",     label:"Manage Gyms",icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2"/><polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" strokeWidth="2"/></svg> },
  { path:"/admin/users",    label:"Users",      icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/><path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="2"/><path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2"/></svg> },
  { path:"/admin/bookings", label:"Bookings",   icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/></svg> },
];

export default function AdminDashboard() {
  const [gyms, setGyms]         = useState([]);
  const [users, setUsers]       = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const { toast, show }         = useToast();

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [g, u, b] = await Promise.all([
        API.get("/gyms/admin/all"),
        API.get("/auth/users"),
        API.get("/bookings/admin/all"),
      ]);
      setGyms(g.data); setUsers(u.data); setBookings(b.data);
    } catch { show("Failed to load data","error"); }
    finally { setLoading(false); }
  };

  const approve = async (id) => {
    try { await API.put(`/gyms/${id}/approve`); show("Gym approved ✓"); fetchAll(); }
    catch (e) { show(e.response?.data?.message||"Error","error"); }
  };

  const reject = async (id) => {
    const reason = prompt("Rejection reason (optional):") || "Does not meet requirements";
    try { await API.put(`/gyms/${id}/reject`, { reason }); show("Gym rejected"); fetchAll(); }
    catch (e) { show(e.response?.data?.message||"Error","error"); }
  };

  const pending = gyms.filter(g=>g.status==="pending");
  const today   = new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric",year:"numeric"});

  return (
    <Shell items={NAV}>
      <Toast toast={toast}/>
      <PageHeader title="Admin Dashboard" subtitle={today}/>

      {loading ? <Spinner/> : (
        <div className="fade-in">
          {/* Stats */}
          <div style={s.statsGrid}>
            <StatCard emoji="🏢" value={gyms.length}                         label="Total Gyms"     delta={`${gyms.filter(g=>g.status==="approved").length} approved`}/>
            <StatCard emoji="⏳" value={pending.length}                      label="Pending Review" delta="Awaiting approval" color={pending.length>0?"var(--orange)":undefined}/>
            <StatCard emoji="👥" value={users.length}                        label="Total Users"    delta={`${users.filter(u=>u.role==="client").length} clients`}/>
            <StatCard emoji="📅" value={bookings.length}                     label="Total Bookings" delta={`${bookings.filter(b=>b.status==="confirmed").length} active`}/>
          </div>

          {/* Pending gym approvals */}
          {pending.length > 0 && (
            <section style={s.section}>
              <SectionTitle tag={`${pending.length} pending`}>⚠️ Gyms Awaiting Approval</SectionTitle>
              <div style={s.list}>
                {pending.map(gym => (
                  <div key={gym._id} style={s.row}>
                    <div style={s.rowLeft}>
                      <div style={s.gymIcon}>🏢</div>
                      <div>
                        <div style={s.rowTitle}>{gym.name}</div>
                        <div style={s.rowMeta}>{gym.city} · {gym.address}</div>
                        <div style={s.rowMeta}>Owner: {gym.owner?.name} · {gym.owner?.email}</div>
                      </div>
                    </div>
                    <div style={s.rowActions}>
                      <Badge status="pending"/>
                      <button onClick={()=>approve(gym._id)} style={{...s.actBtn, background:"var(--green-dim)", color:"var(--green)", border:"1px solid rgba(46,213,115,.25)"}}>✓ Approve</button>
                      <button onClick={()=>reject(gym._id)}  style={{...s.actBtn, background:"var(--red-dim)",   color:"var(--red)",   border:"1px solid rgba(255,71,87,.25)"}}>✕ Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Recent bookings */}
          <section style={s.section}>
            <SectionTitle tag="last 5">Recent Bookings</SectionTitle>
            <div style={s.list}>
              {bookings.slice(0,5).map(b => (
                <div key={b._id} style={s.row}>
                  <div style={s.rowLeft}>
                    <div style={s.gymIcon}>{b.bookingType==="monthly_membership"?"💳":"🎟️"}</div>
                    <div>
                      <div style={s.rowTitle}>{b.gym?.name || "Gym"}</div>
                      <div style={s.rowMeta}>Client: {b.client?.name} · {b.bookingType==="day_pass"?"Day Pass":"Monthly"}</div>
                    </div>
                  </div>
                  <div style={s.rowActions}><Badge status={b.status}/><Badge status={b.bookingType}/></div>
                </div>
              ))}
              {bookings.length === 0 && <div style={{color:"var(--muted)",padding:"20px 0",fontSize:14}}>No bookings yet</div>}
            </div>
          </section>
        </div>
      )}
    </Shell>
  );
}

const s = {
  statsGrid:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:36},
  section:{marginBottom:36},
  list:{display:"flex",flexDirection:"column",gap:10},
  row:{display:"flex",alignItems:"center",justifyContent:"space-between",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:"var(--r)",padding:"18px 22px",gap:16},
  rowLeft:{display:"flex",alignItems:"center",gap:16,flex:1,overflow:"hidden"},
  gymIcon:{width:42,height:42,background:"var(--surface2)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0},
  rowTitle:{fontSize:15,fontWeight:500,marginBottom:3},
  rowMeta:{fontSize:12,color:"var(--muted)"},
  rowActions:{display:"flex",alignItems:"center",gap:10,flexShrink:0},
  actBtn:{padding:"8px 16px",borderRadius:8,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"},
};