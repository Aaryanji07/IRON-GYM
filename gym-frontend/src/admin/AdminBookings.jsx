import { useEffect, useState } from "react";
import { Shell, PageHeader, Spinner, Badge, useToast, Toast, Empty } from "../components/ui";
import API from "../api";

const NAV = [
  { path:"/admin",          label:"Dashboard",   icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/></svg> },
  { path:"/admin/gyms",     label:"Manage Gyms", icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2"/></svg> },
  { path:"/admin/users",    label:"Users",       icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/></svg> },
  { path:"/admin/bookings", label:"Bookings",    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/></svg> },
];

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter]     = useState("all");
  const [loading, setLoading]   = useState(true);
  const { toast, show }         = useToast();

  useEffect(()=>{ API.get("/bookings/admin/all").then(r=>setBookings(r.data)).catch(()=>show("Failed","error")).finally(()=>setLoading(false)); },[]);

  const shown = filter==="all" ? bookings : filter==="day_pass"||filter==="monthly_membership"
    ? bookings.filter(b=>b.bookingType===filter)
    : bookings.filter(b=>b.status===filter);

  const revenue = bookings.filter(b=>b.status!=="cancelled").reduce((s,b)=>s+(b.amount||0),0);

  return (
    <Shell items={NAV}>
      <Toast toast={toast}/>
      <PageHeader title="All Bookings" subtitle={`${bookings.length} total · ₹${revenue.toLocaleString()} revenue`}/>
      <div style={s.filters}>
        {[["all","All"],["confirmed","Confirmed"],["cancelled","Cancelled"],["day_pass","Day Pass"],["monthly_membership","Memberships"]].map(([v,l])=>(
          <button key={v} onClick={()=>setFilter(v)} style={{...s.fBtn,...(filter===v?s.fActive:{})}}>
            {l} ({v==="all"?bookings.length:v==="day_pass"||v==="monthly_membership"?bookings.filter(b=>b.bookingType===v).length:bookings.filter(b=>b.status===v).length})
          </button>
        ))}
      </div>
      {loading ? <Spinner/> : shown.length===0 ? <Empty icon="📅" title="No bookings found"/> : (
        <div style={s.list} className="fade-in">
          {shown.map(b=>(
            <div key={b._id} style={s.row}>
              <div style={s.icon}>{b.bookingType==="monthly_membership"?"💳":"🎟️"}</div>
              <div style={{flex:1}}>
                <div style={s.title}>{b.gym?.name||"Gym"}</div>
                <div style={s.meta}>Client: {b.client?.name} · {b.bookingType==="day_pass"?`Date: ${b.bookingDate}`:b.membershipStartDate?`${new Date(b.membershipStartDate).toLocaleDateString()} – ${new Date(b.membershipEndDate).toLocaleDateString()}`:""}</div>
              </div>
              <div style={s.right}>
                {b.amount>0 && <span style={{fontSize:14,fontWeight:700,color:"var(--accent)"}}>₹{b.amount}</span>}
                <Badge status={b.status}/>
                <Badge status={b.bookingType}/>
              </div>
            </div>
          ))}
        </div>
      )}
    </Shell>
  );
}

const s={
  filters:{display:"flex",gap:8,marginBottom:24,flexWrap:"wrap"},
  fBtn:{padding:"8px 18px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:20,color:"var(--muted)",fontSize:13,cursor:"pointer",fontFamily:"inherit"},
  fActive:{background:"var(--accent-dim)",border:"1px solid rgba(232,255,71,.3)",color:"var(--accent)"},
  list:{display:"flex",flexDirection:"column",gap:8},
  row:{display:"flex",alignItems:"center",gap:16,background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,padding:"16px 20px"},
  icon:{width:40,height:40,background:"var(--surface2)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0},
  title:{fontSize:14,fontWeight:500,marginBottom:3},
  meta:{fontSize:12,color:"var(--muted)"},
  right:{display:"flex",alignItems:"center",gap:10,flexShrink:0},
};