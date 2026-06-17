import React, { useState, useRef, useMemo } from "react";

// ---------------------------------------------------------------------------
// PawMatch — a Tinder-style pet-sitter discovery prototype
//
// Flow: Landing → Simple registration → Swipe deck of sitters → Matches list
// Everything lives in memory (no backend yet) so it works as a clickable demo.
// Comments throughout explain *why*, since this is meant to be a learning base.
// ---------------------------------------------------------------------------

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');
`;

// Demo sitter data. In a real app this comes from your backend / database.
const SITTERS = [
  {
    id: 1,
    name: "Marta",
    age: 27,
    distanceKm: 1.2,
    rate: "45 zł/h",
    bio: "Grew up with three dogs and a very judgmental cat. I work from home so your pet gets company all day, not just a quick visit.",
    badges: ["🐾 Dog-friendly", "🐱 Cat-friendly", "🏠 Has yard"],
    experience: "4 yrs experience",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=800&fit=crop",
  },
  {
    id: 2,
    name: "Jakub",
    age: 34,
    distanceKm: 3.8,
    rate: "35 zł/h",
    bio: "Vet tech on weekends, so I'm comfortable with medication schedules, older pets, and anything anxious or reactive.",
    badges: ["💊 Meds OK", "🦴 Senior pets", "🚗 Can pick up"],
    experience: "Vet tech background",
    photo: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=600&h=800&fit=crop",
  },
  {
    id: 3,
    name: "Ola",
    age: 22,
    distanceKm: 0.6,
    rate: "30 zł/h",
    bio: "Student with a flexible schedule and a small apartment that somehow always has room for one more foster. Big on daily walk photos.",
    badges: ["🐕 Small dogs", "📸 Daily updates", "🚶 Long walks"],
    experience: "2 yrs experience",
    photo: "https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?w=600&h=800&fit=crop",
  },
  {
    id: 4,
    name: "Tomasz",
    age: 41,
    distanceKm: 5.1,
    rate: "50 zł/h",
    bio: "Run a small home boarding setup with a fenced garden. Comfortable with multiple pets from the same household at once.",
    badges: ["🏡 Fenced yard", "👨‍👩‍👧 Multi-pet OK", "🐰 Small animals"],
    experience: "6 yrs experience",
    photo: "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=600&h=800&fit=crop",
  },
  {
    id: 5,
    name: "Nina",
    age: 29,
    distanceKm: 2.4,
    rate: "40 zł/h",
    bio: "Former shelter volunteer. Patient with nervous or newly-adopted animals, and happy to do short check-in visits if that's all you need.",
    badges: ["🤝 Patient w/ nervous pets", "⏱️ Short visits OK", "🐾 Dog-friendly"],
    experience: "3 yrs experience",
    photo: "https://images.unsplash.com/photo-1607923432848-2772a107a3da?w=600&h=800&fit=crop",
  },
];

const COLORS = {
  bg: "#FFF8F0",
  ink: "#2B2420",
  inkSoft: "#6B5F54",
  coral: "#FF6B4A",
  coralDark: "#E5573A",
  sage: "#5B8C7B",
  sageDark: "#46715F",
  tan: "#E8DFD3",
  card: "#FFFFFF",
};

function PawIcon({ size = 22, color = "white" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <ellipse cx="12" cy="16" rx="6" ry="5" />
      <ellipse cx="5.2" cy="9" rx="2.4" ry="3" />
      <ellipse cx="18.8" cy="9" rx="2.4" ry="3" />
      <ellipse cx="8.8" cy="4.8" rx="2.1" ry="2.7" />
      <ellipse cx="15.2" cy="4.8" rx="2.1" ry="2.7" />
    </svg>
  );
}

function CloudIcon({ size = 22, color = "white" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.5 18a4.5 4.5 0 0 1-.4-9A5.5 5.5 0 0 1 16.8 7.2 4 4 0 0 1 17 18H6.5z" />
    </svg>
  );
}

export default function PawMatch() {
  const [screen, setScreen] = useState("landing"); // landing -> register -> swipe -> matches
  const [form, setForm] = useState({ name: "", email: "", petName: "", petType: "Dog" });
  const [formError, setFormError] = useState("");
  const [deckIndex, setDeckIndex] = useState(0);
  const [matches, setMatches] = useState([]);
  const [lastAction, setLastAction] = useState(null); // for the little toast feedback

  const remaining = useMemo(() => SITTERS.slice(deckIndex), [deckIndex]);

  function handleRegister(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setFormError("Name and email are both needed so sitters know who they're talking to.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) {
      setFormError("That email doesn't look quite right — double check it.");
      return;
    }
    setFormError("");
    setScreen("swipe");
  }

  function decide(liked) {
    const current = remaining[0];
    if (!current) return;
    if (liked) {
      setMatches((m) => [...m, current]);
      setLastAction({ type: "like", name: current.name });
    } else {
      setLastAction({ type: "pass", name: current.name });
    }
    setDeckIndex((i) => i + 1);
    setTimeout(() => setLastAction(null), 1100);
  }

  return (
    <div style={styles.app}>
      <style>{FONTS}</style>
      {screen === "landing" && <Landing onStart={() => setScreen("register")} />}
      {screen === "register" && (
        <Register
          form={form}
          setForm={setForm}
          error={formError}
          onSubmit={handleRegister}
          onBack={() => setScreen("landing")}
        />
      )}
      {screen === "swipe" && (
        <SwipeDeck
          sitters={remaining}
          ownerName={form.name}
          matchesCount={matches.length}
          lastAction={lastAction}
          onDecide={decide}
          onViewMatches={() => setScreen("matches")}
        />
      )}
      {screen === "matches" && (
        <Matches
          matches={matches}
          onBack={() => setScreen("swipe")}
          onRestart={() => {
            setDeckIndex(0);
            setMatches([]);
            setScreen("swipe");
          }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Landing
// ---------------------------------------------------------------------------
function Landing({ onStart }) {
  return (
    <div style={styles.centerCol}>
      <div style={{ ...styles.brandRow, marginBottom: 18 }}>
        <PawIcon size={30} color={COLORS.coral} />
        <span style={styles.brandWord}>PawMatch</span>
      </div>
      <h1 style={styles.heroHeadline}>
        Find the sitter<br />your pet would pick.
      </h1>
      <p style={styles.heroSub}>
        Swipe through real local sitters, see who's actually cat-friendly or
        good with anxious dogs, and match with someone you trust — not just
        someone available.
      </p>
      <button style={styles.primaryBtn} onClick={onStart}>
        Get started
      </button>
      <div style={styles.heroFootnote}>Free for owners · No payment info needed to browse</div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Registration — intentionally one short screen, not a wizard
// ---------------------------------------------------------------------------
function Register({ form, setForm, error, onSubmit, onBack }) {
  return (
    <div style={styles.centerCol}>
      <button style={styles.backLink} onClick={onBack}>← Back</button>
      <div style={styles.regCard}>
        <h2 style={styles.regTitle}>Tell us a little about you</h2>
        <p style={styles.regSub}>Just enough to start matching — you can add more later.</p>

        <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Field label="Your name">
            <input
              style={styles.input}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Aleksandra"
              autoComplete="name"
            />
          </Field>
          <Field label="Email">
            <input
              style={styles.input}
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="you@example.com"
              autoComplete="email"
            />
          </Field>
          <Field label="Pet's name">
            <input
              style={styles.input}
              value={form.petName}
              onChange={(e) => setForm({ ...form, petName: e.target.value })}
              placeholder="Burek"
              autoComplete="off"
            />
          </Field>
          <Field label="Pet type">
            <select
              style={styles.input}
              value={form.petType}
              onChange={(e) => setForm({ ...form, petType: e.target.value })}
            >
              <option>Dog</option>
              <option>Cat</option>
              <option>Small animal</option>
              <option>Bird</option>
              <option>Other</option>
            </select>
          </Field>

          {error && <div style={styles.errorText}>{error}</div>}

          <button type="submit" style={{ ...styles.primaryBtn, width: "100%", marginTop: 6 }}>
            Start matching
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span style={styles.fieldLabel}>{label}</span>
      {children}
    </label>
  );
}

// ---------------------------------------------------------------------------
// Swipe deck
// ---------------------------------------------------------------------------
function SwipeDeck({ sitters, ownerName, matchesCount, lastAction, onDecide, onViewMatches }) {
  const top = sitters[0];
  const next = sitters[1];

  // Drag-to-swipe state, kept simple: track horizontal offset of the top card.
  const [dragX, setDragX] = useState(0);
  const draggingRef = useRef(false);
  const startXRef = useRef(0);

  function onPointerDown(e) {
    draggingRef.current = true;
    startXRef.current = (e.touches ? e.touches[0].clientX : e.clientX);
  }
  function onPointerMove(e) {
    if (!draggingRef.current) return;
    const x = (e.touches ? e.touches[0].clientX : e.clientX);
    setDragX(x - startXRef.current);
  }
  function onPointerUp() {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (dragX > 90) {
      onDecide(true);
    } else if (dragX < -90) {
      onDecide(false);
    }
    setDragX(0);
  }

  return (
    <div style={styles.swipeScreen}>
      <div style={styles.topBar}>
        <div style={styles.brandRow}>
          <PawIcon size={22} color={COLORS.coral} />
          <span style={{ ...styles.brandWord, fontSize: 18 }}>PawMatch</span>
        </div>
        <button style={styles.matchesPill} onClick={onViewMatches}>
          🐾 {matchesCount} match{matchesCount === 1 ? "" : "es"}
        </button>
      </div>

      <p style={styles.swipeHint}>
        {ownerName ? `Hi ${ownerName.split(" ")[0]}, here's who's nearby` : "Sitters near you"}
      </p>

      <div style={styles.deckArea}>
        {!top && <EmptyDeck onViewMatches={onViewMatches} matchesCount={matchesCount} />}

        {top && (
          <>
            {next && <SitterCard sitter={next} style={{ transform: "scale(0.96) translateY(10px)", opacity: 0.7 }} />}
            <SitterCard
              sitter={top}
              draggable
              dragX={dragX}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
            />
          </>
        )}

        {lastAction && (
          <div style={{ ...styles.toast, background: lastAction.type === "like" ? COLORS.coral : COLORS.sage }}>
            {lastAction.type === "like" ? `🐾 Liked ${lastAction.name}` : `Passed on ${lastAction.name}`}
          </div>
        )}
      </div>

      {top && (
        <div style={styles.actionRow}>
          <button
            style={{ ...styles.actionBtn, background: COLORS.tan }}
            onClick={() => onDecide(false)}
            aria-label="Pass"
          >
            <CloudIcon color={COLORS.inkSoft} />
          </button>
          <button
            style={{ ...styles.actionBtn, background: COLORS.coral }}
            onClick={() => onDecide(true)}
            aria-label="Like"
          >
            <PawIcon />
          </button>
        </div>
      )}
    </div>
  );
}

function SitterCard({ sitter, style, draggable, dragX = 0, onPointerDown, onPointerMove, onPointerUp }) {
  const rotation = draggable ? dragX / 18 : 0;
  const likeOpacity = draggable ? Math.max(0, Math.min(1, dragX / 100)) : 0;
  const passOpacity = draggable ? Math.max(0, Math.min(1, -dragX / 100)) : 0;

  return (
    <div
      style={{
        ...styles.card,
        ...style,
        transform: draggable
          ? `translateX(${dragX}px) rotate(${rotation}deg)`
          : style?.transform,
        cursor: draggable ? "grab" : "default",
      }}
      onMouseDown={draggable ? onPointerDown : undefined}
      onMouseMove={draggable ? onPointerMove : undefined}
      onMouseUp={draggable ? onPointerUp : undefined}
      onMouseLeave={draggable ? onPointerUp : undefined}
      onTouchStart={draggable ? onPointerDown : undefined}
      onTouchMove={draggable ? onPointerMove : undefined}
      onTouchEnd={draggable ? onPointerUp : undefined}
    >
      <div style={{ ...styles.cardStamp, ...styles.likeStamp, opacity: likeOpacity }}>LIKE</div>
      <div style={{ ...styles.cardStamp, ...styles.passStamp, opacity: passOpacity }}>PASS</div>

      <img src={sitter.photo} alt={sitter.name} style={styles.cardImg} draggable={false} />
      <div style={styles.cardGradient} />
      <div style={styles.cardInfo}>
        <div style={styles.cardNameRow}>
          <span style={styles.cardName}>{sitter.name}, {sitter.age}</span>
          <span style={styles.cardRate}>{sitter.rate}</span>
        </div>
        <div style={styles.cardMeta}>{sitter.distanceKm} km away · {sitter.experience}</div>
        <p style={styles.cardBio}>{sitter.bio}</p>
        <div style={styles.badgeRow}>
          {sitter.badges.map((b) => (
            <span key={b} style={styles.badge}>{b}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

function EmptyDeck({ onViewMatches, matchesCount }) {
  return (
    <div style={styles.emptyState}>
      <PawIcon size={40} color={COLORS.tan} />
      <h3 style={{ ...styles.regTitle, marginTop: 14 }}>That's everyone nearby</h3>
      <p style={styles.heroFootnote}>
        {matchesCount > 0
          ? "Check your matches and reach out to start planning."
          : "No matches yet — try widening your distance once that's a real feature."}
      </p>
      {matchesCount > 0 && (
        <button style={{ ...styles.primaryBtn, marginTop: 16 }} onClick={onViewMatches}>
          View matches
        </button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Matches
// ---------------------------------------------------------------------------
function Matches({ matches, onBack, onRestart }) {
  return (
    <div style={styles.swipeScreen}>
      <div style={styles.topBar}>
        <button style={styles.backLink} onClick={onBack}>← Back to swiping</button>
      </div>
      <h2 style={{ ...styles.regTitle, padding: "0 20px" }}>Your matches</h2>

      {matches.length === 0 ? (
        <div style={styles.emptyState}>
          <PawIcon size={40} color={COLORS.tan} />
          <p style={{ ...styles.heroFootnote, marginTop: 12 }}>No matches yet — go like a few sitters first.</p>
          <button style={{ ...styles.primaryBtn, marginTop: 16 }} onClick={onBack}>
            Keep swiping
          </button>
        </div>
      ) : (
        <div style={styles.matchList}>
          {matches.map((m) => (
            <div key={m.id} style={styles.matchRow}>
              <img src={m.photo} alt={m.name} style={styles.matchAvatar} />
              <div style={{ flex: 1 }}>
                <div style={styles.matchName}>{m.name}</div>
                <div style={styles.cardMeta}>{m.distanceKm} km away · {m.rate}</div>
              </div>
              <button style={styles.messageBtn}>Message</button>
            </div>
          ))}
          <button style={{ ...styles.primaryBtn, margin: "20px" }} onClick={onRestart}>
            Start a fresh deck
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Styles — plain JS objects so this stays a single self-contained file.
// ---------------------------------------------------------------------------
const styles = {
  app: {
    fontFamily: "'Inter', system-ui, sans-serif",
    background: COLORS.bg,
    color: COLORS.ink,
    minHeight: 580,
    width: "100%",
    maxWidth: 420,
    margin: "0 auto",
    borderRadius: 24,
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(43,36,32,0.08)",
    position: "relative",
  },
  centerCol: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    textAlign: "center",
    padding: "56px 28px 40px",
    minHeight: 580,
    justifyContent: "center",
  },
  brandRow: { display: "flex", alignItems: "center", gap: 8 },
  brandWord: {
    fontFamily: "'Fraunces', serif",
    fontWeight: 600,
    fontSize: 22,
    letterSpacing: "-0.01em",
  },
  heroHeadline: {
    fontFamily: "'Fraunces', serif",
    fontWeight: 600,
    fontSize: 34,
    lineHeight: 1.12,
    margin: "8px 0 14px",
    letterSpacing: "-0.01em",
  },
  heroSub: {
    fontSize: 15,
    lineHeight: 1.55,
    color: COLORS.inkSoft,
    maxWidth: 320,
    margin: "0 0 28px",
  },
  heroFootnote: {
    fontSize: 12.5,
    color: COLORS.inkSoft,
    marginTop: 14,
  },
  primaryBtn: {
    background: COLORS.coral,
    color: "white",
    border: "none",
    borderRadius: 999,
    padding: "14px 32px",
    fontSize: 15.5,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'Inter', system-ui, sans-serif",
    boxShadow: "0 4px 14px rgba(255,107,74,0.32)",
  },
  backLink: {
    background: "none",
    border: "none",
    color: COLORS.inkSoft,
    fontSize: 14,
    cursor: "pointer",
    alignSelf: "flex-start",
    padding: "16px 20px 0",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  regCard: {
    background: COLORS.card,
    borderRadius: 20,
    padding: "28px 26px",
    width: "100%",
    maxWidth: 340,
    boxShadow: "0 8px 28px rgba(43,36,32,0.08)",
    boxSizing: "border-box",
  },
  regTitle: {
    fontFamily: "'Fraunces', serif",
    fontWeight: 600,
    fontSize: 22,
    margin: "0 0 6px",
    textAlign: "left",
  },
  regSub: {
    fontSize: 13.5,
    color: COLORS.inkSoft,
    margin: "0 0 20px",
    textAlign: "left",
  },
  fieldLabel: {
    fontSize: 12.5,
    fontWeight: 600,
    color: COLORS.inkSoft,
    textAlign: "left",
    textTransform: "uppercase",
    letterSpacing: "0.03em",
  },
  input: {
    border: `1.5px solid ${COLORS.tan}`,
    borderRadius: 10,
    padding: "11px 13px",
    fontSize: 15,
    fontFamily: "'Inter', system-ui, sans-serif",
    outline: "none",
    color: COLORS.ink,
    background: COLORS.bg,
  },
  errorText: {
    background: "#FCEAE5",
    color: COLORS.coralDark,
    fontSize: 13,
    padding: "9px 12px",
    borderRadius: 8,
    textAlign: "left",
  },
  swipeScreen: {
    display: "flex",
    flexDirection: "column",
    minHeight: 580,
  },
  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "18px 20px 8px",
  },
  matchesPill: {
    background: COLORS.tan,
    border: "none",
    borderRadius: 999,
    padding: "7px 14px",
    fontSize: 13,
    fontWeight: 600,
    color: COLORS.ink,
    cursor: "pointer",
    fontFamily: "'Inter', system-ui, sans-serif",
  },
  swipeHint: {
    fontSize: 13,
    color: COLORS.inkSoft,
    padding: "0 20px",
    margin: "2px 0 14px",
  },
  deckArea: {
    position: "relative",
    flex: 1,
    margin: "0 20px",
    minHeight: 380,
  },
  card: {
    position: "absolute",
    inset: 0,
    borderRadius: 20,
    overflow: "hidden",
    background: COLORS.card,
    boxShadow: "0 10px 30px rgba(43,36,32,0.18)",
    userSelect: "none",
    transition: "transform 0.15s ease",
  },
  cardImg: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  cardGradient: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(20,15,12,0.82) 100%)",
  },
  cardInfo: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    padding: "18px 18px 20px",
  },
  cardNameRow: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  cardName: {
    fontFamily: "'Fraunces', serif",
    fontWeight: 600,
    fontSize: 23,
    color: "white",
  },
  cardRate: {
    fontSize: 14,
    fontWeight: 600,
    color: "#FFD9CC",
  },
  cardMeta: {
    fontSize: 12.5,
    color: "rgba(255,255,255,0.75)",
    margin: "3px 0 8px",
  },
  cardBio: {
    fontSize: 13,
    lineHeight: 1.45,
    color: "rgba(255,255,255,0.92)",
    margin: "0 0 10px",
  },
  badgeRow: { display: "flex", flexWrap: "wrap", gap: 6 },
  badge: {
    background: "rgba(255,255,255,0.18)",
    border: "1px solid rgba(255,255,255,0.3)",
    borderRadius: 999,
    padding: "4px 10px",
    fontSize: 11.5,
    color: "white",
  },
  cardStamp: {
    position: "absolute",
    top: 26,
    zIndex: 5,
    fontFamily: "'Fraunces', serif",
    fontWeight: 700,
    fontSize: 26,
    padding: "6px 14px",
    border: "3px solid",
    borderRadius: 8,
    transform: "rotate(-12deg)",
    pointerEvents: "none",
  },
  likeStamp: { left: 22, color: COLORS.coral, borderColor: COLORS.coral },
  passStamp: { right: 22, color: COLORS.sage, borderColor: COLORS.sage, transform: "rotate(12deg)" },
  actionRow: {
    display: "flex",
    justifyContent: "center",
    gap: 22,
    padding: "20px 0 28px",
  },
  actionBtn: {
    width: 58,
    height: 58,
    borderRadius: "50%",
    border: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    boxShadow: "0 6px 16px rgba(43,36,32,0.18)",
  },
  toast: {
    position: "absolute",
    bottom: 10,
    left: "50%",
    transform: "translateX(-50%)",
    color: "white",
    padding: "8px 16px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 600,
    boxShadow: "0 6px 16px rgba(43,36,32,0.2)",
    zIndex: 10,
  },
  emptyState: {
    position: "absolute",
    inset: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "0 30px",
  },
  matchList: {
    padding: "8px 20px",
    overflowY: "auto",
  },
  matchRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 0",
    borderBottom: `1px solid ${COLORS.tan}`,
  },
  matchAvatar: {
    width: 52,
    height: 52,
    borderRadius: "50%",
    objectFit: "cover",
  },
  matchName: {
    fontFamily: "'Fraunces', serif",
    fontWeight: 600,
    fontSize: 16,
  },
  messageBtn: {
    background: COLORS.sage,
    color: "white",
    border: "none",
    borderRadius: 999,
    padding: "8px 14px",
    fontSize: 12.5,
    fontWeight: 600,
    cursor: "pointer",
  },
};
