import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Shell, PageHeader, StatCard, Spinner, SectionTitle, Badge, useToast, Toast, Btn, Empty } from "../components/ui";
import API from "../api";

const NAV=[
  {path:"/client",label:"Dashboard",icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/></svg>},
  {path:"/client/gyms",label:"Browse Gyms",icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2"/></svg>},
  {path:"/client/bookings",label:"My Bookings",icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/></svg>},
];

export default function ClientDashboard() {
  const [bookings,setBookings]=useState([]);
  const [gyms,setGyms]=useState([]);
  const [loading,setLoading]=useState(true);
  const {toast,show}=useToast();
  const user=()=>{try{return JSON.parse(localStorage.getItem("user"))||{};}catch{return{};}};

  useEffect(()=>{ fetchAll(); },[]);
  const fetchAll=async()=>{
    setLoading(true);
    try{
      const [b,g]=await Promise.all([API.get("/bookings/my"),API.get("/gyms")]);
      setBookings(b.data); setGyms(g.data);
    }catch{show("Failed to load","error");}
    finally{setLoading(false);}
  };

  const active=bookings.filter(b=>b.status==="confirmed");
  const memberships=active.filter(b=>b.bookingType==="monthly_membership");
  const today=new Date().toLocaleDateString("en-US",{weekday:"long",month:"long",day:"numeric"});

  return (
    <Shell items={NAV}>
      <Toast toast={toast}/>
      <PageHeader
        title={`Hey, ${user().name?.split(" ")[0] || "there"} 👋`}
        subtitle={today}
        action={<Link to="/client/gyms" style={{display:"flex",alignItems:"center",gap:8,padding:"12px 20px",background:"var(--accent)",color:"var(--black)",borderRadius:8,fontSize:13,fontWeight:600,textDecoration:"none"}}>🔍 Browse Gyms</Link>}
      />
      {loading?<Spinner/>:(
        <div className="fade-in">
          <div style={s.statsGrid}>
            <StatCard emoji="🎟️" value={active.length}       label="Active Bookings"    delta="Confirmed sessions"/>
            <StatCard emoji="💳" value={memberships.length}  label="Memberships"        delta="Active monthly plans"/>
            <StatCard emoji="🏢" value={gyms.length}         label="Available Gyms"     delta="Approved near you"/>
            <StatCard emoji="📅" value={bookings.length}     label="Total Bookings"     delta="All time"/>
          </div>

          {/* Active memberships banner */}
          {memberships.length>0&&(
            <div style={s.memberBanner}>
              <span style={{fontSize:22}}>💳</span>
              <div>
                <div style={{fontWeight:600,marginBottom:2}}>Active Membership{memberships.length>1?"s":""}</div>
                <div style={{fontSize:13,color:"var(--muted)"}}>{memberships.map(m=>m.gym?.name).join(", ")} · Valid till {memberships[0].membershipEndDate?new Date(memberships[0].membershipEndDate).toLocaleDateString():"—"}</div>
              </div>
              <Link to="/client/bookings" style={{marginLeft:"auto",fontSize:13,color:"var(--accent)",fontWeight:500}}>View →</Link>
            </div>
          )}

          {/* Recent bookings */}
          <section style={{marginBottom:36}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,letterSpacing:".5px"}}>Recent Bookings</h2>
              <Link to="/client/bookings" style={{fontSize:13,color:"var(--accent)",fontWeight:500}}>View all →</Link>
            </div>
            {active.length===0?(
              <div style={s.emptyCard}>
                <p style={{color:"var(--muted)",fontSize:14}}>No active bookings. <Link to="/client/gyms" style={{color:"var(--accent)"}}>Browse gyms →</Link></p>
              </div>
            ):(
              <div style={s.list}>
                {active.slice(0,4).map(b=>(
                  <div key={b._id} style={s.row}>
                    <div style={s.rowIcon}>{b.bookingType==="monthly_membership"?"💳":"🎟️"}</div>
                    <div style={{flex:1}}>
                      <div style={s.rowName}>{b.gym?.name}</div>
                      <div style={s.rowMeta}>{b.gym?.city} · {b.bookingType==="day_pass"?`Day Pass – ${b.bookingDate}${b.slot?.name?` · ${b.slot.name}`:""}`:b.membershipEndDate?`Membership till ${new Date(b.membershipEndDate).toLocaleDateString()}`:"Monthly"}</div>
                    </div>
                    <Badge status={b.status}/>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Recommended gyms */}
          <section>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
              <h2 style={{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,letterSpacing:".5px"}}>Gyms Near You</h2>
              <Link to="/client/gyms" style={{fontSize:13,color:"var(--accent)",fontWeight:500}}>See all →</Link>
            </div>
            <div style={s.gymGrid}>
              {gyms.slice(0,3).map(gym=>(
                <Link key={gym._id} to={`/client/gym/${gym._id}`} style={s.gymCard}>
                  <div style={s.gymTop}>
                    <span style={{fontSize:28}}>🏢</span>
                    <div style={{flex:1}}>
                      <div style={{fontSize:15,fontWeight:600}}>{gym.name}</div>
                      <div style={{fontSize:12,color:"var(--muted)"}}>{gym.city}</div>
                    </div>
                  </div>
                  <div style={s.gymPrices}>
                    <span style={s.priceTag}>🎟️ ₹{gym.pricing?.dayPass}/day</span>
                    <span style={s.priceTag}>💳 ₹{gym.pricing?.monthlyMembership}/month</span>
                  </div>
                  <div style={s.viewBtn}>View & Book →</div>
                </Link>
              ))}
            </div>
          </section>
        </div>
      )}
    </Shell>
  );
}

const s={
  statsGrid:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:32},
  memberBanner:{display:"flex",alignItems:"center",gap:16,background:"rgba(232,255,71,.06)",border:"1px solid rgba(232,255,71,.2)",borderRadius:14,padding:"16px 20px",marginBottom:28},
  emptyCard:{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:14,padding:"24px",textAlign:"center"},
  list:{display:"flex",flexDirection:"column",gap:8},
  row:{display:"flex",alignItems:"center",gap:14,background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,padding:"14px 18px"},
  rowIcon:{width:38,height:38,background:"var(--surface2)",borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0},
  rowName:{fontSize:14,fontWeight:500,marginBottom:2},
  rowMeta:{fontSize:12,color:"var(--muted)"},
  gymGrid:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14},
  gymCard:{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:"var(--r)",padding:20,display:"flex",flexDirection:"column",gap:12,textDecoration:"none",color:"inherit",transition:"border-color .2s,transform .15s"},
  gymTop:{display:"flex",gap:12,alignItems:"flex-start"},
  gymPrices:{display:"flex",gap:8,flexWrap:"wrap"},
  priceTag:{fontSize:12,background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:20,padding:"4px 10px",color:"var(--muted)"},
  viewBtn:{fontSize:12,color:"var(--accent)",fontWeight:600,marginTop:4},
};