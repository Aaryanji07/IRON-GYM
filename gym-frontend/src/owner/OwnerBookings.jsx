import { useEffect, useState } from "react";
import { Shell, PageHeader, Spinner, Badge, useToast, Toast, Empty } from "../components/ui";
import API from "../api";

const NAV=[
  {path:"/owner",label:"Dashboard",icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/></svg>},
  {path:"/owner/gym",label:"My Gym",icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2"/></svg>},
  {path:"/owner/slots",label:"Slots",icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>},
  {path:"/owner/bookings",label:"Bookings",icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/></svg>},
];

export default function OwnerBookings() {
  const [bookings,setBookings]=useState([]);
  const [filter,setFilter]=useState("all");
  const [loading,setLoading]=useState(true);
  const {toast,show}=useToast();

  useEffect(()=>{ API.get("/bookings/gym").then(r=>setBookings(r.data)).catch(()=>show("Failed","error")).finally(()=>setLoading(false)); },[]);

  const confirmed=bookings.filter(b=>b.status==="confirmed");
  const revenue=confirmed.reduce((s,b)=>s+(b.amount||0),0);
  const shown=filter==="all"?bookings:filter==="day_pass"||filter==="monthly_membership"?bookings.filter(b=>b.bookingType===filter):bookings.filter(b=>b.status===filter);

  return (
    <Shell items={NAV}>
      <Toast toast={toast}/>
      <PageHeader title="Gym Bookings" subtitle={`${confirmed.length} active · ₹${revenue.toLocaleString()} revenue`}/>
      <div style={s.summaryRow}>
        {[["📅",bookings.length,"Total",""],["✅",confirmed.length,"Confirmed","var(--green)"],["💳",bookings.filter(b=>b.bookingType==="monthly_membership").length,"Members","var(--accent)"],["❌",bookings.filter(b=>b.status==="cancelled").length,"Cancelled","var(--red)"]].map(([e,v,l,c])=>(
          <div key={l} style={s.pill}><span style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:26,color:c||"var(--text)"}}>{e} {v}</span><span style={{fontSize:11,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".5px"}}>{l}</span></div>
        ))}
      </div>
      <div style={s.filters}>
        {[["all","All"],["confirmed","Confirmed"],["cancelled","Cancelled"],["day_pass","Day Pass"],["monthly_membership","Members"]].map(([v,l])=>(
          <button key={v} onClick={()=>setFilter(v)} style={{...s.fBtn,...(filter===v?s.fActive:{})}}>{l}</button>
        ))}
      </div>
      {loading?<Spinner/>:shown.length===0?<Empty icon="📅" title="No bookings" desc="No bookings match this filter"/>:(
        <div style={s.list} className="fade-in">
          {shown.map(b=>(
            <div key={b._id} style={s.row}>
              <div style={s.icon}>{b.bookingType==="monthly_membership"?"💳":"🎟️"}</div>
              <div style={{flex:1}}>
                <div style={s.name}>{b.client?.name}</div>
                <div style={s.meta}>{b.client?.email}{b.client?.phone?` · ${b.client.phone}`:""}</div>
                <div style={s.meta}>{b.bookingType==="day_pass"?`Day Pass · ${b.bookingDate}${b.slot?.name?` · ${b.slot.name}`:""}`:`Monthly Membership · ${b.membershipStartDate?new Date(b.membershipStartDate).toLocaleDateString():""}–${b.membershipEndDate?new Date(b.membershipEndDate).toLocaleDateString():""}`}</div>
              </div>
              <div style={{display:"flex",gap:10,alignItems:"center",flexShrink:0}}>
                {b.amount>0&&<span style={{fontSize:14,fontWeight:700,color:"var(--accent)"}}>₹{b.amount}</span>}
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
  summaryRow:{display:"flex",gap:12,marginBottom:24},
  pill:{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,padding:"14px 20px",display:"flex",flexDirection:"column",gap:3,minWidth:100},
  filters:{display:"flex",gap:8,marginBottom:20,flexWrap:"wrap"},
  fBtn:{padding:"7px 16px",background:"var(--surface)",border:"1px solid var(--border)",borderRadius:20,color:"var(--muted)",fontSize:12,cursor:"pointer",fontFamily:"inherit"},
  fActive:{background:"var(--accent-dim)",border:"1px solid rgba(232,255,71,.3)",color:"var(--accent)"},
  list:{display:"flex",flexDirection:"column",gap:8},
  row:{display:"flex",alignItems:"center",gap:14,background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,padding:"16px 20px"},
  icon:{width:40,height:40,background:"var(--surface2)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0},
  name:{fontSize:14,fontWeight:500,marginBottom:2},
  meta:{fontSize:12,color:"var(--muted)"},
};