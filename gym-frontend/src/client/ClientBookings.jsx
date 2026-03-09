import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Shell, PageHeader, Spinner, Badge, useToast, Toast, Empty } from "../components/ui";
import API from "../api";

const NAV=[
  {path:"/client",label:"Dashboard",icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/></svg>},
  {path:"/client/gyms",label:"Browse Gyms",icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2"/></svg>},
  {path:"/client/bookings",label:"My Bookings",icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/></svg>},
];

export default function ClientBookings() {
  const [bookings,setBookings]=useState([]);
  const [filter,setFilter]=useState("all");
  const [loading,setLoading]=useState(true);
  const [cancelling,setCancelling]=useState(null);
  const {toast,show}=useToast();

  useEffect(()=>{ fetchBookings(); },[]);

  const fetchBookings=async()=>{
    setLoading(true);
    try{ const r=await API.get("/bookings/my"); setBookings(r.data); }
    catch{ show("Failed to load","error"); }
    finally{ setLoading(false); }
  };

  const cancel=async(id)=>{
    if(!confirm("Cancel this booking?")) return;
    setCancelling(id);
    try{
      await API.delete(`/bookings/${id}/cancel`);
      setBookings(prev=>prev.map(b=>b._id===id?{...b,status:"cancelled"}:b));
      show("Booking cancelled");
    }catch(e){ show(e.response?.data?.message||"Failed","error"); }
    finally{ setCancelling(null); }
  };

  const shown=bookings.filter(b=>{
    if(filter==="all") return true;
    if(filter==="upcoming") return b.status==="confirmed";
    if(filter==="day_pass"||filter==="monthly_membership") return b.bookingType===filter;
    return b.status===filter;
  });

  const confirmed=bookings.filter(b=>b.status==="confirmed");
  const memberships=confirmed.filter(b=>b.bookingType==="monthly_membership");
  const totalSpent=bookings.filter(b=>b.status!=="cancelled").reduce((s,b)=>s+(b.amount||0),0);

  return (
    <Shell items={NAV}>
      <Toast toast={toast}/>
      <PageHeader
        title="My Bookings"
        subtitle="All your gym sessions in one place"
        action={<Link to="/client/gyms" style={{display:"flex",alignItems:"center",gap:8,padding:"11px 18px",background:"var(--accent)",color:"var(--black)",borderRadius:8,fontSize:13,fontWeight:600,textDecoration:"none"}}>+ New Booking</Link>}
      />

      {/* Summary */}
      <div style={s.summary}>
        {[["🎟️",confirmed.length,"Active",""],["💳",memberships.length,"Memberships","var(--accent)"],["📅",bookings.length,"Total",""],["₹",`${totalSpent.toLocaleString()}`,"Spent","var(--green)"]].map(([e,v,l,c])=>(
          <div key={l} style={s.pill}>
            <span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,color:c||"var(--text)"}}>{e} {v}</span>
            <span style={{fontSize:11,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".5px"}}>{l}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={s.filters}>
        {[["all","All"],["upcoming","Active"],["cancelled","Cancelled"],["day_pass","Day Passes"],["monthly_membership","Memberships"]].map(([v,l])=>(
          <button key={v} onClick={()=>setFilter(v)} style={{...s.fBtn,...(filter===v?s.fActive:{})}}>{l} ({v==="all"?bookings.length:v==="upcoming"?bookings.filter(b=>b.status==="confirmed").length:v==="day_pass"||v==="monthly_membership"?bookings.filter(b=>b.bookingType===v).length:bookings.filter(b=>b.status===v).length})</button>
        ))}
      </div>

      {loading?<Spinner/>:shown.length===0?<Empty icon="📅" title="No bookings" desc={filter==="all"?"Book your first session!":"No bookings match this filter."} action={<Link to="/client/gyms" style={{padding:"11px 20px",background:"var(--accent)",color:"var(--black)",borderRadius:8,fontSize:13,fontWeight:600,textDecoration:"none"}}>Browse Gyms</Link>}/>:(
        <div style={s.list} className="fade-in">
          {shown.map(b=>(
            <div key={b._id} style={{...s.card,...(b.status==="cancelled"?s.cardCancelled:{})}}>
              <div style={s.cardIcon}>{b.bookingType==="monthly_membership"?"💳":"🎟️"}</div>
              <div style={{flex:1}}>
                <div style={s.cardName}>{b.gym?.name||"Gym"}</div>
                <div style={s.cardMeta}>
                  📍 {b.gym?.city}
                  {b.bookingType==="day_pass"&&<> · 🗓️ {b.bookingDate}{b.slot?.name&&<> · {b.slot.name}</>}</>}
                  {b.bookingType==="monthly_membership"&&b.membershipEndDate&&<> · Valid till {new Date(b.membershipEndDate).toLocaleDateString()}</>}
                </div>
              </div>
              <div style={s.cardRight}>
                {b.amount>0&&<span style={{fontSize:14,fontWeight:700,color:"var(--accent)"}}>₹{b.amount}</span>}
                <Badge status={b.bookingType}/>
                <Badge status={b.status}/>
                {b.status==="confirmed"&&(
                  <button onClick={()=>cancel(b._id)} disabled={cancelling===b._id} style={s.cancelBtn}>
                    {cancelling===b._id?"…":"✕"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Shell>
  );
}

const s={
  summary:{display:"flex",gap:12,marginBottom:24,flexWrap:"wrap"},
  pill:{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,padding:"14px 20px",display:"flex",flexDirection:"column",gap:3,minWidth:100},
  filters:{display:"flex",gap:8,marginBottom:22,flexWrap:"wrap"},
  fBtn:{padding:"7px 16px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:20,color:"var(--muted)",fontSize:12,cursor:"pointer",fontFamily:"inherit"},
  fActive:{background:"var(--accent-dim)",border:"1px solid rgba(232,255,71,.3)",color:"var(--accent)"},
  list:{display:"flex",flexDirection:"column",gap:8},
  card:{display:"flex",alignItems:"center",gap:14,background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,padding:"16px 20px",transition:"border-color .2s"},
  cardCancelled:{opacity:.55},
  cardIcon:{width:40,height:40,background:"var(--surface2)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0},
  cardName:{fontSize:14,fontWeight:500,marginBottom:3},
  cardMeta:{fontSize:12,color:"var(--muted)"},
  cardRight:{display:"flex",alignItems:"center",gap:10,flexShrink:0},
  cancelBtn:{padding:"6px 12px",background:"var(--red-dim)",border:"1px solid rgba(255,71,87,.2)",color:"var(--red)",borderRadius:7,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"},
};