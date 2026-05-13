import { useState, useEffect } from "react";
import { supabase } from "./lib/supabaseClient";
import { storage } from "./lib/storage";
import AuthScreenExternal from "./components/AuthScreen";

const T = {
  navy: "#09111F", navyMid: "#0F1A2E", navyLight: "#172338", border: "#1E3050",
  amber: "#F5A623", amberL: "#FFD07A", amberGlow: "rgba(245,166,35,0.14)",
  green: "#27C98A", red: "#EF5050", blue: "#3A8BF5", purple: "#9B6DFF",
  teal: "#00C9A7", pink: "#FF6B9D",
  chalk: "#EEE9E3", dim: "#7A8FA8", white: "#FFFFFF",
};

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html,body,#root{height:100%;overflow:hidden}
  body{background:#09111F;color:#EEE9E3;font-family:'Inter',sans-serif}
  .serif{font-family:'Playfair Display',serif}
  .mono{font-family:monospace}
  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes slideIn{from{transform:translateX(-100%)}to{transform:translateX(0)}}
  .fu{animation:fadeUp .35s ease both}
  input,select,button{font-family:'Inter',sans-serif;outline:none}
  .app-shell{display:flex;height:100vh;overflow:hidden;position:relative}
  .sidebar{
    width:220px;flex-shrink:0;background:#0F1A2E;
    border-right:1px solid #1E3050;
    display:flex;flex-direction:column;
    height:100vh;overflow-y:auto;
    transition:transform .3s ease;
    z-index:100;
  }
  .main-content{
    flex:1;overflow-y:auto;overflow-x:hidden;
    height:100vh;
    -webkit-overflow-scrolling:touch;
    overscroll-behavior:contain;
  }
  @media(max-width:768px){
    .sidebar{
      position:fixed;top:0;left:0;height:100vh;
      transform:translateX(-100%);
      box-shadow:4px 0 20px rgba(0,0,0,.5);
    }
    .sidebar.open{transform:translateX(0)}
    .sidebar-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:99}
    .sidebar-overlay.open{display:block}
    .main-content{width:100%}
    .mobile-header{display:flex!important}
    .stats-grid{grid-template-columns:1fr 1fr!important}
    .two-col{grid-template-columns:1fr!important}
    .three-col{grid-template-columns:1fr 1fr!important}
    .desktop-topbar{display:none!important}
  }
  @media(min-width:769px){
    .mobile-header{display:none!important}
  }
  .mobile-header{
    display:none;
    background:#0F1A2E;border-bottom:1px solid #1E3050;
    padding:14px 16px;align-items:center;gap:12px;
    position:sticky;top:0;z-index:50;flex-shrink:0;
  }
  .hamburger{background:none;border:none;cursor:pointer;display:flex;flex-direction:column;gap:5px;padding:4px}
  .hamburger span{display:block;width:22px;height:2px;background:#F5A623;border-radius:2px}
`;

function InjectStyle({ css }) {
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = css;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);
  return null;
}

function Card({ children, style = {}, glow, className = "" }) {
  return (
    <div className={className} style={{ background: T.navyMid, border: `1px solid ${glow || T.border}`, borderRadius: 16, padding: 20, boxShadow: glow ? `0 0 28px ${glow}` : undefined, ...style }}>
      {children}
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", style = {}, disabled, full }) {
  const base = { border: "none", borderRadius: 10, padding: "11px 18px", fontWeight: 600, fontSize: 14, cursor: disabled ? "not-allowed" : "pointer", transition: "all .18s", opacity: disabled ? 0.5 : 1, width: full ? "100%" : undefined, ...style };
  const v = {
    primary: { background: `linear-gradient(135deg,${T.amber},${T.amberL})`, color: T.navy },
    outline: { background: "transparent", color: T.chalk, border: `1px solid ${T.border}` },
    ghost: { background: "transparent", color: T.dim, padding: "8px 12px" },
    danger: { background: T.red + "22", color: T.red, border: `1px solid ${T.red}33` },
  };
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...v[variant] }}>{children}</button>;
}

function Input({ label, value, onChange, type = "text", placeholder, prefix }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ fontSize: 11, color: T.dim, fontWeight: 600, textTransform: "uppercase", display: "block", marginBottom: 5 }}>{label}</label>}
      <div style={{ position: "relative" }}>
        {prefix && <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: T.dim }}>{prefix}</span>}
        <input type={type} value={value} onChange={onChange} placeholder={placeholder}
          style={{ width: "100%", padding: prefix ? "10px 12px 10px 26px" : "10px 12px", background: T.navyLight, border: `1px solid ${T.border}`, borderRadius: 10, color: T.chalk, fontSize: 14 }}
          onFocus={e => e.target.style.borderColor = T.amber}
          onBlur={e => e.target.style.borderColor = T.border} />
      </div>
    </div>
  );
}

function Sel({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: 14 }}>
      {label && <label style={{ fontSize: 11, color: T.dim, fontWeight: 600, textTransform: "uppercase", display: "block", marginBottom: 5 }}>{label}</label>}
      <select value={value} onChange={onChange} style={{ width: "100%", padding: "10px 12px", background: T.navyLight, border: `1px solid ${T.border}`, borderRadius: 10, color: T.chalk, fontSize: 14 }}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 800, backdropFilter: "blur(6px)", padding: "20px" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: T.navyMid, border: `1px solid ${T.border}`, borderRadius: 20, padding: 28, width: "100%", maxWidth: 460, maxHeight: "90vh", overflowY: "auto", animation: "fadeUp .3s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 className="serif" style={{ fontSize: 19 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.dim, fontSize: 22, cursor: "pointer" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Toast({ msg, color = T.green, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  return (
    <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 999, background: T.navyMid, border: `1px solid ${color}55`, borderRadius: 12, padding: "13px 20px", boxShadow: `0 8px 32px rgba(0,0,0,.5)`, color: T.chalk, fontSize: 14, fontWeight: 500, animation: "fadeUp .3s ease", display: "flex", alignItems: "center", gap: 10, whiteSpace: "nowrap" }}>
      <span style={{ color, fontSize: 18 }}>✓</span>{msg}
    </div>
  );
}

function Pill({ children, color }) {
  return <span style={{ background: color + "18", color, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 500 }}>{children}</span>;
}

function StatCard({ label, value, sub, color = T.amber, icon }) {
  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ color: T.dim, fontSize: 11, fontWeight: 600, marginBottom: 7, textTransform: "uppercase", letterSpacing: ".7px" }}>{label}</div>
          <div className="mono" style={{ fontSize: 22, fontWeight: 600, color, marginBottom: 3 }}>{value}</div>
          {sub && <div style={{ color: T.dim, fontSize: 12 }}>{sub}</div>}
        </div>
        {icon && <div style={{ fontSize: 22, opacity: .7 }}>{icon}</div>}
      </div>
    </Card>
  );
}

function Spinner() {
  return <div style={{ width: 20, height: 20, border: `3px solid ${T.border}`, borderTopColor: T.amber, borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto" }} />;
}

// ── MODE SELECTOR ──────────────────────────────────────────────────────────
function ModeSelector({ onSelect }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", background: `radial-gradient(ellipse at 20% 20%, ${T.amber}08 0%, transparent 50%), ${T.navy}`, overflowY: "auto" }}>
      <div className="fu" style={{ width: "100%", maxWidth: 700 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div className="serif" style={{ fontSize: 40, color: T.amber, marginBottom: 8 }}>ContaAI</div>
          <div style={{ color: T.dim, fontSize: 16 }}>¿Cómo quieres usar la app?</div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {[
            {
              mode: "business", icon: "💼", color: T.amber,
              title: "Autónomo / Pyme",
              description: "Gestión fiscal profesional con facturación IVA/IRPF, modelos AEAT y control de gastos deducibles.",
              features: ["📄 Facturación IVA/IRPF", "🏛 Modelos 303 y 130", "🚗 Kilometraje AEAT (0,26€/km)", "💳 Gastos deducibles", "⚡ Asesor fiscal IA"],
              cta: "Entrar como Autónomo →",
            },
            {
              mode: "family", icon: "🏠", color: T.teal,
              title: "Personal / Familia",
              description: "Control de presupuesto familiar, gastos del hogar, ahorro mensual y balance de ingresos.",
              features: ["🏡 Hogar (alquiler, luz, agua)", "🛒 Alimentación y supermercado", "🎓 Educación / extraescolares", "💰 Ahorro y fondo emergencia", "🛡 Seguros y préstamos"],
              cta: "Entrar como Familia →",
            },
          ].map(m => (
            <div key={m.mode} onClick={() => onSelect(m.mode)}
              style={{ background: T.navyMid, border: `2px solid ${m.color}44`, borderRadius: 24, padding: 28, cursor: "pointer", transition: "all .25s", textAlign: "center" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = m.color; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 16px 40px ${m.color}22`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = m.color + "44"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}>
              <div style={{ fontSize: 48, marginBottom: 14 }}>{m.icon}</div>
              <div className="serif" style={{ fontSize: 22, color: m.color, marginBottom: 10 }}>{m.title}</div>
              <div style={{ color: T.dim, fontSize: 13, lineHeight: 1.7, marginBottom: 18 }}>{m.description}</div>
              {m.features.map(f => (
                <div key={f} style={{ fontSize: 12, color: T.chalk, background: m.color + "12", borderRadius: 8, padding: "5px 10px", marginBottom: 5 }}>{f}</div>
              ))}
              <div style={{ marginTop: 18, background: `linear-gradient(135deg,${m.color},${m.color}cc)`, color: T.navy, borderRadius: 12, padding: "12px", fontWeight: 700, fontSize: 14 }}>{m.cta}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "center", marginTop: 20, color: T.dim, fontSize: 12 }}>Puedes cambiar de modo en Configuración</div>
      </div>
    </div>
  );
}

// ── AUTH ───────────────────────────────────────────────────────────────────

// ── FAMILY CATS ────────────────────────────────────────────────────────────
const FAMILY_CATS = [
  { id: "hogar", label: "Hogar", icon: "🏡", color: T.blue, subs: ["Alquiler/Hipoteca", "Luz", "Agua", "Gas", "Internet", "Comunidad"] },
  { id: "alimentacion", label: "Alimentación", icon: "🛒", color: T.green, subs: ["Supermercado", "Mercado", "Restaurantes"] },
  { id: "transporte", label: "Transporte", icon: "🚗", color: T.amber, subs: ["Gasolina", "Transporte público", "Parking"] },
  { id: "educacion", label: "Educación", icon: "🎓", color: T.purple, subs: ["Colegio", "Extraescolares", "Libros", "Universidad"] },
  { id: "salud", label: "Salud", icon: "❤️", color: T.pink, subs: ["Médico", "Farmacia", "Seguro salud", "Dentista"] },
  { id: "seguros", label: "Seguros", icon: "🛡", color: T.teal, subs: ["Seguro hogar", "Seguro coche", "Seguro vida"] },
  { id: "ocio", label: "Ocio", icon: "🎉", color: T.red, subs: ["Cine/Teatro", "Vacaciones", "Suscripciones", "Deporte"] },
  { id: "deudas", label: "Deudas", icon: "💳", color: "#FF9500", subs: ["Préstamo personal", "Tarjeta crédito"] },
  { id: "ahorro", label: "Ahorro", icon: "💰", color: T.green, subs: ["Fondo emergencia", "Ahorro vacaciones", "Plan pensiones"] },
  { id: "otros", label: "Otros", icon: "📦", color: T.dim, subs: ["Ropa", "Regalos", "Mascotas"] },
];

// ── BUSINESS DASHBOARD ─────────────────────────────────────────────────────
function BusinessDashboard({ session, setScreen }) {
  const [txns, setTxns] = useState([]);
  useEffect(() => { storage.list("transactions", session?.token, session?.isDemo).then(d => setTxns(d || [])); }, []);
  const income = txns.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = Math.abs(txns.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0));
  const net = income - expense;
  const iva = (income - expense) * 0.21;

  return (
    <div className="fu" style={{ padding: "20px" }}>
      <div style={{ background: T.amber + "12", border: `1px solid ${T.amber}33`, borderRadius: 12, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <span>📅</span>
        <span style={{ color: T.amber, fontWeight: 600, fontSize: 13 }}>Próximo vencimiento · Modelo 303 + 130 vence 20 julio</span>
        <Btn variant="outline" onClick={() => setScreen("fiscal")} style={{ marginLeft: "auto", padding: "6px 12px", fontSize: 12 }}>Ver →</Btn>
      </div>
      <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        <StatCard label="Ingresos" value={`${income.toLocaleString("es-ES")}€`} color={T.green} icon="📈" />
        <StatCard label="Gastos" value={`${expense.toLocaleString("es-ES")}€`} color={T.red} icon="💸" />
        <StatCard label="Beneficio" value={`${net.toLocaleString("es-ES")}€`} color={T.amber} icon="⚡" />
        <StatCard label="IVA neto" value={`${iva.toFixed(0)}€`} color={T.blue} icon="🏛" />
      </div>
      <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card>
          <div className="serif" style={{ fontSize: 16, marginBottom: 14 }}>Acciones rápidas</div>
          {[
            { icon: "📄", label: "Nueva factura", screen: "invoices", color: T.amber },
            { icon: "💳", label: "Registrar gasto", screen: "expenses", color: T.blue },
            { icon: "🚗", label: "Log kilometraje", screen: "mileage", color: T.green },
            { icon: "🏛", label: "Modelos AEAT", screen: "fiscal", color: T.red },
          ].map(a => (
            <button key={a.screen} onClick={() => setScreen(a.screen)} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", background: T.navyLight, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 14px", cursor: "pointer", color: T.chalk, fontSize: 13, fontWeight: 500, textAlign: "left", marginBottom: 8, transition: "all .15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = a.color; e.currentTarget.style.background = a.color + "12"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.navyLight; }}>
              <span style={{ fontSize: 18 }}>{a.icon}</span>{a.label}
            </button>
          ))}
        </Card>
        <Card>
          <div className="serif" style={{ fontSize: 16, marginBottom: 14 }}>Últimos movimientos</div>
          {txns.length === 0
            ? <div style={{ color: T.dim, fontSize: 13, textAlign: "center", padding: "20px 0" }}>No hay movimientos aún</div>
            : txns.slice(0, 5).map(t => (
              <div key={t.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.border}22` }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{t.description}</div>
                  <div style={{ fontSize: 11, color: T.dim }}>{t.date}</div>
                </div>
                <div className="mono" style={{ color: t.type === "income" ? T.green : T.red, fontWeight: 600 }}>
                  {t.amount > 0 ? "+" : ""}{Math.abs(t.amount).toLocaleString("es-ES")}€
                </div>
              </div>
            ))}
        </Card>
      </div>
    </div>
  );
}

// ── FAMILY DASHBOARD ───────────────────────────────────────────────────────
function FamilyDashboard({ session, setScreen }) {
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const budget = JSON.parse(localStorage.getItem("family_budget") || "{}");

  useEffect(() => {
    storage.list("family_expenses", session?.token, session?.isDemo).then(d => setExpenses(d || []));
    storage.list("family_incomes", session?.token, session?.isDemo).then(d => setIncomes(d || []));
  }, []);

  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
  const totalExpense = expenses.reduce((s, e) => s + e.amount, 0);
  const saldo = totalIncome - totalExpense;
  const ahorro = expenses.filter(e => e.cat === "ahorro").reduce((s, e) => s + e.amount, 0);

  return (
    <div className="fu" style={{ padding: "20px" }}>
      {saldo < 0 && totalIncome > 0 && (
        <div style={{ background: T.red + "15", border: `1px solid ${T.red}33`, borderRadius: 12, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
          <span>⚠️</span>
          <span style={{ color: T.red, fontWeight: 600, fontSize: 13 }}>¡Gastos superiores a ingresos! Revisa tu presupuesto.</span>
        </div>
      )}
      <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        <StatCard label="Ingresos" value={`${totalIncome.toLocaleString("es-ES")}€`} color={T.green} icon="💼" />
        <StatCard label="Gastos" value={`${totalExpense.toLocaleString("es-ES")}€`} color={T.red} icon="🛒" />
        <StatCard label="Saldo" value={`${saldo.toLocaleString("es-ES")}€`} color={saldo >= 0 ? T.green : T.red} icon="⚖️" />
        <StatCard label="Ahorro" value={`${ahorro.toLocaleString("es-ES")}€`} color={T.teal} icon="💰" />
      </div>
      <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16 }}>
        <Card>
          <div className="serif" style={{ fontSize: 16, marginBottom: 14 }}>Gastos por categoría</div>
          {FAMILY_CATS.slice(0, 7).map(cat => {
            const amt = expenses.filter(e => e.cat === cat.id).reduce((s, e) => s + e.amount, 0);
            const bud = budget[cat.id] || 0;
            const pct = bud > 0 ? Math.min((amt / bud) * 100, 100) : 0;
            return (
              <div key={cat.id} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                  <span style={{ fontSize: 12 }}>{cat.icon} {cat.label}</span>
                  <span className="mono" style={{ color: cat.color, fontSize: 12 }}>{amt.toLocaleString("es-ES")}€{bud > 0 && <span style={{ color: T.dim }}> / {bud}€</span>}</span>
                </div>
                {bud > 0 && (
                  <div style={{ height: 4, background: T.border, borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: pct > 90 ? T.red : pct > 70 ? T.amber : cat.color, borderRadius: 2 }} />
                  </div>
                )}
              </div>
            );
          })}
        </Card>
        <Card>
          <div className="serif" style={{ fontSize: 16, marginBottom: 14 }}>Acciones rápidas</div>
          {[
            { icon: "💸", label: "Añadir gasto", screen: "family_expenses", color: T.red },
            { icon: "💼", label: "Añadir ingreso", screen: "family_income", color: T.green },
            { icon: "🎯", label: "Presupuesto", screen: "family_budget", color: T.amber },
          ].map(a => (
            <button key={a.screen} onClick={() => setScreen(a.screen)} style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", background: T.navyLight, border: `1px solid ${T.border}`, borderRadius: 10, padding: "10px 14px", cursor: "pointer", color: T.chalk, fontSize: 13, fontWeight: 500, textAlign: "left", marginBottom: 8, transition: "all .15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = a.color; e.currentTarget.style.background = a.color + "12"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.navyLight; }}>
              <span style={{ fontSize: 18 }}>{a.icon}</span>{a.label}
            </button>
          ))}
          <div style={{ background: T.teal + "12", border: `1px solid ${T.teal}33`, borderRadius: 10, padding: 12, marginTop: 8 }}>
            <div style={{ fontSize: 12, color: T.teal, fontWeight: 600, marginBottom: 6 }}>💡 Regla 50/30/20</div>
            <div style={{ fontSize: 11, color: T.dim, lineHeight: 1.7 }}>
              Necesidades: <span style={{ color: T.chalk }}>{Math.round(totalIncome * .5).toLocaleString("es-ES")}€</span><br />
              Deseos: <span style={{ color: T.chalk }}>{Math.round(totalIncome * .3).toLocaleString("es-ES")}€</span><br />
              <span style={{ color: T.teal, fontWeight: 600 }}>Ahorro ideal: {Math.round(totalIncome * .2).toLocaleString("es-ES")}€</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── TICKET SCANNER ─────────────────────────────────────────────────────────
function TicketScanner({ onSave, onClose }) {
  const [step, setStep] = useState("capture"); // capture | scanning | review | done
  const [imageBase64, setImageBase64] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [result, setResult] = useState(null);
  const [editing, setEditing] = useState(null);
  const fileRef = useState(null);

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      setImagePreview(ev.target.result);
      setImageBase64(ev.target.result.split(",")[1]);
      setStep("scanning");
      analyzeTicket(ev.target.result.split(",")[1]);
    };
    reader.readAsDataURL(file);
  }

  async function analyzeTicket(base64) {
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: "image/jpeg", data: base64 },
              },
              {
                type: "text",
                text: `Analiza este ticket de compra español y devuelve SOLO un JSON sin backticks ni explicación:
{
  "tienda": "nombre del establecimiento",
  "fecha": "YYYY-MM-DD (usa hoy si no se ve)",
  "total": número con decimales,
  "categoria": una de estas exactas: hogar|alimentacion|transporte|educacion|salud|seguros|ocio|deudas|ahorro|otros,
  "subcategoria": subcategoría específica según el tipo de tienda,
  "descripcion": "descripción corta del gasto",
  "confianza": "alta|media|baja",
  "razon": "por qué elegiste esa categoría en una frase"
}

Categorización guía:
- Mercadona/Lidl/Carrefour/DIA → alimentacion / Supermercado
- Gasolinera/BP/Repsol/Petronor → transporte / Gasolina  
- Farmacia/Parafarmacia → salud / Farmacia
- Zara/H&M/Primark → otros / Ropa
- Netflix/Spotify/Amazon → ocio / Suscripciones
- Restaurante/Bar/McDonald's → ocio / Restaurantes
- Ikea/Leroy Merlin/Bricodepot → hogar / Mantenimiento hogar
- Colegio/academia → educacion
- Luz/agua/gas factura → hogar / (según corresponda)`,
              },
            ],
          }],
        }),
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || "{}";
      const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
      setResult(parsed);
      setEditing({ ...parsed });
      setStep("review");
    } catch (e) {
      // Fallback si falla la IA
      const fallback = {
        tienda: "Ticket escaneado",
        fecha: new Date().toISOString().slice(0, 10),
        total: 0,
        categoria: "otros",
        subcategoria: "",
        descripcion: "Gasto escaneado",
        confianza: "baja",
        razon: "No se pudo leer el ticket correctamente",
      };
      setResult(fallback);
      setEditing({ ...fallback });
      setStep("review");
    }
  }

  async function confirmSave() {
    await onSave({
      description: editing.descriptionripcion || editing.tienda,
      amount: parseFloat(editing.total),
      cat: editing.categoria,
      subcat: editing.subcategoria,
      date: editing.fecha,
      via: "scanner",
    });
    setStep("done");
  }

  const cat = FAMILY_CATS.find(c => c.id === editing?.categoria);
  const confColor = { alta: T.green, media: T.amber, baja: T.red };

  return (
    <Modal title="📷 Escáner de Tickets IA" onClose={onClose}>
      {/* STEP 1: Captura */}
      {step === "capture" && (
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>📷</div>
          <div className="serif" style={{ fontSize: 18, marginBottom: 8 }}>Sube una foto del ticket</div>
          <div style={{ color: T.dim, fontSize: 13, marginBottom: 24, lineHeight: 1.7 }}>
            La IA detectará automáticamente el total, la tienda y lo categorizará como alimentación, hogar, ocio...
          </div>
          <label style={{ display: "block", background: `linear-gradient(135deg,${T.teal},${T.green})`, color: T.navy, borderRadius: 12, padding: "14px 20px", cursor: "pointer", fontWeight: 700, fontSize: 15, marginBottom: 12 }}>
            📁 Subir foto del ticket
            <input type="file" accept="image/*" capture="environment" onChange={handleFile} style={{ display: "none" }} />
          </label>
          <div style={{ color: T.dim, fontSize: 11 }}>
            Funciona con fotos de tickets, facturas y recibos
          </div>
        </div>
      )}

      {/* STEP 2: Escaneando */}
      {step === "scanning" && (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          {imagePreview && (
            <img src={imagePreview} alt="ticket" style={{ maxHeight: 200, maxWidth: "100%", borderRadius: 12, marginBottom: 20, objectFit: "contain" }} />
          )}
          <Spinner />
          <div style={{ color: T.amber, fontSize: 14, fontWeight: 600, marginTop: 14, animation: "pulse 1.2s infinite" }}>
            Analizando ticket con IA...
          </div>
          <div style={{ color: T.dim, fontSize: 12, marginTop: 6 }}>Detectando tienda, total y categoría</div>
        </div>
      )}

      {/* STEP 3: Revisar resultado */}
      {step === "review" && editing && (
        <div>
          {imagePreview && (
            <img src={imagePreview} alt="ticket" style={{ maxHeight: 120, maxWidth: "100%", borderRadius: 10, marginBottom: 16, objectFit: "contain", display: "block", margin: "0 auto 16px" }} />
          )}

          {/* Confianza */}
          <div style={{ background: confColor[result.confianza] + "15", border: `1px solid ${confColor[result.confianza]}33`, borderRadius: 10, padding: "10px 14px", marginBottom: 16, display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 18 }}>{result.confianza === "alta" ? "✅" : result.confianza === "media" ? "⚠️" : "❓"}</span>
            <div>
              <div style={{ color: confColor[result.confianza], fontWeight: 600, fontSize: 13 }}>
                Confianza {result.confianza}
              </div>
              <div style={{ color: T.dim, fontSize: 12 }}>{result.razon}</div>
            </div>
          </div>

          {/* Categoría detectada */}
          <div style={{ background: (cat?.color || T.dim) + "15", border: `1px solid ${(cat?.color || T.dim)}33`, borderRadius: 10, padding: "10px 14px", marginBottom: 16, display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ fontSize: 28 }}>{cat?.icon || "📦"}</span>
            <div>
              <div style={{ fontSize: 11, color: T.dim }}>Categoría detectada</div>
              <div style={{ fontWeight: 700, color: cat?.color || T.dim, fontSize: 15 }}>{cat?.label || "Otros"}</div>
              {editing.subcategoria && <div style={{ fontSize: 12, color: T.dim }}>{editing.subcategoria}</div>}
            </div>
          </div>

          {/* Campos editables */}
          <Input label="Descripción" value={editing.descriptionripcion} onChange={e => setEditing(p => ({ ...p, descripcion: e.target.value }))} />
          <Input label="Total (€)" value={editing.total} onChange={e => setEditing(p => ({ ...p, total: e.target.value }))} type="number" prefix="€" />
          <Sel label="Categoría" value={editing.categoria} onChange={e => setEditing(p => ({ ...p, categoria: e.target.value }))}
            options={FAMILY_CATS.map(c => ({ value: c.id, label: `${c.icon} ${c.label}` }))} />

          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <Btn variant="outline" onClick={() => setStep("capture")}>↩ Repetir</Btn>
            <Btn onClick={confirmSave}>✓ Guardar gasto</Btn>
          </div>
        </div>
      )}

      {/* STEP 4: Guardado */}
      {step === "done" && (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ fontSize: 56, marginBottom: 14 }}>✅</div>
          <div className="serif" style={{ fontSize: 20, marginBottom: 8, color: T.green }}>¡Gasto guardado!</div>
          <div style={{ color: T.dim, fontSize: 13, marginBottom: 20 }}>
            {editing.descriptionripcion} — <span className="mono" style={{ color: T.red }}>{editing.total}€</span> añadido a <strong>{cat?.label}</strong>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <Btn variant="outline" onClick={() => { setStep("capture"); setResult(null); setEditing(null); setImagePreview(null); }}>
              📷 Escanear otro
            </Btn>
            <Btn onClick={onClose}>Cerrar</Btn>
          </div>
        </div>
      )}
    </Modal>
  );
}

// ── FAMILY EXPENSES ────────────────────────────────────────────────────────
function FamilyExpenses({ session, showToast }) {
  const [expenses, setExpenses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [form, setForm] = useState({ description: "", amount: "", cat: "hogar", subcat: "" });

  useEffect(() => { storage.list("family_expenses", session?.token, session?.isDemo).then(d => setExpenses(d || [])); }, []);

  const selectedCat = FAMILY_CATS.find(c => c.id === form.cat);

  async function addExpense() {
    if (!form.description || !form.amount) return;
    const saved = await storage.save("family_expenses", { description: form.description, amount: parseFloat(form.amount), cat: form.cat, subcat: form.subcat, date: new Date().toISOString().slice(0, 10) }, session?.token, session?.isDemo);
    setExpenses(p => [saved, ...p]);
    setShowModal(false);
    setForm({ description: "", amount: "", cat: "hogar", subcat: "" });
    showToast("Gasto añadido ✓");
  }

  async function saveFromScanner(data) {
    const saved = await storage.save("family_expenses", data, session?.token, session?.isDemo);
    setExpenses(p => [saved, ...p]);
    showToast(`${data.description} — ${data.amount}€ guardado ✓`);
  }

  return (
    <div className="fu" style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 className="serif" style={{ fontSize: 22 }}>💸 Gastos Familiares</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <Btn variant="outline" onClick={() => setShowScanner(true)} style={{ background: T.teal + "15", borderColor: T.teal + "55", color: T.teal }}>
            📷 Escanear ticket
          </Btn>
          <Btn onClick={() => setShowModal(true)}>+ Manual</Btn>
        </div>
      </div>

      {/* Banner escáner */}
      <div style={{ background: `linear-gradient(135deg, ${T.teal}18, ${T.green}10)`, border: `1px solid ${T.teal}33`, borderRadius: 14, padding: "14px 18px", marginBottom: 20, display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ fontSize: 36 }}>📷</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: T.teal, marginBottom: 3 }}>Escáner de tickets con IA</div>
          <div style={{ fontSize: 12, color: T.dim, lineHeight: 1.6 }}>
            Haz una foto a cualquier ticket — la IA detecta el total y lo categoriza automáticamente en alimentación, hogar, ocio...
          </div>
        </div>
        <Btn onClick={() => setShowScanner(true)} style={{ background: `linear-gradient(135deg,${T.teal},${T.green})`, color: T.navy, padding: "10px 16px", fontSize: 13, flexShrink: 0 }}>
          Usar ahora
        </Btn>
      </div>

      <div className="three-col" style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 10, marginBottom: 16 }}>
        {FAMILY_CATS.slice(0, 5).map(cat => {
          const amt = expenses.filter(e => e.cat === cat.id).reduce((s, e) => s + (e.amount || 0), 0);
          return (
            <Card key={cat.id} style={{ textAlign: "center", padding: 12 }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{cat.icon}</div>
              <div style={{ fontSize: 10, color: T.dim, marginBottom: 3 }}>{cat.label}</div>
              <div className="mono" style={{ color: cat.color, fontSize: 14, fontWeight: 600 }}>{amt.toLocaleString("es-ES")}€</div>
            </Card>
          );
        })}
      </div>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
          <div className="serif" style={{ fontSize: 16 }}>Todos los gastos</div>
          <div className="mono" style={{ color: T.red, fontWeight: 600 }}>Total: {expenses.reduce((s, e) => s + (e.amount || 0), 0).toLocaleString("es-ES")}€</div>
        </div>
        {expenses.length === 0
          ? (
            <div style={{ textAlign: "center", padding: "30px" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📷</div>
              <div style={{ color: T.dim, fontSize: 13, marginBottom: 14 }}>No hay gastos aún — prueba el escáner de tickets</div>
              <Btn onClick={() => setShowScanner(true)} style={{ background: `linear-gradient(135deg,${T.teal},${T.green})`, color: T.navy }}>
                📷 Escanear primer ticket
              </Btn>
            </div>
          )
          : expenses.map(e => {
            const cat = FAMILY_CATS.find(c => c.id === e.cat);
            return (
              <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px", borderRadius: 10, background: T.navyLight, marginBottom: 6 }}>
                <span style={{ fontSize: 20 }}>{cat?.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{e.description}</div>
                  <div style={{ fontSize: 11, color: T.dim }}>
                    {e.date} · {cat?.label}{e.subcat ? ` · ${e.subcat}` : ""}
                    {e.via === "scanner" && <span style={{ color: T.teal, marginLeft: 6 }}>📷 IA</span>}
                  </div>
                </div>
                <div className="mono" style={{ color: T.red, fontWeight: 600 }}>{(e.amount || 0).toLocaleString("es-ES")}€</div>
              </div>
            );
          })}
      </Card>

      {showScanner && <TicketScanner onSave={saveFromScanner} onClose={() => setShowScanner(false)} />}

      {showModal && (
        <Modal title="Nuevo Gasto Manual" onClose={() => setShowModal(false)}>
          <Input label="Descripción" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Ej: Factura luz mayo" />
          <Input label="Importe (€)" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} type="number" prefix="€" />
          <Sel label="Categoría" value={form.cat} onChange={e => setForm(p => ({ ...p, cat: e.target.value, subcat: "" }))} options={FAMILY_CATS.map(c => ({ value: c.id, label: `${c.icon} ${c.label}` }))} />
          {selectedCat && <Sel label="Subcategoría" value={form.subcat} onChange={e => setForm(p => ({ ...p, subcat: e.target.value }))} options={[{ value: "", label: "Sin especificar" }, ...selectedCat.subs.map(s => ({ value: s, label: s }))]} />}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn variant="outline" onClick={() => setShowModal(false)}>Cancelar</Btn>
            <Btn onClick={addExpense}>Guardar</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── FAMILY INCOME ──────────────────────────────────────────────────────────
function FamilyIncome({ session, showToast }) {
  const [incomes, setIncomes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ description: "", amount: "", type: "nomina" });

  useEffect(() => { storage.list("family_incomes", session?.token, session?.isDemo).then(d => setIncomes(d || [])); }, []);

  async function add() {
    if (!form.description || !form.amount) return;
    const saved = await storage.save("family_incomes", { ...form, amount: parseFloat(form.amount), date: new Date().toISOString().slice(0, 10) }, session?.token, session?.isDemo);
    setIncomes(p => [saved, ...p]);
    setShowModal(false);
    showToast("Ingreso añadido ✓");
  }

  const typeColors = { nomina: T.green, extra: T.amber, alquiler: T.blue, otro: T.dim };
  const typeLabels = { nomina: "🏢 Nómina", extra: "⭐ Extra", alquiler: "🏠 Alquiler", otro: "📦 Otro" };

  return (
    <div className="fu" style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 className="serif" style={{ fontSize: 22 }}>💼 Ingresos Familia</h2>
        <Btn onClick={() => setShowModal(true)}>+ Añadir</Btn>
      </div>
      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14 }}>
          <div className="serif" style={{ fontSize: 16 }}>Total mes</div>
          <div className="mono" style={{ color: T.green, fontWeight: 700, fontSize: 20 }}>{incomes.reduce((s, i) => s + i.amount, 0).toLocaleString("es-ES")}€</div>
        </div>
        {incomes.length === 0
          ? <div style={{ textAlign: "center", padding: "30px", color: T.dim }}>No hay ingresos registrados</div>
          : incomes.map(i => (
            <div key={i.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px", borderRadius: 10, background: T.navyLight, marginBottom: 6 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500 }}>{i.description}</div>
                <div style={{ fontSize: 11, color: T.dim }}>{i.date}</div>
              </div>
              <Pill color={typeColors[i.type]}>{typeLabels[i.type]}</Pill>
              <div className="mono" style={{ color: T.green, fontWeight: 600 }}>{i.amount.toLocaleString("es-ES")}€</div>
            </div>
          ))}
      </Card>
      {showModal && (
        <Modal title="Nuevo Ingreso" onClose={() => setShowModal(false)}>
          <Input label="Descripción" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Ej: Nómina Juan" />
          <Input label="Importe (€)" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} type="number" prefix="€" />
          <Sel label="Tipo" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} options={[{ value: "nomina", label: "🏢 Nómina" }, { value: "extra", label: "⭐ Extra/Bonus" }, { value: "alquiler", label: "🏠 Alquiler" }, { value: "otro", label: "📦 Otro" }]} />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn variant="outline" onClick={() => setShowModal(false)}>Cancelar</Btn>
            <Btn onClick={add}>Guardar</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── FAMILY BUDGET ──────────────────────────────────────────────────────────
function FamilyBudget({ showToast }) {
  const [budget, setBudget] = useState(JSON.parse(localStorage.getItem("family_budget") || "{}"));

  function update(id, val) {
    const updated = { ...budget, [id]: parseFloat(val) || 0 };
    setBudget(updated);
    localStorage.setItem("family_budget", JSON.stringify(updated));
  }

  return (
    <div className="fu" style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 className="serif" style={{ fontSize: 22 }}>🎯 Presupuesto Mensual</h2>
        <Btn onClick={() => showToast("Presupuesto guardado ✓")}>Guardar</Btn>
      </div>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <div className="serif" style={{ fontSize: 16 }}>Total presupuestado</div>
          <div className="mono" style={{ color: T.amber, fontWeight: 700, fontSize: 20 }}>{Object.values(budget).reduce((s, v) => s + (v || 0), 0).toLocaleString("es-ES")}€</div>
        </div>
        <div className="two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {FAMILY_CATS.map(cat => (
            <div key={cat.id}>
              <label style={{ fontSize: 12, color: T.dim, display: "block", marginBottom: 5 }}>{cat.icon} {cat.label}</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: T.dim }}>€</span>
                <input type="number" value={budget[cat.id] || ""} onChange={e => update(cat.id, e.target.value)} placeholder="0"
                  style={{ width: "100%", padding: "8px 12px 8px 22px", background: T.navyLight, border: `1px solid ${T.border}`, borderRadius: 8, color: T.chalk, fontSize: 13 }} />
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card glow={T.teal + "22"}>
        <div className="serif" style={{ fontSize: 15, marginBottom: 10, color: T.teal }}>💡 Consejos para familias</div>
        {["El alquiler/hipoteca no debe superar el 30% de tus ingresos", "Automatiza el ahorro el día que cobras", "Fondo de emergencia: 3-6 meses de gastos", "Revisa suscripciones cada 3 meses"].map((tip, i) => (
          <div key={i} style={{ display: "flex", gap: 10, marginBottom: 7, fontSize: 13 }}>
            <span style={{ color: T.teal }}>✓</span>
            <span style={{ color: T.dim }}>{tip}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ── BUSINESS SCREENS ───────────────────────────────────────────────────────
function Invoices({ session, showToast }) {
  const [invoices, setInvoices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ client: "", cif: "", amount: "", iva: "21", irpf: "15" });
  useEffect(() => { storage.list("invoices", session?.token, session?.isDemo).then(d => setInvoices(d || [])); }, []);
  const base = parseFloat(form.amount) || 0;
  const ivaAmt = base * (parseInt(form.iva) / 100);
  const irpfAmt = base * (parseInt(form.irpf) / 100);
  const total = base + ivaAmt - irpfAmt;
  async function create() {
    if (!form.client || !form.amount) return;
    const saved = await storage.save("invoices", { client: form.client, cif: form.cif, amount: base, iva: ivaAmt, irpf_ret: irpfAmt, total, status: "pendiente", date: new Date().toISOString().slice(0, 10) }, session?.token, session?.isDemo);
    setInvoices(p => [saved, ...p]); setShowModal(false); showToast("Factura creada ✓");
  }
  return (
    <div className="fu" style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 className="serif" style={{ fontSize: 22 }}>📄 Facturación</h2>
        <Btn onClick={() => setShowModal(true)}>+ Nueva</Btn>
      </div>
      <Card>
        {invoices.length === 0 ? <div style={{ textAlign: "center", padding: "30px", color: T.dim }}>No hay facturas aún</div> :
          invoices.map(inv => (
            <div key={inv.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px", borderRadius: 10, background: T.navyLight, marginBottom: 8 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{inv.client}</div>
                <div style={{ fontSize: 11, color: T.dim }}>Base: {inv.amount}€ + IVA − IRPF = <span style={{ color: T.green }}>{inv.total?.toFixed(2)}€</span></div>
              </div>
              <Pill color={inv.status === "cobrada" ? T.green : T.amber}>{inv.status}</Pill>
            </div>
          ))}
      </Card>
      {showModal && (
        <Modal title="Nueva Factura" onClose={() => setShowModal(false)}>
          <Input label="Cliente" value={form.client} onChange={e => setForm(p => ({ ...p, client: e.target.value }))} placeholder="Empresa SL" />
          <Input label="CIF/NIF" value={form.cif} onChange={e => setForm(p => ({ ...p, cif: e.target.value }))} placeholder="B12345678" />
          <Input label="Base imponible" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} type="number" prefix="€" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Sel label="IVA" value={form.iva} onChange={e => setForm(p => ({ ...p, iva: e.target.value }))} options={[{ value: "21", label: "21%" }, { value: "10", label: "10%" }, { value: "0", label: "0%" }]} />
            <Sel label="IRPF" value={form.irpf} onChange={e => setForm(p => ({ ...p, irpf: e.target.value }))} options={[{ value: "15", label: "15%" }, { value: "7", label: "7%" }, { value: "0", label: "0%" }]} />
          </div>
          {form.amount && <div style={{ background: T.navy, borderRadius: 10, padding: 12, marginBottom: 14, display: "flex", justifyContent: "space-between" }}><span style={{ color: T.dim }}>Total</span><span className="mono" style={{ color: T.green, fontWeight: 600 }}>{total.toFixed(2)}€</span></div>}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn variant="outline" onClick={() => setShowModal(false)}>Cancelar</Btn>
            <Btn onClick={create}>Crear</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Expenses({ session, showToast }) {
  const [expenses, setExpenses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ description: "", amount: "", cat: "Software" });
  useEffect(() => { storage.list("expenses", session?.token, session?.isDemo).then(d => setExpenses(d || [])); }, []);
  async function add() {
    if (!form.description || !form.amount) return;
    const saved = await storage.save("expenses", { description: form.description, amount: parseFloat(form.amount), cat: form.cat, date: new Date().toISOString().slice(0, 10) }, session?.token, session?.isDemo);
    setExpenses(p => [saved, ...p]); setShowModal(false); showToast("Gasto registrado ✓");
  }
  return (
    <div className="fu" style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 className="serif" style={{ fontSize: 22 }}>💳 Gastos deducibles</h2>
        <Btn onClick={() => setShowModal(true)}>+ Agregar</Btn>
      </div>
      <Card>
        {expenses.length === 0 ? <div style={{ textAlign: "center", padding: "30px", color: T.dim }}>No hay gastos</div> :
          expenses.map(e => (
            <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px", borderRadius: 10, background: T.navyLight, marginBottom: 6 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{e.description}</div>
                <div style={{ fontSize: 11, color: T.dim }}>{e.date} · {e.cat}</div>
              </div>
              <Pill color={T.blue}>deducible</Pill>
              <div className="mono" style={{ color: T.red, fontWeight: 600 }}>{e.amount?.toLocaleString("es-ES")}€</div>
            </div>
          ))}
      </Card>
      {showModal && (
        <Modal title="Nuevo Gasto" onClose={() => setShowModal(false)}>
          <Input label="Descripción" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Adobe CC" />
          <Input label="Importe" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} type="number" prefix="€" />
          <Sel label="Categoría" value={form.cat} onChange={e => setForm(p => ({ ...p, cat: e.target.value }))} options={["Software", "Oficina", "Kilometraje", "Dietas", "Formación", "Otro"].map(c => ({ value: c, label: c }))} />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn variant="outline" onClick={() => setShowModal(false)}>Cancelar</Btn>
            <Btn onClick={add}>Guardar</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Mileage({ session, showToast }) {
  const [logs, setLogs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ dest: "", km: "", purpose: "Visita cliente" });
  useEffect(() => { storage.list("mileage", session?.token, session?.isDemo).then(d => setLogs(d || [])); }, []);
  async function add() {
    if (!form.dest || !form.km) return;
    const km = parseFloat(form.km);
    const saved = await storage.save("mileage", { dest: form.dest, km, deduction: parseFloat((km * 0.26).toFixed(2)), purpose: form.purpose, date: new Date().toISOString().slice(0, 10) }, session?.token, session?.isDemo);
    setLogs(p => [saved, ...p]); setShowModal(false); showToast("Kilometraje registrado ✓");
  }
  return (
    <div className="fu" style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 className="serif" style={{ fontSize: 22 }}>🚗 Kilometraje AEAT</h2>
        <Btn onClick={() => setShowModal(true)}>+ Registrar</Btn>
      </div>
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <StatCard label="Km totales" value={`${logs.reduce((s, l) => s + l.km, 0)} km`} color={T.green} />
        <StatCard label="Deducción" value={`${logs.reduce((s, l) => s + l.deduction, 0).toFixed(2)}€`} sub="@ 0,26€/km" color={T.amber} />
      </div>
      <Card>
        {logs.length === 0 ? <div style={{ textAlign: "center", padding: "30px", color: T.dim }}>No hay viajes registrados</div> :
          logs.map(l => (
            <div key={l.id} style={{ display: "flex", gap: 12, padding: "10px", borderRadius: 10, background: T.navyLight, marginBottom: 6 }}>
              <span style={{ fontSize: 22 }}>🚗</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 500, fontSize: 14 }}>{l.dest}</div>
                <div style={{ fontSize: 11, color: T.dim }}>{l.date} · {l.purpose}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="mono">{l.km} km</div>
                <div style={{ color: T.green, fontSize: 12 }}>−{l.deduction?.toFixed(2)}€</div>
              </div>
            </div>
          ))}
      </Card>
      {showModal && (
        <Modal title="Nuevo viaje" onClose={() => setShowModal(false)}>
          <Input label="Destino" value={form.dest} onChange={e => setForm(p => ({ ...p, dest: e.target.value }))} placeholder="Madrid" />
          <Input label="Kilómetros" value={form.km} onChange={e => setForm(p => ({ ...p, km: e.target.value }))} type="number" />
          {form.km && <div style={{ color: T.green, fontSize: 13, marginBottom: 12 }}>Deducción: {(parseFloat(form.km || 0) * 0.26).toFixed(2)}€</div>}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn variant="outline" onClick={() => setShowModal(false)}>Cancelar</Btn>
            <Btn onClick={add}>Guardar</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

function FiscalReport() {
  const [open, setOpen] = useState(null);
  const [presentado, setPresentado] = useState(JSON.parse(localStorage.getItem("fiscal_presentado") || "{}"));

  const ingresos = 14900, gastos = 2850;
  const ivaRep = (ingresos * 0.21).toFixed(2);
  const ivaSop = (gastos * 0.21).toFixed(2);
  const ivaNeto = (ingresos * 0.21 - gastos * 0.21).toFixed(2);
  const irpfBase = ingresos - gastos;
  const irpfPago = (irpfBase * 0.20).toFixed(2);

  const MODELOS = [
    {
      id: "303", name: "Modelo 303", description: "Autoliquidación IVA trimestral", icon: "🏛", color: T.amber, vence: "20 julio (2T)",
      campos: [
        { label: "Base imponible (ingresos)", valor: `${ingresos.toLocaleString("es-ES")} €` },
        { label: "IVA repercutido (21%)", valor: `${ivaRep} €` },
        { label: "IVA soportado (gastos)", valor: `−${ivaSop} €` },
        { label: "Resultado a ingresar", valor: `${ivaNeto} €`, highlight: true },
      ],
      nota: "Presenta en la Sede Electrónica AEAT antes del 20 de julio.",
    },
    {
      id: "130", name: "Modelo 130", description: "Pago fraccionado IRPF trimestral", icon: "📋", color: T.blue, vence: "20 julio (2T)",
      campos: [
        { label: "Ingresos acumulados", valor: `${ingresos.toLocaleString("es-ES")} €` },
        { label: "Gastos deducibles", valor: `−${gastos.toLocaleString("es-ES")} €` },
        { label: "Rendimiento neto", valor: `${irpfBase.toLocaleString("es-ES")} €` },
        { label: "20% a ingresar Hacienda", valor: `${irpfPago} €`, highlight: true },
      ],
      nota: "Si tienes retenciones en facturas, réstalas del resultado final.",
    },
    {
      id: "SS", name: "Cuota Autónomos SS", description: "Seguridad Social mensual", icon: "🛡", color: T.green, vence: "Último día hábil",
      campos: [
        { label: "Base de cotización mínima", valor: "1.000 €" },
        { label: "Cuota mensual 2024", valor: "294,00 €" },
        { label: "Cuota trimestral", valor: "882,00 €" },
        { label: "Cuota anual estimada", valor: "3.528,00 €", highlight: true },
      ],
      nota: "Se domicilia automáticamente. Revisa tu base de cotización en Mi Seguridad Social.",
    },
  ];

  function markPresentado(id) {
    const updated = { ...presentado, [id]: true };
    setPresentado(updated);
    localStorage.setItem("fiscal_presentado", JSON.stringify(updated));
  }

  return (
    <div className="fu" style={{ padding: "20px" }}>
      <h2 className="serif" style={{ fontSize: 22, marginBottom: 20 }}>🏛 Modelos Fiscales AEAT</h2>

      {/* Tarjetas clickables */}
      <div className="three-col" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20 }}>
        {MODELOS.map(m => (
          <div key={m.id} onClick={() => setOpen(open === m.id ? null : m.id)}
            style={{ background: T.navyMid, border: `2px solid ${open === m.id ? m.color : m.color + "44"}`, borderRadius: 16, padding: 20, cursor: "pointer", transition: "all .2s", boxShadow: open === m.id ? `0 0 24px ${m.color}33` : "none" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = m.color}
            onMouseLeave={e => { if (open !== m.id) e.currentTarget.style.borderColor = m.color + "44"; }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
              <div style={{ fontSize: 28 }}>{m.icon}</div>
              {presentado[m.id] && <Pill color={T.green}>✓ Presentado</Pill>}
            </div>
            <div style={{ color: m.color, fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{m.name}</div>
            <div style={{ color: T.dim, fontSize: 12, marginBottom: 8 }}>{m.description}</div>
            <div style={{ fontSize: 11, color: T.dim, marginBottom: 10 }}>📅 {m.vence}</div>
            <div style={{ fontSize: 12, color: m.color, fontWeight: 600 }}>
              {open === m.id ? "▲ Cerrar" : "▼ Ver detalle"}
            </div>
          </div>
        ))}
      </div>

      {/* Panel expandido */}
      {open && (() => {
        const m = MODELOS.find(x => x.id === open);
        return (
          <Card glow={m.color + "33"} style={{ marginBottom: 20, animation: "fadeUp .3s ease" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div className="serif" style={{ fontSize: 18 }}>{m.icon} {m.name} — 2T 2025</div>
              <button onClick={() => setOpen(null)} style={{ background: "none", border: "none", color: T.dim, fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>

            {m.campos.map((c, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${T.border}33` }}>
                <span style={{ color: T.dim, fontSize: 13 }}>{c.label}</span>
                <span className="mono" style={{ color: c.highlight ? m.color : T.chalk, fontSize: c.highlight ? 18 : 14, fontWeight: c.highlight ? 700 : 400 }}>{c.valor}</span>
              </div>
            ))}

            <div style={{ background: T.navy, borderRadius: 10, padding: 12, marginTop: 14, marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: T.dim }}>💡 {m.nota}</div>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Btn onClick={() => { markPresentado(m.id); setOpen(null); }}>
                ✓ Marcar como presentado
              </Btn>
              <Btn variant="outline" onClick={() => window.open("https://sede.agenciatributaria.gob.es", "_blank")}>
                → Sede AEAT
              </Btn>
              <Btn variant="ghost" onClick={() => alert(`Borrador ${m.name} guardado`)}>
                💾 Guardar borrador
              </Btn>
            </div>
          </Card>
        );
      })()}

      {/* Calendario fiscal */}
      <Card>
        <div className="serif" style={{ fontSize: 15, marginBottom: 12 }}>📋 Calendario fiscal 2025</div>
        {[
          { modelo: "303 + 130", periodo: "1T (Ene–Mar)", vence: "20 abril 2025", done: true },
          { modelo: "303 + 130", periodo: "2T (Abr–Jun)", vence: "20 julio 2025", done: false },
          { modelo: "303 + 130", periodo: "3T (Jul–Sep)", vence: "20 octubre 2025", done: false },
          { modelo: "303 + 130 + 390 + 100", periodo: "4T (Oct–Dic)", vence: "30 enero 2026", done: false },
        ].map((c, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 0", borderBottom: `1px solid ${T.border}22` }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: c.done ? T.green + "20" : T.amber + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
              {c.done ? "✓" : "○"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{c.modelo}</div>
              <div style={{ fontSize: 11, color: T.dim }}>{c.periodo}</div>
            </div>
            <Pill color={c.done ? T.green : T.amber}>{c.vence}</Pill>
          </div>
        ))}
      </Card>
    </div>
  );
}

function Settings({ session, onLogout, onChangeMode, showToast }) {
  return (
    <div className="fu" style={{ padding: "20px" }}>
      <h2 className="serif" style={{ fontSize: 22, marginBottom: 20 }}>⚙️ Configuración</h2>
      <Card style={{ marginBottom: 14 }}>
        <div className="serif" style={{ fontSize: 16, marginBottom: 14 }}>👤 Mi cuenta</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontWeight: 600 }}>{session?.email}</div>
            <div style={{ color: T.dim, fontSize: 12, marginTop: 2 }}>{session?.isDemo ? "📱 Modo demo — datos en navegador" : "☁️ Conectado a Supabase"}</div>
          </div>
          <Btn variant="danger" onClick={() => { onLogout(); showToast("Sesión cerrada"); }}>Cerrar sesión</Btn>
        </div>
      </Card>
      <Card style={{ marginBottom: 14 }}>
        <div className="serif" style={{ fontSize: 16, marginBottom: 12 }}>🔄 Cambiar modo</div>
        <div style={{ color: T.dim, fontSize: 13, marginBottom: 14, lineHeight: 1.6 }}>Cambia entre modo Autónomo/Pyme y Personal/Familia sin perder tus datos.</div>
        <Btn full onClick={onChangeMode}>Seleccionar modo →</Btn>
      </Card>
      <Card>
        <div className="serif" style={{ fontSize: 16, marginBottom: 12 }}>🗄 Almacenamiento</div>
        <div style={{ color: T.dim, fontSize: 13, lineHeight: 1.7 }}>
          {session?.isDemo
            ? "Los datos se guardan en el almacenamiento local del navegador. Funcionan offline pero no se sincronizan entre dispositivos."
            : "Los datos se guardan en Supabase y se sincronizan en todos tus dispositivos."}
        </div>
      </Card>
    </div>
  );
}

// ── NAV CONFIG ─────────────────────────────────────────────────────────────
const BUSINESS_NAV = [
  { id: "dashboard", label: "Dashboard", icon: "⚡" },
  { id: "invoices", label: "Facturación", icon: "📄" },
  { id: "expenses", label: "Gastos", icon: "💳" },
  { id: "mileage", label: "Kilometraje", icon: "🚗" },
  { id: "fiscal", label: "Modelos AEAT", icon: "🏛" },
  { id: "settings", label: "Configuración", icon: "⚙️" },
];

const FAMILY_NAV = [
  { id: "dashboard", label: "Resumen", icon: "🏠" },
  { id: "family_expenses", label: "Gastos", icon: "💸" },
  { id: "family_income", label: "Ingresos", icon: "💼" },
  { id: "family_budget", label: "Presupuesto", icon: "🎯" },
  { id: "settings", label: "Configuración", icon: "⚙️" },
];

// ── APP ROOT ───────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(null);
  const [appMode, setAppMode] = useState(null);
  const [screen, setScreen] = useState("dashboard");
  const [toast, setToast] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function showToast(msg, color = T.green) { setToast({ msg, color }); }

  const nav = appMode === "family" ? FAMILY_NAV : BUSINESS_NAV;
  const modeColor = appMode === "family" ? T.teal : T.amber;
  const modeLabel = appMode === "family" ? "🏠 Familia" : "💼 Autónomo";

  function getScreen() {
    const props = { session, showToast, setScreen };
    if (appMode === "business") {
      const s = { dashboard: <BusinessDashboard {...props} />, invoices: <Invoices {...props} />, expenses: <Expenses {...props} />, mileage: <Mileage {...props} />, fiscal: <FiscalReport />, settings: <Settings {...props} onLogout={() => setSession(null)} onChangeMode={() => { setAppMode(null); setScreen("dashboard"); }} /> };
      return s[screen] || s.dashboard;
    } else {
      const s = { dashboard: <FamilyDashboard {...props} />, family_expenses: <FamilyExpenses {...props} />, family_income: <FamilyIncome {...props} />, family_budget: <FamilyBudget showToast={showToast} />, settings: <Settings {...props} onLogout={() => setSession(null)} onChangeMode={() => { setAppMode(null); setScreen("dashboard"); }} /> };
      return s[screen] || s.dashboard;
    }
  }

  if (!session) return (
    <>
      <InjectStyle css={CSS} />
      <AuthScreenExternal onAuth={s => setSession(s)} showToast={showToast} />
      {toast && <Toast msg={toast.msg} color={toast.color} onClose={() => setToast(null)} />}
    </>
  );

  if (!appMode) return (
    <>
      <InjectStyle css={CSS} />
      <ModeSelector onSelect={mode => { setAppMode(mode); setScreen("dashboard"); }} />
      {toast && <Toast msg={toast.msg} color={toast.color} onClose={() => setToast(null)} />}
    </>
  );

  return (
    <>
      <InjectStyle css={CSS} />
      <div className="app-shell">
        {/* Overlay móvil */}
        <div className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`} onClick={() => setSidebarOpen(false)} />

        {/* SIDEBAR */}
        <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <div style={{ padding: "20px 16px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div className="serif" style={{ fontSize: 20, color: T.amber }}>ContaAI</div>
              <div style={{ fontSize: 10, color: T.dim }}>España</div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="hamburger" style={{ display: "none" }} id="close-sidebar">✕</button>
          </div>

          <div style={{ padding: "0 12px 14px" }}>
            <div style={{ background: modeColor + "18", border: `1px solid ${modeColor}44`, borderRadius: 10, padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: modeColor, fontWeight: 700 }}>{modeLabel}</span>
              <span style={{ color: T.dim, fontSize: 10 }}>{session?.isDemo ? "Demo" : "Cloud"}</span>
            </div>
          </div>

          <nav style={{ flex: 1, padding: "0 10px" }}>
            {nav.map(item => {
              const active = screen === item.id;
              return (
                <button key={item.id} onClick={() => { setScreen(item.id); setSidebarOpen(false); }}
                  style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px", marginBottom: 3, background: active ? modeColor + "18" : "transparent", border: `1px solid ${active ? modeColor + "44" : "transparent"}`, borderRadius: 10, cursor: "pointer", color: active ? modeColor : T.dim, fontFamily: "'Inter',sans-serif", fontWeight: active ? 600 : 400, fontSize: 13, textAlign: "left", transition: "all .15s" }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background = T.navyLight; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}>
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div style={{ padding: "12px" }}>
            <button onClick={() => { setAppMode(null); setScreen("dashboard"); setSidebarOpen(false); }}
              style={{ width: "100%", padding: "9px", background: "transparent", border: `1px solid ${T.border}`, borderRadius: 10, color: T.dim, fontSize: 12, cursor: "pointer" }}>
              🔄 Cambiar modo
            </button>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="main-content">
          {/* Header móvil */}
          <div className="mobile-header">
            <button className="hamburger" onClick={() => setSidebarOpen(true)}>
              <span /><span /><span />
            </button>
            <div className="serif" style={{ fontSize: 18, color: T.amber, flex: 1 }}>ContaAI</div>
            <span style={{ fontSize: 12, color: modeColor, fontWeight: 600 }}>{modeLabel}</span>
          </div>

          {/* Header desktop */}
          <div className="desktop-topbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px 0", marginBottom: 4 }}>
            <div>
              <div className="serif" style={{ fontSize: 24 }}>
                {nav.find(n => n.id === screen)?.icon} {nav.find(n => n.id === screen)?.label}
              </div>
              <div style={{ color: T.dim, fontSize: 12, marginTop: 2 }}>
                {new Date().toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </div>
            </div>
            <button onClick={() => setScreen("settings")} style={{ width: 34, height: 34, borderRadius: 10, background: modeColor + "20", border: `1px solid ${modeColor}44`, display: "flex", alignItems: "center", justifyContent: "center", color: modeColor, fontSize: 16, cursor: "pointer" }}>
              👤
            </button>
          </div>

          {getScreen()}
        </div>
      </div>

      {toast && <Toast msg={toast.msg} color={toast.color} onClose={() => setToast(null)} />}
    </>
  );
}