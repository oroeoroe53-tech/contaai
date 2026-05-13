import { useState, useEffect } from "react";
import { supabase } from "./lib/supabaseClient";
import { storage } from "./lib/storage";
import AuthScreenExternal from "./components/AuthScreen";

const T = {
  navy: "#09111F", navyMid: "#0F1A2E", navyLight: "#172338", border: "#1E3050",
  amber: "#F5A623", amberL: "#FFD07A", green: "#27C98A", red: "#EF5050", 
  blue: "#3A8BF5", purple: "#9B6DFF", teal: "#00C9A7", pink: "#FF6B9D",
  chalk: "#EEE9E3", dim: "#7A8FA8", white: "#FFFFFF",
};

function generateProfessionalFiscalPDF(tipo, datos) {
  const { ingresos, gastos } = datos;
  const margen = ingresos > 0 ? ((ingresos - gastos) / ingresos * 100).toFixed(1) : 0;
  const ivaAIngresar = ((ingresos - gastos) * 0.21).toFixed(2);
  const irpfAIngresar = ((ingresos - gastos) * 0.20).toFixed(2);

  let txt = `
╔══════════════════════════════════════════════════════════════════╗
║          DECLARACIÓN FISCAL PROFESIONAL - ContaAI              ║
║                      ${new Date().getFullYear()} - 2T (Abr-Jun)                      ║
╚══════════════════════════════════════════════════════════════════╝

${tipo === "303" ? `
═══════════════════════════════════════════════════════════════════
MODELO 303 - AUTOLIQUIDACIÓN IVA TRIMESTRAL
═══════════════════════════════════════════════════════════════════

CÁLCULO DEL IVA:
  • Ingresos brutos ....................... ${ingresos.toLocaleString("es-ES")}€
  • Gastos deducibles ..................... −${gastos.toLocaleString("es-ES")}€
  • Rendimiento neto ...................... ${(ingresos - gastos).toLocaleString("es-ES")}€
  
  IVA Repercutido (21% ingresos) .......... ${(ingresos * 0.21).toFixed(2)}€
  IVA Soportado (21% gastos) ............. −${(gastos * 0.21).toFixed(2)}€
  ───────────────────────────────────────────
  ✓ IVA A INGRESAR HACIENDA .............. ${ivaAIngresar}€

FECHA VENCIMIENTO: 20 de julio de ${new Date().getFullYear()}
PRESENTA EN: Sede Electrónica AEAT (https://sede.agenciatributaria.gob.es)
CÓDIGO MODELO: 303
` : `
═══════════════════════════════════════════════════════════════════
MODELO 130 - PAGO FRACCIONADO IRPF
═══════════════════════════════════════════════════════════════════

CÁLCULO DEL IRPF:
  • Ingresos acumulados ................... ${ingresos.toLocaleString("es-ES")}€
  • Gastos deducibles ..................... −${gastos.toLocaleString("es-ES")}€
  • Rendimiento neto del período .......... ${(ingresos - gastos).toLocaleString("es-ES")}€
  
  Retención 20% ........................... ${irpfAIngresar}€
  ───────────────────────────────────────────
  ✓ IRPF A INGRESAR HACIENDA ............. ${irpfAIngresar}€

FECHA VENCIMIENTO: 20 de julio de ${new Date().getFullYear()}
PRESENTA EN: Sede Electrónica AEAT (https://sede.agenciatributaria.gob.es)
CÓDIGO MODELO: 130
`}

═══════════════════════════════════════════════════════════════════
Generado por ContaAI - ${new Date().toLocaleDateString("es-ES")}
`;

  const element = document.createElement("a");
  element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(txt));
  element.setAttribute("download", `Modelo_${tipo}_2T_${new Date().getFullYear()}.txt`);
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

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
  .sidebar{width:220px;flex-shrink:0;background:#0F1A2E;border-right:1px solid #1E3050;display:flex;flex-direction:column;height:100vh;overflow-y:auto;transition:transform .3s ease;z-index:100}
  .main-content{flex:1;overflow-y:auto;overflow-x:hidden;height:100vh;-webkit-overflow-scrolling:touch;overscroll-behavior:contain}
  @media(max-width:768px){
    .sidebar{position:fixed;top:0;left:0;height:100vh;transform:translateX(-100%);box-shadow:4px 0 20px rgba(0,0,0,.5)}
    .sidebar.open{transform:translateX(0)}
    .sidebar-overlay{display:none;position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:99}
    .sidebar-overlay.open{display:block}
    .main-content{width:100%}
    .mobile-header{display:flex!important}
  }
  @media(min-width:769px){
    .mobile-header{display:none!important}
  }
  .mobile-header{display:none;background:#0F1A2E;border-bottom:1px solid #1E3050;padding:14px 16px;align-items:center;gap:12px;position:sticky;top:0;z-index:50;flex-shrink:0}
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

function Card({ children, style = {}, glow }) {
  return <div style={{ background: T.navyMid, border: `1px solid ${glow || T.border}`, borderRadius: 16, padding: 20, boxShadow: glow ? `0 0 28px ${glow}` : undefined, ...style }}>{children}</div>;
}

function Btn({ children, onClick, variant = "primary", style = {}, disabled, full }) {
  const base = { border: "none", borderRadius: 10, padding: "11px 18px", fontWeight: 600, fontSize: 14, cursor: disabled ? "not-allowed" : "pointer", transition: "all .18s", opacity: disabled ? 0.5 : 1, width: full ? "100%" : undefined, ...style };
  const v = { primary: { background: `linear-gradient(135deg,${T.amber},${T.amberL})`, color: T.navy }, outline: { background: "transparent", color: T.chalk, border: `1px solid ${T.border}` } };
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...v[variant] }}>{children}</button>;
}

function Toast({ msg, color = T.green, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, []);
  return <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 999, background: T.navyMid, border: `1px solid ${color}55`, borderRadius: 12, padding: "13px 20px", color: T.chalk, fontSize: 14, fontWeight: 500, animation: "fadeUp .3s ease", display: "flex", alignItems: "center", gap: 10 }}><span style={{ color, fontSize: 18 }}>✓</span>{msg}</div>;
}

function StatCard({ label, value, sub, color = T.amber, icon }) {
  return (
    <Card>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div><div style={{ color: T.dim, fontSize: 11, fontWeight: 600, marginBottom: 7, textTransform: "uppercase" }}>{label}</div>
          <div className="mono" style={{ fontSize: 22, fontWeight: 600, color, marginBottom: 3 }}>{value}</div>
          {sub && <div style={{ color: T.dim, fontSize: 12 }}>{sub}</div>}</div>
        {icon && <div style={{ fontSize: 22, opacity: 0.7 }}>{icon}</div>}
      </div>
    </Card>
  );
}

function BusinessDashboard({ session, showToast }) {
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  useEffect(() => {
    storage.list("expenses", session?.token, session?.isDemo).then(d => setExpenses(d || []));
    storage.list("invoices", session?.token, session?.isDemo).then(d => setIncomes(d || []));
  }, []);

  const totalInc = incomes.reduce((s, i) => s + (i.amount || 0), 0);
  const totalExp = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const margen = totalInc > 0 ? ((totalInc - totalExp) / totalInc * 100).toFixed(1) : 0;
  const ingresosPorHora = totalInc > 0 ? (totalInc / 120).toFixed(2) : 0;
  const eficiencia = totalInc > 0 ? (100 - (totalExp / totalInc) * 100).toFixed(1) : 0;

  return (
    <div className="fu" style={{ padding: "24px 20px" }}>
      <div style={{ background: T.amber + "12", border: `1px solid ${T.amber}33`, borderRadius: 12, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}>
        <span>📅</span>
        <span style={{ color: T.amber, fontWeight: 600, fontSize: 13 }}>Próximo vencimiento · Modelo 303 + 130 vence 20 julio</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        <StatCard label="Ingresos" value={`${totalInc.toLocaleString("es-ES")}€`} color={T.green} icon="📈" />
        <StatCard label="Gastos" value={`${totalExp.toLocaleString("es-ES")}€`} color={T.red} icon="💸" />
        <StatCard label="Margen" value={`${margen}%`} color={T.amber} icon="⚡" />
        <StatCard label="€/hora" value={`${ingresosPorHora}€`} color={T.blue} icon="⏱" />
      </div>

      <Card glow={T.blue + "33"} style={{ marginBottom: 16 }}>
        <div className="serif" style={{ fontSize: 16, marginBottom: 14, color: T.blue }}>📊 Métricas Avanzadas</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div><div style={{ color: T.dim, fontSize: 11, marginBottom: 6 }}>Ingreso/hora</div><div className="mono" style={{ fontSize: 18, color: T.green, fontWeight: 700 }}>{ingresosPorHora}€</div></div>
          <div><div style={{ color: T.dim, fontSize: 11, marginBottom: 6 }}>Ratio gasto/ingreso</div><div className="mono" style={{ fontSize: 18, color: totalInc > 0 && (totalExp / totalInc) * 100 < 50 ? T.green : T.amber, fontWeight: 700 }}>{totalInc > 0 ? ((totalExp / totalInc) * 100).toFixed(0) : 0}%</div></div>
          <div><div style={{ color: T.dim, fontSize: 11, marginBottom: 6 }}>Eficiencia</div><div className="mono" style={{ fontSize: 18, color: T.blue, fontWeight: 700 }}>{eficiencia}%</div></div>
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        <Btn full onClick={() => { generateProfessionalFiscalPDF("303", { ingresos: totalInc, gastos: totalExp }); showToast("Modelo 303 descargado ✓"); }} style={{ background: `linear-gradient(135deg,${T.amber},${T.amberL})`, color: T.navy }}>📄 Modelo 303</Btn>
        <Btn full onClick={() => { generateProfessionalFiscalPDF("130", { ingresos: totalInc, gastos: totalExp }); showToast("Modelo 130 descargado ✓"); }} style={{ background: `linear-gradient(135deg,${T.blue},#5BA8FF)`, color: T.white }}>📋 Modelo 130</Btn>
      </div>

      <Card><div className="serif" style={{ fontSize: 14, marginBottom: 10 }}>Últimos movimientos</div>{[...expenses, ...incomes].slice(0, 5).map((t, i) => (<div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.border}22`, fontSize: 13 }}><span>{t.description || t.client || "Transacción"}</span><span className="mono" style={{ color: t.amount > 0 ? T.green : T.red, fontWeight: 600 }}>{t.amount > 0 ? "+" : ""}{(t.amount || 0).toLocaleString("es-ES")}€</span></div>))}</Card>
    </div>
  );
}

function FamilyDashboard({ session, showToast }) {
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  useEffect(() => {
    storage.list("family_expenses", session?.token, session?.isDemo).then(d => setExpenses(d || []));
    storage.list("family_incomes", session?.token, session?.isDemo).then(d => setIncomes(d || []));
  }, []);

  const totalInc = incomes.reduce((s, i) => s + (i.amount || 0), 0);
  const totalExp = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const saldo = totalInc - totalExp;
  const ahorroIndex = totalInc > 0 ? ((saldo / totalInc) * 100).toFixed(1) : 0;
  const prediccion = (saldo * 12 * 5).toLocaleString("es-ES");

  return (
    <div className="fu" style={{ padding: "24px 20px" }}>
      {saldo < 0 && totalInc > 0 && <div style={{ background: T.red + "15", border: `1px solid ${T.red}33`, borderRadius: 12, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 12 }}><span>⚠️</span><span style={{ color: T.red, fontWeight: 600, fontSize: 13 }}>¡Gastos superiores a ingresos! Revisa tu presupuesto.</span></div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        <StatCard label="Ingresos" value={`${totalInc.toLocaleString("es-ES")}€`} color={T.green} icon="💼" />
        <StatCard label="Gastos" value={`${totalExp.toLocaleString("es-ES")}€`} color={T.red} icon="🛒" />
        <StatCard label="Saldo" value={`${saldo.toLocaleString("es-ES")}€`} color={saldo >= 0 ? T.green : T.red} icon="⚖️" />
        <StatCard label="Ahorro" value={`${ahorroIndex}%`} color={T.teal} icon="💰" />
      </div>

      <Card glow={T.teal + "33"} style={{ marginBottom: 16 }}>
        <div className="serif" style={{ fontSize: 16, marginBottom: 14, color: T.teal }}>👨‍👩‍👧‍👦 Análisis Familia</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          <div><div style={{ color: T.dim, fontSize: 11, marginBottom: 6 }}>Índice ahorro</div><div className="mono" style={{ fontSize: 18, color: ahorroIndex > 20 ? T.green : T.amber, fontWeight: 700 }}>{ahorroIndex}%</div><div style={{ fontSize: 10, color: T.dim }}>Target: 20%</div></div>
          <div><div style={{ color: T.dim, fontSize: 11, marginBottom: 6 }}>Saldo mes</div><div className="mono" style={{ fontSize: 18, color: saldo >= 0 ? T.green : T.red, fontWeight: 700 }}>{(saldo).toLocaleString("es-ES")}€</div></div>
          <div><div style={{ color: T.dim, fontSize: 11, marginBottom: 6 }}>Predicción 5 años</div><div className="mono" style={{ fontSize: 16, color: T.green, fontWeight: 700 }}>{prediccion}€</div></div>
        </div>
      </Card>

      <Card><div className="serif" style={{ fontSize: 16, marginBottom: 12 }}>💡 Regla 50/30/20</div><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        <div style={{ background: T.blue + "12", borderRadius: 10, padding: 12, textAlign: "center" }}><div style={{ fontSize: 11, color: T.dim, marginBottom: 6 }}>Necesidades</div><div className="mono" style={{ fontSize: 14, color: T.blue, fontWeight: 700 }}>{Math.round(totalInc * 0.5).toLocaleString("es-ES")}€</div></div>
        <div style={{ background: T.amber + "12", borderRadius: 10, padding: 12, textAlign: "center" }}><div style={{ fontSize: 11, color: T.dim, marginBottom: 6 }}>Deseos</div><div className="mono" style={{ fontSize: 14, color: T.amber, fontWeight: 700 }}>{Math.round(totalInc * 0.3).toLocaleString("es-ES")}€</div></div>
        <div style={{ background: T.teal + "12", borderRadius: 10, padding: 12, textAlign: "center" }}><div style={{ fontSize: 11, color: T.dim, marginBottom: 6 }}>Ahorro</div><div className="mono" style={{ fontSize: 14, color: T.teal, fontWeight: 700 }}>{Math.round(totalInc * 0.2).toLocaleString("es-ES")}€</div></div>
      </div></Card>
    </div>
  );
}

function ModeSelector({ onSelect }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", background: T.navy }}>
      <div className="fu" style={{ width: "100%", maxWidth: 700 }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}><div className="serif" style={{ fontSize: 40, color: T.amber, marginBottom: 10 }}>ContaAI</div><div style={{ color: T.dim, fontSize: 16 }}>¿Cómo vas a usar la app?</div></div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          <div onClick={() => onSelect("business")} style={{ background: T.navyMid, border: `2px solid ${T.amber}44`, borderRadius: 24, padding: 32, cursor: "pointer", transition: "all .25s", textAlign: "center" }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.amber; e.currentTarget.style.transform = "translateY(-4px)"; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.amber + "44"; e.currentTarget.style.transform = "translateY(0)"; }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>💼</div><div className="serif" style={{ fontSize: 22, color: T.amber, marginBottom: 10 }}>Autónomo</div><div style={{ color: T.dim, fontSize: 13 }}>Facturación, IVA/IRPF, gastos deducibles</div>
          </div>

          <div onClick={() => onSelect("family")} style={{ background: T.navyMid, border: `2px solid ${T.teal}44`, borderRadius: 24, padding: 32, cursor: "pointer", transition: "all .25s", textAlign: "center" }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = T.teal; e.currentTarget.style.transform = "translateY(-4px)"; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = T.teal + "44"; e.currentTarget.style.transform = "translateY(0)"; }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>🏠</div><div className="serif" style={{ fontSize: 22, color: T.teal, marginBottom: 10 }}>Familia</div><div style={{ color: T.dim, fontSize: 13 }}>Presupuesto, ahorro, análisis financiero</div>
          </div>
        </div>
      </div>
    </div>
  );
}

const BUSINESS_NAV = [{ id: "dashboard", label: "Dashboard", icon: "⚡" }];
const FAMILY_NAV = [{ id: "dashboard", label: "Resumen", icon: "🏠" }];

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
    return appMode === "business" ? <BusinessDashboard {...props} /> : <FamilyDashboard {...props} />;
  }

  if (!session) return (<><InjectStyle css={CSS} /><AuthScreenExternal onAuth={s => setSession(s)} showToast={showToast} />{toast && <Toast msg={toast.msg} color={toast.color} onClose={() => setToast(null)} /></>);

  if (!appMode) return (<><InjectStyle css={CSS} /><ModeSelector onSelect={mode => { setAppMode(mode); setScreen("dashboard"); }} />{toast && <Toast msg={toast.msg} color={toast.color} onClose={() => setToast(null)} /></>);

  return (
    <>
      <InjectStyle css={CSS} />
      <div className="app-shell">
        <div className={`sidebar-overlay ${sidebarOpen ? "open" : ""}`} onClick={() => setSidebarOpen(false)} />
        <div className={`sidebar ${sidebarOpen ? "open" : ""}`}>
          <div style={{ padding: "20px 16px 14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div><div className="serif" style={{ fontSize: 20, color: T.amber }}>ContaAI</div><div style={{ fontSize: 10, color: T.dim }}>España</div></div>
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
                <button key={item.id} onClick={() => { setScreen(item.id); setSidebarOpen(false); }} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "10px 12px", marginBottom: 3, background: active ? modeColor + "18" : "transparent", border: `1px solid ${active ? modeColor + "44" : "transparent"}`, borderRadius: 10, cursor: "pointer", color: active ? modeColor : T.dim, fontFamily: "'Inter',sans-serif", fontWeight: active ? 600 : 400, fontSize: 13, textAlign: "left", transition: "all .15s" }} onMouseEnter={e => { if (!active) e.currentTarget.style.background = T.navyLight; }} onMouseLeave={e => { if (!active) e.currentTarget.style.background = "transparent"; }}>
                  <span style={{ fontSize: 16 }}>{item.icon}</span><span>{item.label}</span>
                </button>
              );
            })}
          </nav>
          <div style={{ padding: "12px" }}>
            <button onClick={() => { setAppMode(null); setScreen("dashboard"); setSidebarOpen(false); }} style={{ width: "100%", padding: "9px", background: "transparent", border: `1px solid ${T.border}`, borderRadius: 10, color: T.dim, fontSize: 12, cursor: "pointer" }}>🔄 Cambiar modo</button>
          </div>
        </div>

        <div className="main-content">
          <div className="mobile-header">
            <button className="hamburger" onClick={() => setSidebarOpen(true)}><span /><span /><span /></button>
            <div className="serif" style={{ fontSize: 18, color: T.amber, flex: 1 }}>ContaAI</div>
            <span style={{ fontSize: 12, color: modeColor, fontWeight: 600 }}>{modeLabel}</span>
          </div>

          <div className="desktop-topbar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px 0", marginBottom: 4 }}>
            <div><div className="serif" style={{ fontSize: 24 }}>{nav.find(n => n.id === screen)?.icon} {nav.find(n => n.id === screen)?.label}</div>
              <div style={{ color: T.dim, fontSize: 12, marginTop: 2 }}>{new Date().toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</div>
            </div>
            <button onClick={() => setScreen("settings")} style={{ width: 34, height: 34, borderRadius: 10, background: modeColor + "20", border: `1px solid ${modeColor}44`, display: "flex", alignItems: "center", justifyContent: "center", color: modeColor, fontSize: 16, cursor: "pointer" }}>👤</button>
          </div>

          {getScreen()}
        </div>
      </div>
      {toast && <Toast msg={toast.msg} color={toast.color} onClose={() => setToast(null)} />}
    </>
  );
}
