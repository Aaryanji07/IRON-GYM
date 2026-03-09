import { useEffect, useState } from "react";
import { Shell, PageHeader, Spinner, Badge, useToast, Toast, Btn, Input } from "../components/ui";
import API from "../api";

const NAV = [
  { path:"/owner",          label:"Dashboard", icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/></svg> },
  { path:"/owner/gym",      label:"My Gym",    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2"/></svg> },
  { path:"/owner/slots",    label:"Slots",     icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> },
  { path:"/owner/bookings", label:"Bookings",  icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/></svg> },
];

export default function OwnerGym() {
  const [gym, setGym]       = useState(null);
  const [mode, setMode]     = useState("view"); // view | edit | create
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const { toast, show }       = useToast();

  const EMPTY = { name:"", address:"", city:"", phone:"", description:"", openingHours:{ weekdays:{open:"06:00",close:"22:00"}, weekends:{open:"07:00",close:"20:00"} }, pricing:{ dayPass:0, monthlyMembership:0 }, amenities:"" };
  const [form, setForm] = useState(EMPTY);

  useEffect(()=>{ fetchGym(); },[]);

  const fetchGym = async () => {
    setLoading(true);
    try {
      const r = await API.get("/gyms/owner/my");
      setGym(r.data);
      setForm({ ...r.data, amenities: (r.data.amenities||[]).join(", ") });
      setMode("view");
    } catch { setMode("create"); }
    finally { setLoading(false); }
  };

  const save = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, amenities: form.amenities.split(",").map(a=>a.trim()).filter(Boolean) };
      if (mode==="create") { await API.post("/gyms", payload); show("Gym submitted for approval! ⏳"); }
      else                 { await API.put("/gyms/owner/my", payload); show("Gym updated ✓"); }
      fetchGym();
    } catch (e) { show(e.response?.data?.message||"Save failed","error"); }
    finally { setSaving(false); }
  };

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));
  const setNested = (top, mid, val) => setForm(f => ({ ...f, [top]: { ...f[top], [mid]: { ...f[top]?.[mid], ...val } } }));

  if (loading) return <Shell items={NAV}><Spinner/></Shell>;

  return (
    <Shell items={NAV}>
      <Toast toast={toast}/>
      <PageHeader
        title={mode==="create" ? "Register Your Gym" : "My Gym"}
        subtitle={mode==="create" ? "Fill in details and submit for admin approval" : `Status: ${gym?.status}`}
        action={mode==="view" && <Btn onClick={()=>setMode("edit")}>✏️ Edit Details</Btn>}
      />

      {mode==="view" && gym && (
        <div className="fade-in">
          <div style={s.statusBar}>
            <span style={{color:"var(--muted)",fontSize:13}}>Approval Status</span>
            <Badge status={gym.status}/>
            {gym.status==="pending"  && <span style={{fontSize:12,color:"var(--orange)"}}>Admin will review your gym shortly.</span>}
            {gym.status==="rejected" && <span style={{fontSize:12,color:"var(--red)"}}>Reason: {gym.rejectionReason}</span>}
            {gym.status==="approved" && <span style={{fontSize:12,color:"var(--green)"}}>Your gym is live and visible to clients!</span>}
          </div>
          <div style={s.viewGrid}>
            {[
              {label:"Gym Name",   val:gym.name},
              {label:"Address",    val:gym.address},
              {label:"City",       val:gym.city},
              {label:"Phone",      val:gym.phone||"—"},
              {label:"Day Pass",   val:`₹${gym.pricing?.dayPass}`},
              {label:"Monthly",    val:`₹${gym.pricing?.monthlyMembership}`},
              {label:"Weekdays",   val:`${gym.openingHours?.weekdays?.open} – ${gym.openingHours?.weekdays?.close}`},
              {label:"Weekends",   val:`${gym.openingHours?.weekends?.open} – ${gym.openingHours?.weekends?.close}`},
            ].map(item=>(
              <div key={item.label} style={s.viewItem}>
                <div style={s.viewLabel}>{item.label}</div>
                <div style={s.viewVal}>{item.val}</div>
              </div>
            ))}
            {gym.description && <div style={{...s.viewItem, gridColumn:"1/-1"}}><div style={s.viewLabel}>Description</div><div style={s.viewVal}>{gym.description}</div></div>}
            {gym.amenities?.length>0 && <div style={{...s.viewItem, gridColumn:"1/-1"}}><div style={s.viewLabel}>Amenities</div><div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:6}}>{gym.amenities.map(a=><span key={a} style={s.tag}>{a}</span>)}</div></div>}
          </div>
        </div>
      )}

      {(mode==="edit"||mode==="create") && (
        <form onSubmit={save} style={s.form} className="fade-in">
          <div style={s.grid2}>
            <Input label="Gym Name *"   value={form.name}    onChange={e=>set("name",e.target.value)}    placeholder="IronFit Downtown" required/>
            <Input label="City *"       value={form.city}    onChange={e=>set("city",e.target.value)}    placeholder="Mumbai" required/>
            <Input label="Address *"    value={form.address} onChange={e=>set("address",e.target.value)} placeholder="123 Main Street" required style={{gridColumn:"1/-1"}}/>
            <Input label="Phone"        value={form.phone}   onChange={e=>set("phone",e.target.value)}   placeholder="+91 99999 00000"/>
            <div style={{gridColumn:"1/-1",display:"flex",flexDirection:"column",gap:7}}>
              <label style={s.lbl}>Description</label>
              <textarea value={form.description} onChange={e=>set("description",e.target.value)} placeholder="Tell clients about your gym…" style={{...s.ta}} rows={3}/>
            </div>
          </div>
          <div style={s.section}>
            <div style={s.sectionLabel}>Opening Hours</div>
            <div style={s.grid4}>
              <Input label="Weekday Open"  type="time" value={form.openingHours?.weekdays?.open}  onChange={e=>setNested("openingHours","weekdays",{open:e.target.value})}/>
              <Input label="Weekday Close" type="time" value={form.openingHours?.weekdays?.close} onChange={e=>setNested("openingHours","weekdays",{close:e.target.value})}/>
              <Input label="Weekend Open"  type="time" value={form.openingHours?.weekends?.open}  onChange={e=>setNested("openingHours","weekends",{open:e.target.value})}/>
              <Input label="Weekend Close" type="time" value={form.openingHours?.weekends?.close} onChange={e=>setNested("openingHours","weekends",{close:e.target.value})}/>
            </div>
          </div>
          <div style={s.section}>
            <div style={s.sectionLabel}>Pricing (₹)</div>
            <div style={s.grid2}>
              <Input label="Day Pass Price"       type="number" value={form.pricing?.dayPass}           onChange={e=>setForm(f=>({...f,pricing:{...f.pricing,dayPass:+e.target.value}}))} placeholder="299" min="0"/>
              <Input label="Monthly Membership"   type="number" value={form.pricing?.monthlyMembership} onChange={e=>setForm(f=>({...f,pricing:{...f.pricing,monthlyMembership:+e.target.value}}))} placeholder="2499" min="0"/>
            </div>
          </div>
          <Input label="Amenities (comma separated)" value={form.amenities} onChange={e=>set("amenities",e.target.value)} placeholder="Parking, Showers, WiFi, Lockers"/>
          <div style={{display:"flex",gap:12,marginTop:8}}>
            <Btn type="submit" disabled={saving}>{saving?"Saving…":mode==="create"?"Submit for Approval →":"Save Changes"}</Btn>
            {mode==="edit" && <Btn variant="ghost" onClick={()=>{ setMode("view"); setForm({...gym,amenities:(gym.amenities||[]).join(", ")}); }}>Cancel</Btn>}
          </div>
        </form>
      )}
    </Shell>
  );
}

const s = {
  statusBar:{display:"flex",alignItems:"center",gap:12,background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,padding:"14px 20px",marginBottom:28,flexWrap:"wrap"},
  viewGrid:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16},
  viewItem:{background:"var(--surface)",border:"1px solid var(--border)",borderRadius:12,padding:18},
  viewLabel:{fontSize:11,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".7px",marginBottom:6},
  viewVal:{fontSize:15,fontWeight:500},
  tag:{fontSize:12,background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:20,padding:"4px 12px",color:"var(--muted)"},
  form:{display:"flex",flexDirection:"column",gap:20,maxWidth:720},
  grid2:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16},
  grid4:{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16},
  section:{display:"flex",flexDirection:"column",gap:14},
  sectionLabel:{fontSize:12,fontWeight:600,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".8px",paddingBottom:4,borderBottom:"1px solid var(--border)"},
  lbl:{fontSize:11,fontWeight:500,color:"var(--muted)",textTransform:"uppercase",letterSpacing:".8px"},
  ta:{background:"var(--surface2)",border:"1px solid var(--border)",borderRadius:8,color:"var(--text)",fontSize:14,padding:"13px 14px",outline:"none",resize:"vertical",width:"100%"},
};