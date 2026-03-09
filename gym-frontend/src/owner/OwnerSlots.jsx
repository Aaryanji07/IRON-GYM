import { useEffect, useState } from "react";
import { Shell, PageHeader, Spinner, useToast, Toast, Btn, Input, Select, Empty } from "../components/ui";
import API from "../api";

const NAV=[
  {path:"/owner",label:"Dashboard",icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/></svg>},
  {path:"/owner/gym",label:"My Gym",icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="currentColor" strokeWidth="2"/></svg>},
  {path:"/owner/slots",label:"Slots",icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/><polyline points="12 6 12 12 16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>},
  {path:"/owner/bookings",label:"Bookings",icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/></svg>},
];

const TYPES=["HIIT","Strength","Yoga","CrossFit","Cardio","Pilates","Boxing","General"];
const typeEmoji={HIIT:"⚡",Strength:"💪",Yoga:"🧘",CrossFit:"🔥",Cardio:"🏃",Pilates:"🌿",Boxing:"🥊",General:"🏋️"};
const EMPTY_SLOT={name:"",time:"",duration:"60 min",trainer:"",type:"General",capacity:15,description:"",date:""};

export default function OwnerSlots() {
  const [slots, setSlots]       = useState([]);
  const [gym, setGym]           = useState(null);
  const [gymError, setGymError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(EMPTY_SLOT);
  const [saving, setSaving]     = useState(false);
  const [loading, setLoading]   = useState(true);
  const [deleting, setDeleting] = useState(null);
  const { toast, show }         = useToast();

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    setGymError("");
    try {
      // Fetch gym first
      const gymRes = await API.get("/gyms/owner/my");
      setGym(gymRes.data);

      // Only fetch slots if gym exists
      const slotsRes = await API.get("/slots/owner/my");
      setSlots(slotsRes.data);
    } catch (e) {
      const msg = e.response?.data?.message || "Failed to load";
      // 404 on gym means no gym registered yet
      if (e.response?.status === 404) {
        setGymError(msg);
        setGym(null);
      } else {
        show(msg, "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await API.post("/slots", {
        ...form,
        capacity: Number(form.capacity),
      });
      show("Slot added successfully! ✓");
      setForm(EMPTY_SLOT);
      setShowForm(false);
      fetchAll();
    } catch (e) {
      // Show the EXACT backend error so owner knows what went wrong
      show(e.response?.data?.message || "Failed to add slot", "error");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Remove this slot?")) return;
    setDeleting(id);
    try {
      await API.delete(`/slots/${id}`);
      show("Slot removed");
      // Optimistic remove from UI instantly
      setSlots(prev => prev.filter(s => s._id !== id));
    } catch (e) {
      show(e.response?.data?.message || "Error", "error");
    } finally {
      setDeleting(null);
    }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const isApproved = gym?.status === "approved";

  return (
    <Shell items={NAV}>
      <Toast toast={toast}/>
      <PageHeader
        title="Manage Slots"
        subtitle={`${slots.length} active session${slots.length !== 1 ? "s" : ""}`}
        action={
          isApproved
            ? <Btn onClick={() => setShowForm(!showForm)}>
                {showForm ? "✕ Cancel" : "+ Add Slot"}
              </Btn>
            : null
        }
      />

      {loading ? <Spinner/> : (
        <div className="fade-in">

          {/* No gym registered */}
          {!gym && (
            <div style={s.banner} data-type="error">
              ⚠️ {gymError || "No gym registered."}{" "}
              <a href="/owner/gym" style={{ color:"var(--accent)", fontWeight:600 }}>Register your gym →</a>
            </div>
          )}

          {/* Gym not approved yet */}
          {gym && !isApproved && (
            <div style={{ ...s.banner, ...(gym.status === "rejected" ? s.bannerRed : s.bannerOrange) }}>
              {gym.status === "pending"
                ? "⏳ Your gym is pending admin approval. You can add slots once approved."
                : `❌ Your gym was rejected. Reason: "${gym.rejectionReason || "No reason given"}". Update your gym details and resubmit.`}
            </div>
          )}

          {/* Add slot form */}
          {isApproved && showForm && (
            <div style={s.formCard}>
              <h3 style={s.formTitle}>New Training Slot</h3>
              <form onSubmit={submit} style={s.form}>
                <div style={s.grid2}>
                  <Input
                    label="Class Name *"
                    value={form.name}
                    onChange={e => set("name", e.target.value)}
                    placeholder="Morning HIIT"
                    required
                  />
                  <Input
                    label="Time *"
                    value={form.time}
                    onChange={e => set("time", e.target.value)}
                    placeholder="6:00 AM"
                    required
                  />
                  <Input
                    label="Duration"
                    value={form.duration}
                    onChange={e => set("duration", e.target.value)}
                    placeholder="60 min"
                  />
                  <Input
                    label="Trainer Name"
                    value={form.trainer}
                    onChange={e => set("trainer", e.target.value)}
                    placeholder="Coach Name"
                  />
                  <Select
                    label="Class Type"
                    value={form.type}
                    onChange={e => set("type", e.target.value)}
                    options={TYPES.map(t => ({ value: t, label: t }))}
                  />
                  <Input
                    label="Capacity (max people) *"
                    type="number"
                    value={form.capacity}
                    onChange={e => set("capacity", e.target.value)}
                    min="1"
                    required
                  />
                  <div style={{ gridColumn:"1/-1" }}>
                    <Input
                      label="Specific Date (optional — leave blank for recurring)"
                      type="date"
                      value={form.date}
                      onChange={e => set("date", e.target.value)}
                    />
                  </div>
                  <div style={{ gridColumn:"1/-1", display:"flex", flexDirection:"column", gap:7 }}>
                    <label style={s.lbl}>Description (optional)</label>
                    <textarea
                      value={form.description}
                      onChange={e => set("description", e.target.value)}
                      placeholder="What clients can expect in this session…"
                      style={s.ta}
                      rows={2}
                    />
                  </div>
                </div>
                <div style={{ display:"flex", gap:10, marginTop:4 }}>
                  <Btn type="submit" disabled={saving}>
                    {saving ? "Adding slot…" : "Add Slot ✓"}
                  </Btn>
                  <Btn variant="ghost" onClick={() => { setShowForm(false); setForm(EMPTY_SLOT); }}>
                    Cancel
                  </Btn>
                </div>
              </form>
            </div>
          )}

          {/* Slots list */}
          {isApproved && slots.length === 0 && !showForm && (
            <Empty
              icon="⏰"
              title="No Slots Yet"
              desc="Add your first training session so clients can start booking."
              action={<Btn onClick={() => setShowForm(true)}>+ Add First Slot</Btn>}
            />
          )}

          {slots.length > 0 && (
            <div style={s.list}>
              {slots.map(slot => {
                const pct = Math.round((slot.bookedCount / slot.capacity) * 100);
                return (
                  <div key={slot._id} style={s.card}>
                    <div style={s.cardLeft}>
                      <div style={s.emoji}>{typeEmoji[slot.type] || "🏋️"}</div>
                      <div style={{ flex:1 }}>
                        <div style={s.name}>{slot.name}</div>
                        <div style={s.meta}>
                          🕐 {slot.time} &nbsp;·&nbsp;
                          ⏳ {slot.duration} &nbsp;·&nbsp;
                          👤 {slot.trainer || "No trainer"} &nbsp;·&nbsp;
                          <span style={{ background:"var(--surface3)", padding:"2px 8px", borderRadius:10, fontSize:11 }}>{slot.type}</span>
                        </div>
                        {slot.description && <div style={s.desc}>{slot.description}</div>}
                        {slot.date && <div style={{ fontSize:11, color:"var(--accent)", marginTop:4 }}>📅 {slot.date}</div>}
                      </div>
                    </div>
                    <div style={s.cardRight}>
                      <div style={s.capWrap}>
                        <div style={s.capText}>{slot.bookedCount}/{slot.capacity} booked</div>
                        <div style={s.capBg}>
                          <div style={{
                            height:"100%", borderRadius:2,
                            width:`${pct}%`,
                            background: pct >= 90 ? "var(--red)" : pct >= 60 ? "var(--orange)" : "var(--accent)",
                            transition:"width .3s"
                          }}/>
                        </div>
                      </div>
                      <Btn
                        variant="danger"
                        small
                        disabled={deleting === slot._id}
                        onClick={() => remove(slot._id)}
                      >
                        {deleting === slot._id ? "…" : "Remove"}
                      </Btn>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}
    </Shell>
  );
}

const s = {
  banner:{ padding:"14px 20px", borderRadius:12, fontSize:14, marginBottom:24, background:"var(--orange-dim)", border:"1px solid rgba(255,165,2,.25)", color:"var(--orange)" },
  bannerOrange:{ background:"var(--orange-dim)", border:"1px solid rgba(255,165,2,.25)", color:"var(--orange)" },
  bannerRed:{ background:"var(--red-dim)", border:"1px solid rgba(255,71,87,.25)", color:"var(--red)" },
  formCard:{ background:"var(--surface)", border:"1px solid rgba(232,255,71,.2)", borderRadius:"var(--r)", padding:28, marginBottom:28 },
  formTitle:{ fontFamily:"'Bebas Neue',sans-serif", fontSize:22, letterSpacing:".5px", marginBottom:20 },
  form:{ display:"flex", flexDirection:"column", gap:16 },
  grid2:{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 },
  lbl:{ fontSize:11, fontWeight:500, color:"var(--muted)", textTransform:"uppercase", letterSpacing:".8px" },
  ta:{ background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:8, color:"var(--text)", fontSize:14, padding:"12px 14px", outline:"none", resize:"vertical", width:"100%", fontFamily:"inherit" },
  list:{ display:"flex", flexDirection:"column", gap:10 },
  card:{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:16, background:"var(--surface)", border:"1px solid var(--border)", borderRadius:"var(--r)", padding:"18px 22px" },
  cardLeft:{ display:"flex", gap:14, alignItems:"flex-start", flex:1 },
  emoji:{ width:42, height:42, background:"var(--surface2)", borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 },
  name:{ fontSize:15, fontWeight:500, marginBottom:4 },
  meta:{ fontSize:12, color:"var(--muted)", marginBottom:2 },
  desc:{ fontSize:12, color:"var(--dim)", marginTop:4 },
  cardRight:{ display:"flex", alignItems:"center", gap:16, flexShrink:0 },
  capWrap:{ display:"flex", flexDirection:"column", gap:5, minWidth:120, alignItems:"flex-end" },
  capText:{ fontSize:12, color:"var(--muted)" },
  capBg:{ height:4, background:"var(--surface3)", borderRadius:2, width:100 },
};