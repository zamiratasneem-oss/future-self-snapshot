import { useState, useEffect, useRef } from "react";

const QUESTIONS = [
  {
    id: "age",
    q: "How old are you?",
    sub: "This shapes the season you're in.",
    type: "choice",
    options: ["32–37", "38–44", "45–51", "52–60", "60+"]
  },
  {
    id: "trigger",
    q: "What's making you feel the gap most right now?",
    sub: "Choose the one that lands hardest.",
    type: "choice",
    options: [
      "My career no longer feels like mine",
      "A major life change — divorce, empty nest, loss",
      "I achieved what I set out to and still feel lost",
      "Burnout. I can't keep running like this.",
      "A quiet sense that time is passing and I'm not changing"
    ]
  },
  {
    id: "identity",
    q: "Which sentence is most true right now?",
    sub: "Be honest. Nobody's watching.",
    type: "choice",
    options: [
      "I know exactly who I was. I don't know who I'm becoming.",
      "I've been playing a role so long I forgot there was a real person underneath.",
      "I keep waiting for permission to want something different.",
      "I'm terrified that this version of me is the final version.",
      "Something shifted in me. The life around me hasn't caught up."
    ]
  },
  {
    id: "strength",
    q: "What has always been true about you — even when you forgot?",
    sub: "Your answer matters more than you think.",
    type: "text",
    placeholder: "e.g. I've always been the person who figures things out. I've always cared more deeply than I let on..."
  },
  {
    id: "future",
    q: "Finish this sentence: In the life that actually fits me, I am someone who...",
    sub: "Don't edit yourself. Write the first thing that comes.",
    type: "text",
    placeholder: "e.g. wakes up with purpose. makes things. is fully present with the people I love..."
  }
];

export default function App() {
  const [step, setStep] = useState("intro"); // intro | q0..q4 | loading | result
  const [answers, setAnswers] = useState({});
  const [currentQ, setCurrentQ] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [textVal, setTextVal] = useState("");
  const [dots, setDots] = useState(0);
  const [email, setEmail] = useState("");
  const [joined, setJoined] = useState(false);
  const resultRef = useRef(null);

  // Animate loading dots
  useEffect(() => {
    if (step !== "loading") return;
    const t = setInterval(() => setDots(d => (d + 1) % 4), 500);
    return () => clearInterval(t);
  }, [step]);

  const selectOption = (val) => {
    const q = QUESTIONS[currentQ];
    const newAnswers = { ...answers, [q.id]: val };
    setAnswers(newAnswers);
    if (currentQ < QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
      setTextVal("");
    } else {
      generateSnapshot(newAnswers);
    }
  };

  const submitText = () => {
    if (!textVal.trim()) return;
    selectOption(textVal.trim());
  };

  const generateSnapshot = async (ans) => {
    setStep("loading");
    try {
      const prompt = `You are generating a "Future Self Snapshot" for someone using the Continuum platform — an identity-first transformation system for people 35–60 navigating major life transitions.

Based on their answers, write a deeply personal, emotionally resonant Future Self portrait. This is NOT generic advice. It should feel like you've seen them clearly — maybe more clearly than they've seen themselves.

Their answers:
- Age range: ${ans.age}
- What's creating the gap: ${ans.trigger}
- Most true sentence: ${ans.identity}
- What has always been true about them: ${ans.strength}
- In the life that fits them, they are someone who: ${ans.future}

Write their Future Self Snapshot in exactly this structure. Use second person ("you"). Be poetic but grounded. Specific but universal. Do NOT use bullet points. Write in flowing prose broken into short paragraphs.

Structure:
1. WHO YOU ARE RIGHT NOW (2-3 sentences — name the exact season they're in with precision and empathy. Make them feel seen.)
2. WHAT THIS MOMENT IS REALLY ABOUT (2-3 sentences — reframe their struggle as something necessary and meaningful, not a crisis)
3. YOUR FUTURE SELF (3-4 sentences — describe who they're becoming. Make it feel earned, specific, and real. Not fantasy — embodied.)
4. WHAT THEY ALREADY KNOW (1-2 sentences — name the core truth they already carry. The thing from their "what's always been true" answer.)
5. THE INVITATION (1-2 sentences — a gentle, powerful close. End with something that opens a door rather than closes it.)

Respond ONLY with JSON in this exact format, nothing else:
{
  "season": "one evocative phrase naming their current life season (3-6 words)",
  "archetype": "their emerging Future Self archetype name (2-3 words, e.g. 'The Purposeful Builder', 'The Quiet Revolutionary', 'The Second-Act Creator')",
  "now": "WHO YOU ARE RIGHT NOW paragraph",
  "moment": "WHAT THIS MOMENT IS REALLY ABOUT paragraph", 
  "future": "YOUR FUTURE SELF paragraph",
  "truth": "WHAT THEY ALREADY KNOW paragraph",
  "invitation": "THE INVITATION paragraph"
}`;

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }]
        })
      });

      const data = await response.json();
      const text = data.content.map(b => b.text || "").join("");
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResult(parsed);
      setStep("result");
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch (e) {
      setError("Something went wrong. Try again.");
      setStep("question");
    }
  };

  const restart = () => {
    setStep("intro");
    setAnswers({});
    setCurrentQ(0);
    setResult(null);
    setTextVal("");
    setEmail("");
    setJoined(false);
  };

  const q = QUESTIONS[currentQ];
  const progress = currentQ / QUESTIONS.length;

  // ─── INTRO ───
  if (step === "intro") return (
    <div style={styles.page}>
      <div style={styles.grain} />
      <div style={styles.centered}>
        <div style={styles.logoWrap}>
          <div style={styles.logoRing}><div style={styles.logoDot} /></div>
        </div>
        <div style={styles.eyebrow}>CONTINUUM</div>
        <h1 style={styles.heroTitle}>Future Self<br /><em style={styles.heroItalic}>Snapshot</em></h1>
        <p style={styles.heroSub}>5 questions. 3 minutes.<br />A portrait of who you're becoming.</p>
        <p style={styles.heroDesc}>This isn't a personality test. It's not a quiz.<br />It's the beginning of seeing yourself clearly.</p>
        <button style={styles.startBtn} onClick={() => setStep("question")}>
          Begin →
        </button>
        <p style={styles.freeNote}>Free · No account needed</p>
      </div>
    </div>
  );

  // ─── QUESTION ───
  if (step === "question") return (
    <div style={styles.page}>
      <div style={styles.grain} />

      {/* Progress */}
      <div style={styles.progressBar}>
        <div style={{ ...styles.progressFill, width: `${progress * 100}%` }} />
      </div>

      <div style={styles.qWrap}>
        <div style={styles.qCounter}>{currentQ + 1} / {QUESTIONS.length}</div>
        <h2 style={styles.qTitle}>{q.q}</h2>
        <p style={styles.qSub}>{q.sub}</p>

        {q.type === "choice" && (
          <div style={styles.options}>
            {q.options.map((opt, i) => (
              <button
                key={i}
                style={styles.optionBtn}
                onClick={() => selectOption(opt)}
                onMouseEnter={e => Object.assign(e.currentTarget.style, styles.optionBtnHover)}
                onMouseLeave={e => Object.assign(e.currentTarget.style, { background: "transparent", borderColor: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.8)" })}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {q.type === "text" && (
          <div style={styles.textWrap}>
            <textarea
              style={styles.textarea}
              placeholder={q.placeholder}
              value={textVal}
              onChange={e => setTextVal(e.target.value)}
              rows={4}
              onFocus={e => e.target.style.borderColor = "rgba(255,255,255,0.35)"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
            />
            <button
              style={{ ...styles.startBtn, marginTop: 16, opacity: textVal.trim() ? 1 : 0.4 }}
              onClick={submitText}
              disabled={!textVal.trim()}
            >
              Continue →
            </button>
          </div>
        )}

        {currentQ > 0 && (
          <button style={styles.backBtn} onClick={() => { setCurrentQ(currentQ - 1); setTextVal(""); }}>
            ← Back
          </button>
        )}
      </div>
    </div>
  );

  // ─── LOADING ───
  if (step === "loading") return (
    <div style={styles.page}>
      <div style={styles.grain} />
      <div style={styles.centered}>
        <div style={styles.logoRing}><div style={styles.logoDot} /></div>
        <p style={{ ...styles.eyebrow, marginTop: 24 }}>READING YOUR ANSWERS</p>
        <h2 style={{ ...styles.heroTitle, fontSize: 32, marginTop: 16 }}>
          Building your<br /><em style={styles.heroItalic}>Future Self portrait</em>
        </h2>
        <p style={styles.heroDesc}>{"Seeing you clearly" + ".".repeat(dots + 1)}</p>
      </div>
    </div>
  );

  // ─── RESULT ───
  if (step === "result" && result) return (
    <div style={styles.page} ref={resultRef}>
      <div style={styles.grain} />

      {/* Header */}
      <div style={styles.resultHeader}>
        <div style={styles.logoWrap}>
          <div style={styles.logoRing}><div style={styles.logoDot} /></div>
        </div>
        <div style={styles.eyebrow}>CONTINUUM · YOUR SNAPSHOT</div>
      </div>

      {/* Season + Archetype */}
      <div style={styles.seasonWrap}>
        <div style={styles.seasonLabel}>YOUR CURRENT SEASON</div>
        <div style={styles.seasonText}>{result.season}</div>
        <div style={styles.archetypeChip}>{result.archetype}</div>
      </div>

      {/* Divider */}
      <div style={styles.divider} />

      {/* Sections */}
      <div style={styles.sections}>
        {[
          { label: "Who you are right now", text: result.now },
          { label: "What this moment is really about", text: result.moment },
          { label: "Your Future Self", text: result.future, highlight: true },
          { label: "What you already know", text: result.truth },
          { label: "The invitation", text: result.invitation },
        ].map((sec, i) => (
          <div key={i} style={{ ...styles.section, ...(sec.highlight ? styles.sectionHighlight : {}) }}>
            <div style={{ ...styles.sectionLabel, ...(sec.highlight ? { color: "white" } : {}) }}>
              {sec.label}
            </div>
            <p style={{ ...styles.sectionText, ...(sec.highlight ? { color: "rgba(255,255,255,0.9)", fontSize: 17 } : {}) }}>
              {sec.text}
            </p>
          </div>
        ))}
      </div>

      <div style={styles.divider} />

      {/* Waitlist CTA */}
      <div style={styles.ctaBox}>
        <div style={styles.ctaEyebrow}>THIS WAS THE BEGINNING</div>
        <h3 style={styles.ctaTitle}>Continuum turns this snapshot<br />into a system.</h3>
        <p style={styles.ctaDesc}>
          Your Future Self isn't a destination. It's a practice. Continuum is the AI-powered OS that helps you become who you just described — one experiment, one decision, one day at a time.
        </p>
        {!joined ? (
          <div style={styles.emailRow}>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={styles.emailInput}
              onFocus={e => e.target.style.borderColor = "rgba(255,255,255,0.4)"}
              onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.15)"}
            />
            <button
              style={{ ...styles.startBtn, margin: 0, padding: "14px 24px", flexShrink: 0 }}
              onClick={() => { if (email.includes("@")) setJoined(true); }}
            >
              Join waitlist
            </button>
          </div>
        ) : (
          <div style={styles.joinedMsg}>
            🖤 You're on the list. We'll be in touch.
          </div>
        )}
        <p style={styles.launchNote}>App launching 2026 · @continuumlifeai</p>
      </div>

      {/* Share prompt */}
      <div style={styles.shareBox}>
        <p style={styles.shareText}>
          Screenshot your snapshot and share it. Tag <strong style={{ color: "white" }}>@continuumlifeai</strong> — we read every one.
        </p>
        <button style={styles.restartBtn} onClick={restart}>
          Start over →
        </button>
      </div>
    </div>
  );

  return null;
}

// ─── STYLES ───
const styles = {
  page: {
    minHeight: "100vh",
    background: "#0A0A0A",
    color: "white",
    fontFamily: "'Georgia', serif",
    position: "relative",
    overflowX: "hidden",
  },
  grain: {
    position: "fixed",
    inset: 0,
    backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E\")",
    pointerEvents: "none",
    zIndex: 0,
  },
  centered: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    padding: "48px 24px",
    textAlign: "center",
    position: "relative",
    zIndex: 1,
  },
  logoWrap: { marginBottom: 24 },
  logoRing: {
    width: 40, height: 40,
    borderRadius: "50%",
    border: "1.5px solid rgba(255,255,255,0.3)",
    display: "flex", alignItems: "center", justifyContent: "center",
    margin: "0 auto",
  },
  logoDot: {
    width: 10, height: 10,
    borderRadius: "50%",
    background: "rgba(255,255,255,0.7)",
  },
  eyebrow: {
    fontSize: 11,
    letterSpacing: "3px",
    color: "rgba(255,255,255,0.3)",
    textTransform: "uppercase",
    fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
    marginBottom: 16,
  },
  heroTitle: {
    fontSize: "clamp(40px, 8vw, 72px)",
    fontWeight: 400,
    lineHeight: 1.1,
    letterSpacing: "-1px",
    marginBottom: 20,
  },
  heroItalic: {
    fontStyle: "italic",
    color: "rgba(255,255,255,0.6)",
  },
  heroSub: {
    fontSize: 18,
    color: "rgba(255,255,255,0.6)",
    lineHeight: 1.7,
    marginBottom: 12,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 300,
  },
  heroDesc: {
    fontSize: 15,
    color: "rgba(255,255,255,0.35)",
    lineHeight: 1.8,
    marginBottom: 40,
    fontFamily: "'DM Sans', sans-serif",
  },
  startBtn: {
    background: "white",
    color: "black",
    border: "none",
    borderRadius: 10,
    padding: "16px 40px",
    fontSize: 15,
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: 700,
    cursor: "pointer",
    letterSpacing: "0.5px",
    transition: "all 0.2s",
  },
  freeNote: {
    fontSize: 12,
    color: "rgba(255,255,255,0.2)",
    marginTop: 16,
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: 1,
  },
  progressBar: {
    position: "fixed",
    top: 0, left: 0, right: 0,
    height: 2,
    background: "rgba(255,255,255,0.05)",
    zIndex: 100,
  },
  progressFill: {
    height: "100%",
    background: "rgba(255,255,255,0.5)",
    transition: "width 0.4s ease",
  },
  qWrap: {
    maxWidth: 620,
    margin: "0 auto",
    padding: "80px 24px 48px",
    position: "relative",
    zIndex: 1,
  },
  qCounter: {
    fontSize: 11,
    color: "rgba(255,255,255,0.2)",
    letterSpacing: 3,
    fontFamily: "'DM Sans', sans-serif",
    marginBottom: 24,
    textTransform: "uppercase",
  },
  qTitle: {
    fontSize: "clamp(22px, 4vw, 32px)",
    fontWeight: 400,
    lineHeight: 1.3,
    marginBottom: 10,
  },
  qSub: {
    fontSize: 14,
    color: "rgba(255,255,255,0.35)",
    marginBottom: 36,
    fontFamily: "'DM Sans', sans-serif",
    fontStyle: "italic",
  },
  options: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  optionBtn: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.12)",
    color: "rgba(255,255,255,0.8)",
    borderRadius: 10,
    padding: "16px 20px",
    textAlign: "left",
    fontSize: 15,
    fontFamily: "'Georgia', serif",
    cursor: "pointer",
    lineHeight: 1.5,
    transition: "all 0.15s",
  },
  optionBtnHover: {
    background: "rgba(255,255,255,0.06)",
    borderColor: "rgba(255,255,255,0.3)",
    color: "white",
  },
  textWrap: { display: "flex", flexDirection: "column" },
  textarea: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 10,
    padding: "16px 18px",
    color: "white",
    fontSize: 15,
    fontFamily: "'Georgia', serif",
    lineHeight: 1.7,
    resize: "none",
    outline: "none",
    transition: "border-color 0.2s",
  },
  backBtn: {
    background: "transparent",
    border: "none",
    color: "rgba(255,255,255,0.25)",
    fontSize: 13,
    fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer",
    marginTop: 24,
    padding: 0,
  },
  resultHeader: {
    padding: "32px 24px 0",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 16,
    position: "relative",
    zIndex: 1,
  },
  seasonWrap: {
    textAlign: "center",
    padding: "32px 24px",
    position: "relative",
    zIndex: 1,
  },
  seasonLabel: {
    fontSize: 10,
    letterSpacing: 3,
    color: "rgba(255,255,255,0.2)",
    textTransform: "uppercase",
    fontFamily: "'DM Sans', sans-serif",
    marginBottom: 12,
  },
  seasonText: {
    fontSize: "clamp(28px, 5vw, 44px)",
    fontStyle: "italic",
    fontWeight: 400,
    color: "rgba(255,255,255,0.85)",
    marginBottom: 16,
    lineHeight: 1.2,
  },
  archetypeChip: {
    display: "inline-block",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 20,
    padding: "8px 20px",
    fontSize: 13,
    color: "rgba(255,255,255,0.6)",
    letterSpacing: 1,
    fontFamily: "'DM Sans', sans-serif",
  },
  divider: {
    height: 1,
    background: "rgba(255,255,255,0.06)",
    margin: "0 24px",
    position: "relative",
    zIndex: 1,
  },
  sections: {
    maxWidth: 640,
    margin: "0 auto",
    padding: "32px 24px",
    display: "flex",
    flexDirection: "column",
    gap: 28,
    position: "relative",
    zIndex: 1,
  },
  section: {
    padding: "20px 0",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
  },
  sectionHighlight: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 12,
    padding: "24px",
    marginLeft: -24,
    marginRight: -24,
  },
  sectionLabel: {
    fontSize: 10,
    letterSpacing: 2.5,
    color: "rgba(255,255,255,0.25)",
    textTransform: "uppercase",
    fontFamily: "'DM Sans', sans-serif",
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 16,
    color: "rgba(255,255,255,0.7)",
    lineHeight: 1.85,
    fontStyle: "italic",
  },
  ctaBox: {
    maxWidth: 640,
    margin: "0 auto",
    padding: "40px 24px",
    textAlign: "center",
    position: "relative",
    zIndex: 1,
  },
  ctaEyebrow: {
    fontSize: 10,
    letterSpacing: 3,
    color: "rgba(255,255,255,0.2)",
    textTransform: "uppercase",
    fontFamily: "'DM Sans', sans-serif",
    marginBottom: 16,
  },
  ctaTitle: {
    fontSize: "clamp(22px, 4vw, 30px)",
    fontWeight: 400,
    lineHeight: 1.3,
    marginBottom: 16,
  },
  ctaDesc: {
    fontSize: 15,
    color: "rgba(255,255,255,0.45)",
    lineHeight: 1.8,
    marginBottom: 28,
    fontFamily: "'DM Sans', sans-serif",
  },
  emailRow: {
    display: "flex",
    gap: 10,
    maxWidth: 440,
    margin: "0 auto 16px",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  emailInput: {
    flex: 1,
    minWidth: 200,
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.15)",
    borderRadius: 10,
    padding: "14px 16px",
    color: "white",
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    transition: "border-color 0.2s",
  },
  joinedMsg: {
    fontSize: 16,
    color: "rgba(255,255,255,0.7)",
    padding: "16px",
    background: "rgba(255,255,255,0.04)",
    borderRadius: 10,
    marginBottom: 16,
    fontFamily: "'DM Sans', sans-serif",
  },
  launchNote: {
    fontSize: 12,
    color: "rgba(255,255,255,0.2)",
    marginTop: 12,
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: 1,
  },
  shareBox: {
    textAlign: "center",
    padding: "0 24px 60px",
    position: "relative",
    zIndex: 1,
  },
  shareText: {
    fontSize: 14,
    color: "rgba(255,255,255,0.3)",
    lineHeight: 1.7,
    fontFamily: "'DM Sans', sans-serif",
    marginBottom: 20,
  },
  restartBtn: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.1)",
    color: "rgba(255,255,255,0.3)",
    borderRadius: 8,
    padding: "10px 24px",
    fontSize: 13,
    fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer",
  },
};
