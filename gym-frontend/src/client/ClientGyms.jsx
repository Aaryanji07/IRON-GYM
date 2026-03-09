import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Shell, PageHeader, Spinner, Empty } from "../components/ui";
import API from "../api";

const NAV=[
  {path:"/client",label:"Dashboard",icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/></svg>},
  {path:"/client/gyms",label:"Browse Gyms",icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2"/></svg>},
  {path:"/client/bookings",label:"My Bookings",icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/></svg>},
];

export default function ClientGyms() {
  const [gyms,setGyms]=useState([]);
  const [loading,setLoading]=useState(true);
  const [search,setSearch]=useState("");

  useEffect(()=>{ API.get("/gyms").then(r=>setGyms(r.data)).finally(()=>setLoading(false)); },[]);

  const shown=gyms.filter(g=>
    g.name.toLowerCase().includes(search.toLowerCase()) ||
    g.city.toLowerCase().includes(search.toLowerCase()) ||
    g.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Shell items={NAV}>
      <PageHeader title="Browse Gyms" subtitle={`${gyms.length} approved gyms available`}/>
      <div style={s.searchRow}>
        <div style={s.searchWrap}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" style={{color:"var(--dim)",flexShrink:0}}><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/><path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search gym name or city…" style={s.searchInp}/>
        </div>
        <span style={{fontSize:13,color:"var(--muted)"}}>{shown.length} result{shown.length!==1?"s":""}</span>
      </div>
      {loading?<Spinner/>:shown.length===0?<Empty icon="🔍" title="No gyms found" desc="Try a different search or check back later"/>:(
        <div style={s.grid} className="fade-in">
          {shown.map(gym=>(
            <Link key={gym._id} to={`/client/gym/${gym._id}`} style={s.card}>
              <div style={s.cardHead}>
                <div style={s.gymIcon}>🏢</div>
                <div style={{flex:1}}>
                  <div style={s.gymName}>{gym.name}</div>
                  <div style={s.gymCity}>📍 {gym.city}</div>
                </div>
              </div>
              {gym.description&&<p style={s.desc}>{gym.description}</p>}
              <div style={s.hours}>
                <span>🕐 Weekdays: {gym.openingHours?.weekdays?.open}–{gym.openingHours?.weekdays?.close}</span>
                <span>📅 Weekends: {gym.openingHours?.weekends?.open}–{gym.openingHours?.weekends?.close}</span>
              </div>
              {gym.amenities?.length>0&&(
                <div style={s.tags}>{gym.amenities.slice(0,4).map(a=><span key={a} style={s.tag}>{a}</span>)}</div>
              )}
              <div style={s.pricing}>
                <div style={s.price}><span style={s.priceAmt}>₹{gym.pricing?.dayPass}</span><span style={s.priceLabel}>Day Pass</span></div>
                <div style={s.priceSep}/>
                <div style={s.price}><span style={s.priceAmt}>₹{gym.pricing?.monthlyMembership}</span><span style={s.priceLabel}>Monthly</span></div>
                <div style={{marginLeft:"auto",fontSize:13,color:"var(--accent)",fontWeight:600}}>View & Book →</div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Shell>
  );
}

const s={
  searchRow:{display:"flex",alignItems:"center",gap:16,marginBottom:24},
  searchWrap:{display:"flex",alignItems:"center",gap:10,background:"var(--surface)",border:"1px solid var(--border)",borderRadius:10,padding:"0 16px",flex:1,maxWidth:400},
  searchInp:{flex:1,background:"none",border:"none",outline:"none",color:"var(--text)",fontSize:14,padding:"13px 0",fontFamily:"inherit"},
  grid:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:16},
  card:{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:"var(--r)",padding:22,display:"flex",flexDirection:"column",gap:12,textDecoration:"none",color:"inherit",transition:"border-color .2s,transform .15s"},
  cardHead:{display:"flex",gap:14,alignItems:"flex-start"},
  gymIcon:{width:46,height:46,background:"var(--surface2)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,flexShrink:0},
  gymName:{fontSize:17,fontWeight:600,marginBottom:3},
  gymCity:{fontSize:12,color:"var(--muted)"},
  desc:{fontSize:13,color:"var(--muted)",lineHeight:1.5,borderTop:"1px solid var(--border)",paddingTop:10},
  hours:{display:"flex",flexDirection:"column",gap:4,fontSize:12,color:"var(--muted)"},
  tags:{display:"flex",gap:6,flexWrap:"wrap"},
  tag:{fontSize:11,background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:20,padding:"3px 10px",color:"var(--muted)"},
  pricing:{display:"flex",alignItems:"center",gap:16,borderTop:"1px solid var(--border)",paddingTop:12,marginTop:2},
  price:{display:"flex",flexDirection:"column",gap:2},
  priceAmt:{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,letterSpacing:1,color:"var(--text)"},
  priceLabel:{fontSize:10,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".5px"},
  priceSep:{width:1,height:32,background:"var(--border)"},
};