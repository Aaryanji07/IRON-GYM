
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Shell, Spinner, Badge, useToast, Toast, Btn, Empty } from "../components/ui";
import API from "../api";

const NAV = [
  { path:"/client",          label:"Dashboard",   icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/></svg> },
  { path:"/client/gyms",     label:"Browse Gyms", icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2"/></svg> },
  { path:"/client/bookings", label:"My Bookings", icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/></svg> },
];

const typeEmoji = { HIIT:"⚡", Strength:"💪", Yoga:"🧘", CrossFit:"🔥", Cardio:"🏃", Pilates:"🌿", Boxing:"🥊", General:"🏋️" };

export default function ClientGymDetail() {
  const { id } = useParams();
  const [gym,        setGym]        = useState(null);
  const [slots,      setSlots]      = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [slotsError, setSlotsError] = useState("");
  const [bookingSlot,       setBookingSlot]       = useState(null);
  const [bookingMembership, setBookingMembership] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const { toast, show } = useToast();

  useEffect(() => { fetchAll(); }, [id]);

  const fetchAll = async () => {
    setLoading(true);
    setSlotsError("");
    try {
      // Fetch all 3 independently — don't let one failure kill the page
      const [gymRes, slotsRes, bookingsRes] = await Promise.allSettled([
        API.get(`/gyms/${id}`),
        API.get(`/slots?gymId=${id}`),
        API.get("/bookings/my"),
      ]);

      if (gymRes.status === "fulfilled") {
        setGym(gymRes.value.data);
      } else {
        show("Could not load gym details", "error");
        setLoading(false);
        return;
      }

      if (slotsRes.status === "fulfilled") {
        setSlots(slotsRes.value.data);
      } else {
        const errMsg = slotsRes.reason?.response?.data?.message || "Could not load slots";
        setSlotsError(errMsg);
        console.error("Slots fetch failed:", errMsg);
      }

      if (bookingsRes.status === "fulfilled") {
        setMyBookings(bookingsRes.value.data);
      }
      // bookings failure is non-critical, just means we can't show "already booked" state

    } catch (e) {
      show(e.message || "Failed to load", "error");
    } finally {
      setLoading(false);
    }
  };

  // IDs of slots already booked for the selected date (non-cancelled)
  const bookedSlotIds = new Set(
    myBookings
      .filter(b => b.status !== "cancelled" && b.bookingDate === selectedDate)
      .map(b => b.slot?._id || b.slot)
      .filter(Boolean)
  );

  const hasActiveMembership = myBookings.some(
    b => (b.gym?._id === id || b.gym === id) &&
         b.bookingType === "monthly_membership" &&
         b.status === "confirmed" &&
         new Date(b.membershipEndDate) >= new Date()
  );

  const bookSlot = async (slotId) => {
    setBookingSlot(slotId);
    try {
      await API.post("/bookings", { gymId: id, slotId, bookingType: "day_pass", bookingDate: selectedDate });
      show("Day pass booked! See you at the gym 💪");
      fetchAll();
    } catch (e) {
      show(e.response?.data?.message || "Booking failed", "error");
    } finally {
      setBookingSlot(null);
    }
  };

  const bookMembership = async () => {
    setBookingMembership(true);
    try {
      await API.post("/bookings", { gymId: id, bookingType: "monthly_membership" });
      show("Monthly membership activated! 🎉");
      fetchAll();
    } catch (e) {
      show(e.response?.data?.message || "Failed", "error");
    } finally {
      setBookingMembership(false);
    }
  };

  if (loading) return <Shell items={NAV}><Spinner/></Shell>;
  if (!gym)    return <Shell items={NAV}><Empty icon="🔍" title="Gym not found" action={<Link to="/client/gyms" style={{color:"var(--accent)"}}>← Back to gyms</Link>}/></Shell>;

  return (
    <Shell items={NAV}>
      <Toast toast={toast}/>

      <div style={s.back}>
        <Link to="/client/gyms" style={s.backLink}>← Back to gyms</Link>
      </div>

      {/* Gym Hero */}
      <div style={s.hero}>
        <div style={s.heroLeft}>
          <div style={s.heroIcon}>🏢</div>
          <div>
            <h1 style={s.gymName}>{gym.name}</h1>
            <p style={s.gymCity}>📍 {gym.address}, {gym.city}</p>
            {gym.description && <p style={s.gymDesc}>{gym.description}</p>}
            <div style={s.infoRow}>
              <span style={s.infoBadge}>🕐 Weekdays: {gym.openingHours?.weekdays?.open}–{gym.openingHours?.weekdays?.close}</span>
              <span style={s.infoBadge}>📅 Weekends: {gym.openingHours?.weekends?.open}–{gym.openingHours?.weekends?.close}</span>
              {gym.phone && <span style={s.infoBadge}>📞 {gym.phone}</span>}
            </div>
            {gym.amenities?.length > 0 && (
              <div style={s.tags}>{gym.amenities.map(a => <span key={a} style={s.tag}>{a}</span>)}</div>
            )}
          </div>
        </div>

        {/* Pricing box */}
        <div style={s.pricingBox}>
          <div style={s.priceCard}>
            <div style={s.priceBig}>₹{gym.pricing?.dayPass}</div>
            <div style={s.priceLabel}>Day Pass</div>
            <p style={s.priceDesc}>Pick a slot below and book for a specific date</p>
          </div>
          <div style={{...s.priceCard, border:"1px solid rgba(232,255,71,.25)", background:"rgba(232,255,71,.04)"}}>
            <div style={s.priceBig}>₹{gym.pricing?.monthlyMembership}</div>
            <div style={s.priceLabel}>Monthly Membership</div>
            <p style={s.priceDesc}>Full access for 30 days from today</p>
            {hasActiveMembership ? (
              <div style={s.activeMember}>✓ You have an active membership</div>
            ) : (
              <Btn onClick={bookMembership} disabled={bookingMembership} style={{width:"100%", marginTop:8, justifyContent:"center"}}>
                {bookingMembership ? "Activating…" : "Get Membership →"}
              </Btn>
            )}
          </div>
        </div>
      </div>

      {/* Slots Section */}
      <div style={s.slotsSection}>
        <div style={s.slotsHeader}>
          <h2 style={s.slotsTitle}>Book a Day Pass Slot</h2>
          <div style={s.datePick}>
            <label style={s.dateLabel}>Select Date:</label>
            <input
              type="date"
              value={selectedDate}
              min={new Date().toISOString().slice(0, 10)}
              onChange={e => setSelectedDate(e.target.value)}
              style={s.dateInput}
            />
          </div>
        </div>

        {/* Slots error */}
        {slotsError && (
          <div style={s.errBanner}>
            ⚠️ Could not load slots: {slotsError}
            <button onClick={fetchAll} style={s.retryBtn}>Retry</button>
          </div>
        )}

        {/* No slots */}
        {!slotsError && slots.length === 0 && (
          <Empty icon="⏰" title="No slots available" desc="This gym hasn't added any training sessions yet. Check back later!"/>
        )}

        {/* Slot cards */}
        {slots.length > 0 && (
          <div style={s.slotGrid}>
            {slots.map(slot => {
              const full   = slot.bookedCount >= slot.capacity;
              const booked = bookedSlotIds.has(slot._id);
              const pct    = Math.min(100, Math.round((slot.bookedCount / slot.capacity) * 100));
              const spotsLeft = slot.capacity - slot.bookedCount;

              return (
                <div key={slot._id} style={{...s.slotCard, ...(booked ? s.slotBooked : {})}}>
                  <div style={s.slotTop}>
                    <span style={s.slotEmoji}>{typeEmoji[slot.type] || "🏋️"}</span>
                    <span style={s.slotType}>{slot.type}</span>
                    {booked && <span style={{marginLeft:"auto", fontSize:12, color:"var(--green)", fontWeight:600}}>✓ Booked</span>}
                    {!booked && full && <span style={{marginLeft:"auto", fontSize:12, color:"var(--red)", fontWeight:600}}>Full</span>}
                  </div>

                  <div style={s.slotName}>{slot.name}</div>

                  <div style={s.slotMeta}>
                    <span>🕐 {slot.time}</span>
                    <span>⏳ {slot.duration}</span>
                    <span>👤 {slot.trainer || "No trainer"}</span>
                  </div>

                  {slot.description && <p style={s.slotDesc}>{slot.description}</p>}

                  {/* Capacity bar */}
                  <div style={s.capRow}>
                    <span style={{fontSize:11, color: spotsLeft <= 3 ? "var(--red)" : "var(--muted)"}}>
                      {full ? "Class full" : `${spotsLeft} spot${spotsLeft !== 1 ? "s" : ""} left`}
                    </span>
                    <span style={{fontSize:11, color:"var(--dim)"}}>{pct}%</span>
                  </div>
                  <div style={s.capBg}>
                    <div style={{
                      height:"100%", borderRadius:2, transition:"width .3s",
                      width:`${pct}%`,
                      background: pct >= 90 ? "var(--red)" : pct >= 60 ? "var(--orange)" : "var(--accent)"
                    }}/>
                  </div>

                  <button
                    onClick={() => !booked && !full && bookSlot(slot._id)}
                    disabled={booked || full || bookingSlot === slot._id}
                    style={{
                      ...s.bookBtn,
                      ...(booked ? s.bookBtnBooked : {}),
                      ...(full && !booked ? s.bookBtnFull : {}),
                    }}
                  >
                    {bookingSlot === slot._id
                      ? "Booking…"
                      : booked
                      ? "✓ Already Booked"
                      : full
                      ? "Slot Full"
                      : `Book for ${new Date(selectedDate + "T00:00:00").toLocaleDateString("en-IN", { month:"short", day:"numeric" })}`}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Shell>
  );
}

const s = {
  back:{ marginBottom:20 },
  backLink:{ fontSize:13, color:"var(--muted)", fontWeight:500 },
  hero:{ display:"grid", gridTemplateColumns:"1fr 340px", gap:24, marginBottom:40, alignItems:"start" },
  heroLeft:{ display:"flex", gap:20, alignItems:"flex-start" },
  heroIcon:{ width:64, height:64, background:"var(--surface2)", borderRadius:14, display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, flexShrink:0 },
  gymName:{ fontFamily:"'Bebas Neue',sans-serif", fontSize:38, letterSpacing:1, lineHeight:1, marginBottom:6 },
  gymCity:{ fontSize:14, color:"var(--muted)", marginBottom:8 },
  gymDesc:{ fontSize:13, color:"var(--muted)", lineHeight:1.5, marginBottom:12, maxWidth:500 },
  infoRow:{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:10 },
  infoBadge:{ fontSize:12, background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:20, padding:"4px 10px", color:"var(--muted)" },
  tags:{ display:"flex", gap:6, flexWrap:"wrap" },
  tag:{ fontSize:11, background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:20, padding:"3px 10px", color:"var(--dim)" },
  pricingBox:{ display:"flex", flexDirection:"column", gap:12 },
  priceCard:{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--r)", padding:20 },
  priceBig:{ fontFamily:"'Bebas Neue',sans-serif", fontSize:36, letterSpacing:1, lineHeight:1, color:"var(--accent)", marginBottom:4 },
  priceLabel:{ fontSize:11, fontWeight:600, color:"var(--muted)", textTransform:"uppercase", letterSpacing:".8px", marginBottom:8 },
  priceDesc:{ fontSize:12, color:"var(--muted)", lineHeight:1.5, marginBottom:8 },
  activeMember:{ fontSize:13, color:"var(--green)", fontWeight:600, background:"var(--green-dim)", borderRadius:8, padding:"10px 14px", textAlign:"center", marginTop:8, border:"1px solid rgba(46,213,115,.2)" },
  slotsSection:{},
  slotsHeader:{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, flexWrap:"wrap", gap:12 },
  slotsTitle:{ fontFamily:"'Bebas Neue',sans-serif", fontSize:26, letterSpacing:".5px" },
  datePick:{ display:"flex", alignItems:"center", gap:10 },
  dateLabel:{ fontSize:12, color:"var(--muted)", fontWeight:500 },
  dateInput:{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:8, color:"var(--text)", fontSize:13, padding:"9px 14px", outline:"none", fontFamily:"inherit" },
  errBanner:{ display:"flex", alignItems:"center", gap:12, background:"var(--red-dim)", border:"1px solid rgba(255,71,87,.2)", borderRadius:10, padding:"12px 16px", fontSize:13, color:"var(--red)", marginBottom:20 },
  retryBtn:{ marginLeft:"auto", background:"none", border:"1px solid rgba(255,71,87,.3)", color:"var(--red)", borderRadius:6, padding:"5px 12px", cursor:"pointer", fontSize:12, fontFamily:"inherit" },
  slotGrid:{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))", gap:14 },
  slotCard:{ background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--r)", padding:18, display:"flex", flexDirection:"column", gap:8, transition:"border-color .2s" },
  slotBooked:{ borderColor:"rgba(46,213,115,.25)" },
  slotTop:{ display:"flex", alignItems:"center", gap:8 },
  slotEmoji:{ fontSize:20 },
  slotType:{ fontSize:11, fontWeight:600, color:"var(--muted)", textTransform:"uppercase", letterSpacing:".5px" },
  slotName:{ fontFamily:"'Bebas Neue',sans-serif", fontSize:20, letterSpacing:".3px", lineHeight:1.1 },
  slotMeta:{ display:"flex", flexWrap:"wrap", gap:10, fontSize:12, color:"var(--muted)" },
  slotDesc:{ fontSize:12, color:"var(--dim)", lineHeight:1.4 },
  capRow:{ display:"flex", justifyContent:"space-between" },
  capBg:{ height:3, background:"var(--surface3)", borderRadius:2, marginBottom:4 },
  bookBtn:{ width:"100%", padding:"11px", background:"var(--accent)", color:"var(--black)", border:"none", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit", transition:"opacity .15s", marginTop:4 },
  bookBtnBooked:{ background:"var(--green-dim)", color:"var(--green)", border:"1px solid rgba(46,213,115,.2)", cursor:"default" },
  bookBtnFull:{ background:"var(--surface2)", color:"var(--dim)", border:"1px solid var(--border)", cursor:"not-allowed" },
};