import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Shell, PageHeader, StatCard, Spinner, SectionTitle, Badge, useToast, Toast, Btn, Empty } from "../components/ui";
import API from "../api";

const NAV = [
  { path:"/owner",          label:"Dashboard",  icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/></svg> },
  { path:"/owner/gym",      label:"My Gym",     icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2"/><polyline points="9 22 9 12 15 12 15 22" stroke="currentColor" strokeWidth="2"/></svg> },
  { path:"/owner/slots",    label:"Slots",      icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg> },
  { path:"/owner/bookings", label:"Bookings",   icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/></svg> },
];

export default function OwnerDashboard() {
  const [gym,      setGym]      = useState(null);
  const [slots,    setSlots]    = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [noGym,    setNoGym]    = useState(false);
  const { toast, show } = useToast();

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    setNoGym(false);
    try {
      // Step 1: fetch gym
      const gymRes = await API.get("/gyms/owner/my");
      const gymData = gymRes.data;
      setGym(gymData);

      // Step 2: fetch slots + bookings independently so one failure doesn't block the other
      const [slotsRes, bookingsRes] = await Promise.allSettled([
        API.get("/slots/owner/my"),
        API.get("/bookings/gym"),
      ]);

      if (slotsRes.status === "fulfilled")    setSlots(slotsRes.value.data);
      else show("Could not load slots: " + (slotsRes.reason?.response?.data?.message || "error"), "error");

      if (bookingsRes.status === "fulfilled") setBookings(bookingsRes.value.data);
      else show("Could not load bookings: " + (bookingsRes.reason?.response?.data?.message || "error"), "error");

    } catch (e) {
      if (e.response?.status === 404) {
        setNoGym(true);
        setGym(null);
      } else {
        show(e.response?.data?.message || "Failed to load dashboard", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const revenue = bookings.filter(b => b.status !== "cancelled").reduce((s, b) => s + (b.amount || 0), 0);

  return (
    <Shell items={NAV}>
      <Toast toast={toast}/>
      <PageHeader
        title="Owner Dashboard"
        subtitle={gym ? `${gym.name} · ${gym.city}` : "Set up your gym to get started"}
        action={noGym ? <Btn onClick={() => window.location.href="/owner/gym"}>+ Register Gym</Btn> : null}
      />

      {loading ? <Spinner/> : noGym ? (
        <Empty
          icon="🏢"
          title="No Gym Registered"
          desc="Register your gym first. Once admin approves it, you can add slots and accept bookings."
          action={<Btn onClick={() => window.location.href="/owner/gym"}>Register My Gym →</Btn>}
        />
      ) : (
        <div className="fade-in">

          {/* Gym status banner */}
          <div style={{
            display:"flex", alignItems:"center", gap:12, marginBottom:28,
            background:"var(--surface)", border:"1px solid var(--border)",
            borderRadius:12, padding:"14px 20px", flexWrap:"wrap"
          }}>
            <span style={{fontSize:13, color:"var(--muted)"}}>Gym Status:</span>
            <Badge status={gym.status}/>
            {gym.status === "pending"  && <span style={{fontSize:12, color:"var(--orange)"}}>⏳ Waiting for admin approval. You can add slots once approved.</span>}
            {gym.status === "rejected" && <span style={{fontSize:12, color:"var(--red)"}}>❌ Rejected: {gym.rejectionReason} — <Link to="/owner/gym" style={{color:"var(--accent)"}}>Update gym →</Link></span>}
            {gym.status === "approved" && <span style={{fontSize:12, color:"var(--green)"}}>✓ Live — clients can see and book your slots.</span>}
          </div>

          {/* Stats — slots.length is already only active slots from API */}
          <div style={s.statsGrid}>
            <StatCard emoji="📅" value={bookings.length}                                              label="Total Bookings"   delta={`${bookings.filter(b=>b.status==="confirmed").length} confirmed`}/>
            <StatCard emoji="🏋️" value={slots.length}                                                 label="Active Slots"     delta="Your training sessions"/>
            <StatCard emoji="💳" value={bookings.filter(b=>b.bookingType==="monthly_membership").length} label="Members"       delta="Monthly memberships"/>
            <StatCard emoji="₹"  value={revenue.toLocaleString()}                                     label="Revenue (₹)"     delta="All confirmed bookings"/>
          </div>

          {/* Quick actions if approved but no slots */}
          {gym.status === "approved" && slots.length === 0 && (
            <div style={s.quickAction}>
              <span style={{fontSize:22}}>⚡</span>
              <div style={{flex:1}}>
                <div style={{fontWeight:600, marginBottom:2}}>No slots added yet</div>
                <div style={{fontSize:13, color:"var(--muted)"}}>Clients can't book until you add training sessions.</div>
              </div>
              <Link to="/owner/slots" style={s.addSlotBtn}>+ Add Slots →</Link>
            </div>
          )}

          {/* Recent bookings */}
          <SectionTitle>Recent Bookings</SectionTitle>
          {bookings.length === 0 ? (
            <div style={{color:"var(--muted)", fontSize:14, padding:"16px 0"}}>
              No bookings yet. {gym.status === "approved" ? "Share your gym with clients!" : "Get your gym approved first."}
            </div>
          ) : (
            <div style={s.list}>
              {bookings.slice(0, 5).map(b => (
                <div key={b._id} style={s.row}>
                  <div style={s.rowIcon}>{b.bookingType === "monthly_membership" ? "💳" : "🎟️"}</div>
                  <div style={{flex:1}}>
                    <div style={s.rowName}>{b.client?.name}</div>
                    <div style={s.rowMeta}>{b.client?.email} · {b.bookingType === "day_pass" ? `Day Pass – ${b.bookingDate}` : "Monthly Membership"}</div>
                  </div>
                  <div style={{display:"flex", gap:8, alignItems:"center"}}>
                    {b.amount > 0 && <span style={{fontSize:13, fontWeight:700, color:"var(--accent)"}}>₹{b.amount}</span>}
                    <Badge status={b.status}/>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Shell>
  );
}

const s = {
  statsGrid:{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:36 },
  quickAction:{ display:"flex", alignItems:"center", gap:16, background:"rgba(232,255,71,.06)", border:"1px solid rgba(232,255,71,.2)", borderRadius:14, padding:"16px 20px", marginBottom:28 },
  addSlotBtn:{ padding:"10px 18px", background:"var(--accent)", color:"var(--black)", borderRadius:8, fontSize:13, fontWeight:600, textDecoration:"none", whiteSpace:"nowrap" },
  list:{ display:"flex", flexDirection:"column", gap:8 },
  row:{ display:"flex", alignItems:"center", gap:14, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:12, padding:"14px 18px" },
  rowIcon:{ width:36, height:36, background:"var(--surface2)", borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 },
  rowName:{ fontSize:14, fontWeight:500, marginBottom:2 },
  rowMeta:{ fontSize:12, color:"var(--muted)" },
};