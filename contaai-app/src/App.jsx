import { useState, useEffect } from "react";

// ════════════════════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ════════════════════════════════════════════════════════════════════════════
const T = {
  navy:      "#09111F",
  navyMid:   "#0F1A2E",
  navyLight: "#172338",
  border:    "#1E3050",
  amber:     "#F5A623",
  amberL:    "#FFD07A",
  amberGlow: "rgba(245,166,35,0.14)",
  green:     "#27C98A",
  greenGlow: "rgba(39,201,138,0.12)",
  red:       "#EF5050",
  blue:      "#3A8BF5",
  purple:    "#9B6DFF",
  chalk:     "#EEE9E3",
  dim:       "#7A8FA8",
  white:     "#FFFFFF",
};

// ════════════════════════════════════════════════════════════════════════════
// SUPABASE CONFIG
// ════════════════════════════════════════════════════════════════════════════
const SUPABASE_URL = "https://ppzbzlvkjgipbhedsntu.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBwemJ6bHZramdpcGJoZWRzbnR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg0MDcwMzAsImV4cCI6MjA5Mzk4MzAzMH0.N3WRFBLlbThzbzjJGbDFG-m2SsoS3d8dcBmnYZuwHPY";

// Cliente Supabase minimalista
const sb = {
  async call(table, method = "GET", data = null, token = null, filters = "") {
    const url = `${SUPABASE_URL}/rest/v1/${table}${filters}`;
    const headers = {
      "Content-Type": "application/json",
      apikey: SUPABASE_KEY,
    };
    if (token) headers.Authorization = `Bearer ${token}`;
    
    const opts = { method, headers };
    if (data) opts.body = JSON.stringify(data);
    
    try {
      const res = await fetch(url, opts);
      return res.ok ? res.json() : null;
    } catch (e) {
      console.error("Supabase error:", e);
      return null;
    }
  },

  async auth(email, pass, isSignUp) {
    const url = isSignUp 
      ? `${SUPABASE_URL}/auth/v1/signup`
      : `${SUPABASE_URL}/auth/v1/token?grant_type=password`;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: SUPABASE_KEY },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      return data.access_token ? { token: data.access_token, user: data.user, success: true } : { success: false, error: data.error_description || data.error };
    } catch {
      return { success: false, error: "Error de conexión" };
    }
  },
};

// ════════════════════════════════════════════════════════════════════════════
// FISCAL CONSTANTS
// ════════════════════════════════════════════════════════════════════════════
const FISCAL_ES = {
  IVA_GENERAL:   0.21,
  IVA_REDUCIDO:  0.10,
  IRPF_RET:      0.15,
  DEDUCCION_KM:  0.26,
  SS_AUTONOMO:   294.00,
  TRIMESTRES: [
    { id: "1T", label: "1T (Ene–Mar)", vence: "20 abril" },
    { id: "2T", label: "2T (Abr–Jun)", vence: "20 julio" },
    { id: "3T", label: "3T (Jul–Sep)", vence: "20 octubre" },
    { id: "4T", label: "4T (Oct–Dic)", vence: "30 enero" },
  ],
};

// ════════════════════════════════════════════════════════════════════════════
// GLOBAL CSS
// ════════════════════════════════════════════════════════════════════════════
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=JetBrains+Mono:wght@400;500&family=Inter:wght@300;400;500;600&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  body{background:#09111F;color:#EEE9E3;font-family:'Inter',sans-serif;min-height:100vh;overflow-x:hidden}
  ::-webkit-scrollbar{width:4px}
  ::-webkit-scrollbar-track{background:#09111F}
  ::-webkit-scrollbar-thumb{background:#1E3050;border-radius:2px}
  .mono{font-family:'JetBrains Mono',monospace}
  .serif{font-family:'Playfair Display',serif}
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
  @keyframes spin{to{transform:rotate(360deg)}}
  @keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
  @keyframes barGrow{from{transform:scaleY(0)}to{transform:scaleY(1)}}
  .fu{animation:fadeUp .4s ease both}
  .fu1{animation:fadeUp .4s .08s ease both}
  .fu2{animation:fadeUp .4s .16s ease both}
  input,select{outline:none!important}
  button:active{transform:scale(.97)}
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

// ════════════════════════════════════════════════════════════════════════════
// UI COMPONENTS
// ════════════════════════════════════════════════════════════════════════════
function Card({ children, style = {}, glow, className = "" }) {
  return (
    <div className={className} style={{
      background: T.navyMid,
      border: `1px solid ${glow || T.border}`,
      borderRadius: 16,
      padding: 24,
      boxShadow: glow ? `0 0 32px ${glow}` : undefined,
      ...style,
    }}>
      {children}
    </div>
  );
}

function Btn({ children, onClick, variant = "primary", style = {}, disabled, full }) {
  const base = {
    border: "none",
    borderRadius: 10,
    padding: "11px 20px",
    fontFamily: "'Inter',sans-serif",
    fontWeight: 600,
    fontSize: 14,
    cursor: disabled ? "not-allowed" : "pointer",
    transition: "all .18s",
    opacity: disabled ? 0.5 : 1,
    width: full ? "100%" : undefined,
    ...style,
  };
  const variants = {
    primary: { background: `linear-gradient(135deg, ${T.amber}, ${T.amberL})`, color: T.navy, boxShadow: `0 4px 18px ${T.amberGlow}` },
    outline: { background: "transparent", color: T.chalk, border: `1px solid ${T.border}` },
    ghost: { background: "transparent", color: T.dim, padding: "8px 14px" },
    danger: { background: T.red + "22", color: T.red, border: `1px solid ${T.red}33` },
    blue: { background: `linear-gradient(135deg, ${T.blue}, ${T.purple})`, color: T.white, boxShadow: `0 4px 18px ${T.blue}33` },
  };
  return <button onClick={onClick} disabled={disabled} style={{ ...base, ...variants[variant] }}>{children}</button>;
}

function Badge({ children, color = T.amber }) {
  return (
    <span style={{
      background: color + "22",
      color,
      border: `1px solid ${color}44`,
      borderRadius: 20,
      padding: "2px 10px",
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: ".5px",
      textTransform: "uppercase",
    }}>
      {children}
    </span>
  );
}

function Pill({ children, color }) {
  return (
    <span className="mono" style={{
      background: color + "18",
      color,
      borderRadius: 6,
      padding: "2px 8px",
      fontSize: 11,
      fontWeight: 500,
    }}>
      {children}
    </span>
  );
}

function Input({ label, value, onChange, type = "text", placeholder, prefix, hint }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{
        fontSize: 11,
        color: T.dim,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: ".7px",
        display: "block",
        marginBottom: 6,
      }}>
        {label}
      </label>}
      <div style={{ position: "relative" }}>
        {prefix && <span style={{
          position: "absolute",
          left: 12,
          top: "50%",
          transform: "translateY(-50%)",
          color: T.dim,
          fontSize: 14,
        }}>{prefix}</span>}
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{
            width: "100%",
            padding: prefix ? "10px 12px 10px 28px" : "10px 12px",
            background: T.navyLight,
            border: `1px solid ${T.border}`,
            borderRadius: 10,
            color: T.chalk,
            fontSize: 14,
            fontFamily: "'Inter',sans-serif",
            transition: "border .15s",
          }}
          onFocus={e => e.target.style.borderColor = T.amber}
          onBlur={e => e.target.style.borderColor = T.border}
        />
      </div>
      {hint && <div style={{ fontSize: 11, color: T.dim, marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

function Sel({ label, value, onChange, options }) {
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={{
        fontSize: 11,
        color: T.dim,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: ".7px",
        display: "block",
        marginBottom: 6,
      }}>
        {label}
      </label>}
      <select
        value={value}
        onChange={onChange}
        style={{
          width: "100%",
          padding: "10px 12px",
          background: T.navyLight,
          border: `1px solid ${T.border}`,
          borderRadius: 10,
          color: T.chalk,
          fontSize: 14,
          fontFamily: "'Inter',sans-serif",
        }}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function Modal({ title, children, onClose, wide }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 800,
        backdropFilter: "blur(8px)",
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: T.navyMid,
        border: `1px solid ${T.border}`,
        borderRadius: 20,
        padding: 32,
        width: "90%",
        maxWidth: wide ? 680 : 460,
        maxHeight: "90vh",
        overflowY: "auto",
        animation: "fadeUp .3s ease",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h3 className="serif" style={{ fontSize: 20 }}>{title}</h3>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: T.dim,
              fontSize: 22,
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Toast({ msg, color = T.green, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, []);
  return (
    <div style={{
      position: "fixed",
      bottom: 28,
      right: 28,
      zIndex: 999,
      background: T.navyMid,
      border: `1px solid ${color}55`,
      borderRadius: 12,
      padding: "14px 20px",
      boxShadow: `0 8px 32px rgba(0,0,0,.5),0 0 24px ${color}22`,
      color: T.chalk,
      fontSize: 14,
      fontWeight: 500,
      animation: "fadeUp .3s ease",
      display: "flex",
      alignItems: "center",
      gap: 10,
    }}>
      <span style={{ color, fontSize: 18 }}>✓</span>
      {msg}
    </div>
  );
}

function StatCard({ label, value, sub, color = T.amber, icon, className }) {
  return (
    <Card className={className} style={{ flex: 1, minWidth: 150 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{
            color: T.dim,
            fontSize: 11,
            fontWeight: 600,
            marginBottom: 8,
            textTransform: "uppercase",
            letterSpacing: ".8px",
          }}>
            {label}
          </div>
          <div className="mono" style={{ fontSize: 24, fontWeight: 500, color, marginBottom: 4 }}>
            {value}
          </div>
          {sub && <div style={{ color: T.dim, fontSize: 12 }}>{sub}</div>}
        </div>
        {icon && <div style={{ fontSize: 22, opacity: 0.7 }}>{icon}</div>}
      </div>
    </Card>
  );
}

function BarChart({ data }) {
  const maxVal = Math.max(...data.map(d => Math.max(d.income, d.expense)));
  const H = 110;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: H + 28, paddingTop: 8 }}>
      {data.map((d, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: H }}>
            <div style={{
              width: 11,
              height: `${(d.income / maxVal) * H}px`,
              background: `linear-gradient(to top, ${T.green}, ${T.green}77)`,
              borderRadius: "3px 3px 0 0",
              transformOrigin: "bottom",
              animation: `barGrow .5s ${i * 0.07}s ease both`,
            }} />
            <div style={{
              width: 11,
              height: `${(d.expense / maxVal) * H}px`,
              background: `linear-gradient(to top, ${T.red}, ${T.red}77)`,
              borderRadius: "3px 3px 0 0",
              transformOrigin: "bottom",
              animation: `barGrow .5s ${i * 0.07 + 0.04}s ease both`,
            }} />
          </div>
          <div style={{ fontSize: 10, color: T.dim, marginTop: 5 }}>{d.month}</div>
        </div>
      ))}
    </div>
  );
}

function Spinner() {
  return (
    <div style={{
      width: 22,
      height: 22,
      border: `3px solid ${T.border}`,
      borderTopColor: T.amber,
      borderRadius: "50%",
      animation: "spin 1s linear infinite",
      margin: "0 auto",
    }} />
  );
}

// ════════════════════════════════════════════════════════════════════════════
// AUTH SCREEN
// ════════════════════════════════════════════════════════════════════════════
function AuthScreen({ onAuth, showToast }) {
  const [mode, setMode] = useState("login");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleAuth() {
    if (!email || !pass) {
      showToast("Completa todos los campos", T.red);
      return;
    }
    setLoading(true);
    const res = await sb.auth(email, pass, mode === "register");
    setLoading(false);

    if (res.success) {
      onAuth({ token: res.token, user: res.user, email });
      showToast(`¡Bienvenido! Sesión iniciada ✓`);
    } else {
      showToast(res.error || "Error de autenticación", T.red);
    }
  }

  function enterDemo() {
    onAuth({ token: "demo-local", user: { email: "demo@contaai.es" }, email: "demo@contaai.es", isDemo: true });
    showToast("Modo demo activo — datos en localStorage");
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: `radial-gradient(ellipse at 30% 20%, ${T.amber}08 0%, transparent 60%),
                  radial-gradient(ellipse at 70% 80%, ${T.blue}08 0%, transparent 60%),
                  ${T.navy}`,
    }}>
      <div className="fu" style={{ width: "100%", maxWidth: 420, padding: "0 20px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div className="serif" style={{ fontSize: 36, color: T.amber, marginBottom: 6 }}>ContaAI</div>
          <div style={{ color: T.dim, fontSize: 14 }}>Contabilidad inteligente para autónomos y pymes en España</div>
        </div>

        <Card>
          <div style={{ display: "flex", background: T.navyLight, borderRadius: 10, padding: 4, marginBottom: 24, gap: 4 }}>
            {["login", "register"].map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{
                  flex: 1,
                  padding: "9px",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  background: mode === m ? T.amber : "transparent",
                  color: mode === m ? T.navy : T.dim,
                  fontWeight: 600,
                  fontSize: 13,
                  fontFamily: "'Inter',sans-serif",
                  transition: "all .2s",
                }}
              >
                {m === "login" ? "Iniciar sesión" : "Crear cuenta"}
              </button>
            ))}
          </div>

          <Input
            label="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="tu@email.es"
            type="email"
          />
          <Input
            label="Contraseña"
            value={pass}
            onChange={e => setPass(e.target.value)}
            placeholder="••••••••"
            type="password"
            hint={mode === "register" ? "Mínimo 8 caracteres" : undefined}
          />

          <Btn
            full
            onClick={handleAuth}
            disabled={loading}
            style={{ marginBottom: 12 }}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Spinner style={{ width: 16, height: 16, margin: 0 }} />
                {mode === "login" ? "Entrando..." : "Creando cuenta..."}
              </span>
            ) : mode === "login" ? "Entrar" : "Crear cuenta"}
          </Btn>

          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <span style={{ color: T.dim, fontSize: 13 }}>¿No tienes cuenta? </span>
            <button
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              style={{
                background: "none",
                border: "none",
                color: T.amber,
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              {mode === "login" ? "Regístrate gratis" : "Ya tengo cuenta"}
            </button>
          </div>

          <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 16, textAlign: "center" }}>
            <div style={{ color: T.dim, fontSize: 12, marginBottom: 10 }}>Demo sin Supabase configurado</div>
            <Btn variant="outline" full onClick={enterDemo}>
              🎯 Entrar en modo demo
            </Btn>
          </div>
        </Card>

        <div style={{ textAlign: "center", marginTop: 20, color: T.dim, fontSize: 11 }}>
          🔒 Datos cifrados · Servidores en Europa · RGPD compliant
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// STORAGE HELPER (Supabase + localStorage fallback)
// ════════════════════════════════════════════════════════════════════════════
const storage = {
  async save(table, data, token, isDemo) {
    if (isDemo) {
      // Guardar en localStorage con prefijo de usuario
      const key = `contaai_${table}`;
      const existing = JSON.parse(localStorage.getItem(key) || "[]");
      const updated = [...existing, { ...data, id: Date.now(), created_at: new Date().toISOString() }];
      localStorage.setItem(key, JSON.stringify(updated));
      return updated[updated.length - 1];
    }
    // Si tienes Supabase configurado
    return await sb.call(table, "POST", data, token);
  },

  async list(table, token, isDemo) {
    if (isDemo) {
      const key = `contaai_${table}`;
      return JSON.parse(localStorage.getItem(key) || "[]");
    }
    return await sb.call(table, "GET", null, token);
  },

  async delete(table, id, token, isDemo) {
    if (isDemo) {
      const key = `contaai_${table}`;
      const data = JSON.parse(localStorage.getItem(key) || "[]");
      const filtered = data.filter(item => item.id !== id);
      localStorage.setItem(key, JSON.stringify(filtered));
      return true;
    }
    return await sb.call(table, "DELETE", null, token, `?id=eq.${id}`);
  },
};

// ════════════════════════════════════════════════════════════════════════════
// SCREENS
// ════════════════════════════════════════════════════════════════════════════

function Dashboard({ plan, setScreen, txns, invoices, session }) {
  const income = txns.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const expense = Math.abs(txns.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0));
  const net = income - expense;
  const ivaAcobrar = income * FISCAL_ES.IVA_GENERAL;
  const ivaDed = expense * FISCAL_ES.IVA_GENERAL;

  const today = new Date();
  const month = today.getMonth() + 1;
  const trimestre = month <= 3 ? "1T" : month <= 6 ? "2T" : month <= 9 ? "3T" : "4T";
  const nextT = FISCAL_ES.TRIMESTRES.find(t => t.id === trimestre);

  const MONTHLY_DATA = [
    { month: "Ene", income: 9800, expense: 2100 },
    { month: "Feb", income: 12400, expense: 2800 },
    { month: "Mar", income: 11200, expense: 2400 },
    { month: "Abr", income: 15600, expense: 3100 },
    { month: "May", income, expense },
  ];

  return (
    <div className="fu">
      <div style={{
        background: T.amber + "12",
        border: `1px solid ${T.amber}33`,
        borderRadius: 12,
        padding: "12px 16px",
        marginBottom: 20,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}>
        <span style={{ fontSize: 20 }}>📅</span>
        <div>
          <span style={{ color: T.amber, fontWeight: 600, fontSize: 13 }}>Próximo vencimiento AEAT · {nextT?.label}</span>
          <span style={{ color: T.dim, fontSize: 12, marginLeft: 8 }}>Modelo 303 + 130 · vence {nextT?.vence}</span>
        </div>
        <Btn variant="outline" onClick={() => setScreen("fiscal")} style={{ marginLeft: "auto", padding: "6px 14px", fontSize: 12 }}>
          Ver modelos →
        </Btn>
      </div>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
        <StatCard label="Ingresos mayo" value={`${income.toLocaleString("es-ES")}€`} sub="↑ 4.8% vs abril" color={T.green} icon="📈" className="fu" />
        <StatCard label="Gastos mayo" value={`${expense.toLocaleString("es-ES")}€`} sub="Bajo presupuesto" color={T.red} icon="💸" className="fu1" />
        <StatCard label="Beneficio neto" value={`${net.toLocaleString("es-ES")}€`} sub={`Margen ${Math.round(net / income * 100)}%`} color={T.amber} icon="⚡" className="fu2" />
        <StatCard label="IVA a ingresar" value={`${(ivaAcobrar - ivaDed).toLocaleString("es-ES")}€`} sub="Este trimestre" color={T.blue} icon="🏛" className="fu3" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 16, marginBottom: 20 }}>
        <Card style={{ position: "relative" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div className="serif" style={{ fontSize: 16 }}>Flujo de caja 2025</div>
          </div>
          <BarChart data={MONTHLY_DATA} />
        </Card>

        <Card>
          <div className="serif" style={{ fontSize: 16, marginBottom: 14 }}>Acciones rápidas</div>
          {[
            { icon: "📄", label: "Nueva factura", action: () => setScreen("invoices"), color: T.amber },
            { icon: "💳", label: "Registrar gasto", action: () => setScreen("expenses"), color: T.blue },
            { icon: "🚗", label: "Log kilometraje", action: () => setScreen("mileage"), color: T.green },
            { icon: "🏛", label: "Modelo 303/130", action: () => setScreen("fiscal"), color: T.red },
          ].map((a, i) => (
            <button
              key={i}
              onClick={a.action}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                width: "100%",
                background: T.navyLight,
                border: `1px solid ${T.border}`,
                borderRadius: 10,
                padding: "11px 14px",
                cursor: "pointer",
                color: T.chalk,
                fontSize: 13,
                fontWeight: 500,
                textAlign: "left",
                transition: "all .18s",
                marginBottom: 8,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = a.color;
                e.currentTarget.style.background = a.color + "12";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = T.border;
                e.currentTarget.style.background = T.navyLight;
              }}
            >
              <span style={{ fontSize: 18 }}>{a.icon}</span>
              <span>{a.label}</span>
            </button>
          ))}
        </Card>
      </div>

      <Card>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div className="serif" style={{ fontSize: 16 }}>Últimos movimientos</div>
          <Btn variant="ghost" onClick={() => setScreen("transactions")}>Ver todos →</Btn>
        </div>
        {txns.slice(0, 5).map(t => (
          <div key={t.id} style={{
            display: "flex", alignItems: "center", gap: 14,
            padding: "10px 0", borderBottom: `1px solid ${T.border}22`
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 9, flexShrink: 0,
              background: t.type === "income" ? T.green + "18" : T.red + "18",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16
            }}>
              {t.type === "income" ? "↗" : "↙"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500 }}>{t.desc}</div>
              <div style={{ fontSize: 11, color: T.dim, marginTop: 2 }}>{t.date} · {t.cat}</div>
            </div>
            <Pill color={t.status === "cobrada" ? T.green : T.blue}>{t.status}</Pill>
            <div className="mono" style={{ color: t.type === "income" ? T.green : T.red, fontWeight: 600, minWidth: 80, textAlign: "right" }}>
              {t.amount > 0 ? "+" : ""}{Math.abs(t.amount).toLocaleString("es-ES")}€
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

function Transactions({ showToast, session }) {
  const [txns, setTxns] = useState([]);
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ desc: "", amount: "", type: "income", cat: "Consultoría", iva: "21" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await storage.list("transactions", session?.token, session?.isDemo);
      setTxns(data || []);
      setLoading(false);
    }
    loadData();
  }, [session]);

  const filtered = filter === "all" ? txns : txns.filter(t => t.type === filter);

  async function addTxn() {
    if (!form.desc || !form.amount) return;
    const amt = parseFloat(form.amount);
    const newTxn = {
      desc: form.desc,
      amount: form.type === "expense" ? -amt : amt,
      type: form.type,
      cat: form.cat,
      date: new Date().toISOString().slice(0, 10),
      iva: parseInt(form.iva),
      status: form.type === "income" ? "cobrada" : "deducible",
    };
    const saved = await storage.save("transactions", newTxn, session?.token, session?.isDemo);
    setTxns(p => [saved, ...p]);
    setShowModal(false);
    setForm({ desc: "", amount: "", type: "income", cat: "Consultoría", iva: "21" });
    showToast("Movimiento registrado ✓");
  }

  return (
    <div className="fu">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 className="serif" style={{ fontSize: 22 }}>↕ Movimientos</h2>
        <div style={{ display: "flex", gap: 8 }}>
          {["all", "income", "expense"].map(f => (
            <Btn key={f} variant={filter === f ? "primary" : "outline"} onClick={() => setFilter(f)} style={{ padding: "8px 14px", fontSize: 13 }}>
              {f === "all" ? "Todos" : f === "income" ? "Ingresos" : "Gastos"}
            </Btn>
          ))}
          <Btn onClick={() => setShowModal(true)}>+ Agregar</Btn>
        </div>
      </div>

      {loading ? (
        <Card style={{ textAlign: "center", padding: "40px" }}>
          <Spinner />
          <div style={{ color: T.dim, marginTop: 12 }}>Cargando movimientos...</div>
        </Card>
      ) : (
        <Card>
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px", color: T.dim }}>
              No hay movimientos aún. ¡Crea el primero!
            </div>
          ) : (
            filtered.map(t => (
              <div key={t.id} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "11px 12px", borderBottom: `1px solid ${T.border}22`,
                borderRadius: 10, transition: "background .15s"
              }}
                onMouseEnter={e => e.currentTarget.style.background = T.navyLight}
                onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <div style={{
                  width: 38, height: 38, borderRadius: 9, flexShrink: 0,
                  background: t.type === "income" ? T.green + "15" : T.red + "15",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16
                }}>
                  {t.type === "income" ? "💚" : "🔴"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>{t.desc}</div>
                  <div style={{ fontSize: 11, color: T.dim, marginTop: 2 }}>
                    {t.date} · <span style={{ color: T.amber }}>{t.cat}</span> · IVA {t.iva}%
                  </div>
                </div>
                <Pill color={t.status === "cobrada" ? T.green : T.blue}>{t.status}</Pill>
                <div className="mono" style={{ color: t.type === "income" ? T.green : T.red, fontWeight: 600, fontSize: 15, minWidth: 80, textAlign: "right" }}>
                  {t.amount > 0 ? "+" : ""}{Math.abs(t.amount).toLocaleString("es-ES")}€
                </div>
              </div>
            ))
          )}
        </Card>
      )}

      {showModal && (
        <Modal title="Nuevo movimiento" onClose={() => setShowModal(false)}>
          <Input label="Descripción" value={form.desc} onChange={e => setForm(p => ({ ...p, desc: e.target.value }))} placeholder="Ej: Cliente / Gasto" />
          <Input label="Importe (€)" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} type="number" prefix="€" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Sel label="Tipo" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} options={[{ value: "income", label: "Ingreso" }, { value: "expense", label: "Gasto" }]} />
            <Sel label="IVA" value={form.iva} onChange={e => setForm(p => ({ ...p, iva: e.target.value }))} options={[{ value: "21", label: "21%" }, { value: "10", label: "10%" }, { value: "0", label: "0%" }]} />
          </div>
          <Sel label="Categoría" value={form.cat} onChange={e => setForm(p => ({ ...p, cat: e.target.value }))} options={["Consultoría", "Desarrollo", "Diseño", "Software", "Oficina", "Kilometraje", "Dietas", "Otro"].map(c => ({ value: c, label: c }))} />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
            <Btn variant="outline" onClick={() => setShowModal(false)}>Cancelar</Btn>
            <Btn onClick={addTxn}>Guardar</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Invoices({ showToast, session }) {
  const [invoices, setInvoices] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ client: "", cif: "", concept: "", amount: "", iva: "21", irpf: "15", vence: "30" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await storage.list("invoices", session?.token, session?.isDemo);
      setInvoices(data || []);
      setLoading(false);
    }
    loadData();
  }, [session]);

  const baseAmt = parseFloat(form.amount) || 0;
  const ivaAmt = baseAmt * (parseInt(form.iva) / 100);
  const irpfAmt = baseAmt * (parseInt(form.irpf) / 100);
  const total = baseAmt + ivaAmt - irpfAmt;

  async function createInvoice() {
    if (!form.client || !form.amount) return;
    const today = new Date();
    const vence = new Date(today);
    vence.setDate(vence.getDate() + parseInt(form.vence));
    const newInv = {
      client: form.client,
      cif: form.cif,
      amount: baseAmt,
      iva: ivaAmt,
      irpf_ret: irpfAmt,
      total,
      status: "pendiente",
      date: today.toISOString().slice(0, 10),
      vence: vence.toISOString().slice(0, 10),
    };
    const saved = await storage.save("invoices", newInv, session?.token, session?.isDemo);
    setInvoices(p => [saved, ...p]);
    setShowModal(false);
    setForm({ client: "", cif: "", concept: "", amount: "", iva: "21", irpf: "15", vence: "30" });
    showToast(`Factura creada ✓`);
  }

  const statusColor = { cobrada: T.green, pendiente: T.amber, vencida: T.red };

  return (
    <div className="fu">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 className="serif" style={{ fontSize: 22 }}>📄 Facturación</h2>
        <Btn onClick={() => setShowModal(true)}>+ Nueva factura</Btn>
      </div>

      {loading ? (
        <Card style={{ textAlign: "center", padding: "40px" }}>
          <Spinner />
        </Card>
      ) : (
        <>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
            <StatCard label="Base imponible" value={`${invoices.reduce((s, i) => s + i.amount, 0).toLocaleString("es-ES")}€`} color={T.green} />
            <StatCard label="IVA repercutido" value={`${invoices.reduce((s, i) => s + i.iva, 0).toLocaleString("es-ES")}€`} color={T.amber} />
            <StatCard label="IRPF retenido" value={`${invoices.reduce((s, i) => s + i.irpf_ret, 0).toLocaleString("es-ES")}€`} color={T.blue} />
          </div>

          <Card>
            {invoices.length === 0 ? (
              <div style={{ textAlign: "center", padding: "30px", color: T.dim }}>
                No hay facturas aún. ¡Crea la primera!
              </div>
            ) : (
              invoices.map(inv => (
                <div key={inv.id} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "14px 12px", borderBottom: `1px solid ${T.border}22`,
                  transition: "background .15s", borderRadius: 10
                }}
                  onMouseEnter={e => e.currentTarget.style.background = T.navyLight}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4 }}>
                      <Pill color={statusColor[inv.status]}>{inv.status}</Pill>
                    </div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{inv.client}</div>
                    <div style={{ fontSize: 11, color: T.dim, marginTop: 2 }}>
                      Base: {inv.amount.toLocaleString("es-ES")}€ + IVA: {inv.iva.toLocaleString("es-ES")}€ − IRPF: {inv.irpf_ret.toLocaleString("es-ES")}€ = <span style={{ color: T.chalk, fontWeight: 600 }}>{inv.total.toLocaleString("es-ES")}€</span>
                    </div>
                  </div>
                  <Btn variant="ghost" onClick={() => showToast(`Factura descargada`)}>⬇ PDF</Btn>
                </div>
              ))
            )}
          </Card>
        </>
      )}

      {showModal && (
        <Modal title="Nueva Factura" onClose={() => setShowModal(false)}>
          <Input label="Cliente" value={form.client} onChange={e => setForm(p => ({ ...p, client: e.target.value }))} placeholder="Empresa / Persona" />
          <Input label="CIF/NIF" value={form.cif} onChange={e => setForm(p => ({ ...p, cif: e.target.value }))} placeholder="B12345678" />
          <Input label="Importe base" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} type="number" prefix="€" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Sel label="IVA" value={form.iva} onChange={e => setForm(p => ({ ...p, iva: e.target.value }))} options={[{ value: "21", label: "21%" }, { value: "10", label: "10%" }, { value: "0", label: "0%" }]} />
            <Sel label="Retención IRPF" value={form.irpf} onChange={e => setForm(p => ({ ...p, irpf: e.target.value }))} options={[{ value: "15", label: "15%" }, { value: "7", label: "7%" }, { value: "0", label: "0%" }]} />
          </div>
          {form.amount && (
            <div style={{ background: T.navy, borderRadius: 12, padding: 14, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
                <span>Base</span><span className="mono">{baseAmt.toFixed(2)}€</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
                <span>+ IVA {form.iva}%</span><span className="mono" style={{ color: T.amber }}>{ivaAmt.toFixed(2)}€</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
                <span>− IRPF {form.irpf}%</span><span className="mono" style={{ color: T.red }}>{irpfAmt.toFixed(2)}€</span>
              </div>
              <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 8, display: "flex", justifyContent: "space-between", fontWeight: 600, fontSize: 14 }}>
                <span>Total</span><span className="mono" style={{ color: T.green }}>{total.toFixed(2)}€</span>
              </div>
            </div>
          )}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn variant="outline" onClick={() => setShowModal(false)}>Cancelar</Btn>
            <Btn onClick={createInvoice}>Crear factura</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Expenses({ showToast, session }) {
  const [expenses, setExpenses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ desc: "", amount: "", cat: "Software" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await storage.list("expenses", session?.token, session?.isDemo);
      setExpenses(data || []);
      setLoading(false);
    }
    loadData();
  }, [session]);

  async function addExpense() {
    if (!form.desc || !form.amount) return;
    const newExp = {
      desc: form.desc,
      amount: -parseFloat(form.amount),
      cat: form.cat,
      date: new Date().toISOString().slice(0, 10),
      status: "deducible",
    };
    const saved = await storage.save("expenses", newExp, session?.token, session?.isDemo);
    setExpenses(p => [saved, ...p]);
    setShowModal(false);
    setForm({ desc: "", amount: "", cat: "Software" });
    showToast("Gasto registrado ✓");
  }

  return (
    <div className="fu">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 className="serif" style={{ fontSize: 22 }}>💳 Gastos</h2>
        <Btn onClick={() => setShowModal(true)}>+ Agregar</Btn>
      </div>

      {loading ? (
        <Card style={{ textAlign: "center", padding: "40px" }}>
          <Spinner />
        </Card>
      ) : (
        <Card>
          {expenses.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px", color: T.dim }}>
              No hay gastos registrados.
            </div>
          ) : (
            expenses.map(e => (
              <div key={e.id} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "11px", borderRadius: 10, background: T.navyLight, marginBottom: 8
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{e.desc}</div>
                  <div style={{ fontSize: 11, color: T.dim, marginTop: 2 }}>{e.date} · {e.cat}</div>
                </div>
                <div className="mono" style={{ color: T.red, fontSize: 14, fontWeight: 600 }}>
                  {Math.abs(e.amount).toLocaleString("es-ES")}€
                </div>
              </div>
            ))
          )}
        </Card>
      )}

      {showModal && (
        <Modal title="Nuevo Gasto" onClose={() => setShowModal(false)}>
          <Input label="Descripción" value={form.desc} onChange={e => setForm(p => ({ ...p, desc: e.target.value }))} placeholder="Ej: Adobe CC" />
          <Input label="Importe" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} type="number" prefix="€" />
          <Sel label="Categoría" value={form.cat} onChange={e => setForm(p => ({ ...p, cat: e.target.value }))} options={["Software", "Oficina", "Kilometraje", "Dietas", "Otro"].map(c => ({ value: c, label: c }))} />
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn variant="outline" onClick={() => setShowModal(false)}>Cancelar</Btn>
            <Btn onClick={addExpense}>Guardar</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Mileage({ showToast, session }) {
  const [logs, setLogs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ dest: "", km: "", purpose: "Visita cliente" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const data = await storage.list("mileage", session?.token, session?.isDemo);
      setLogs(data || []);
      setLoading(false);
    }
    loadData();
  }, [session]);

  async function addLog() {
    if (!form.dest || !form.km) return;
    const km = parseFloat(form.km);
    const deduction = parseFloat((km * FISCAL_ES.DEDUCCION_KM).toFixed(2));
    const newLog = {
      dest: form.dest,
      km,
      deduction,
      purpose: form.purpose,
      date: new Date().toISOString().slice(0, 10),
    };
    const saved = await storage.save("mileage", newLog, session?.token, session?.isDemo);
    setLogs(p => [saved, ...p]);
    setShowModal(false);
    setForm({ dest: "", km: "", purpose: "Visita cliente" });
    showToast("Kilometraje registrado ✓");
  }

  const totalKm = logs.reduce((s, l) => s + l.km, 0);
  const totalDed = logs.reduce((s, l) => s + l.deduction, 0);

  return (
    <div className="fu">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 className="serif" style={{ fontSize: 22 }}>🚗 Kilometraje</h2>
        <Btn onClick={() => setShowModal(true)}>+ Registrar viaje</Btn>
      </div>

      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
        <StatCard label="Km totales" value={`${totalKm} km`} color={T.green} />
        <StatCard label="Deducción total" value={`${totalDed.toFixed(2)}€`} sub="@ 0,26€/km AEAT" color={T.amber} />
      </div>

      {loading ? (
        <Card style={{ textAlign: "center", padding: "40px" }}>
          <Spinner />
        </Card>
      ) : (
        <Card>
          {logs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "30px", color: T.dim }}>
              No hay viajes registrados.
            </div>
          ) : (
            logs.map(l => (
              <div key={l.id} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "12px", borderRadius: 10, background: T.navyLight, marginBottom: 8
              }}>
                <div style={{ fontSize: 26 }}>🚗</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{l.dest}</div>
                  <div style={{ color: T.dim, fontSize: 11, marginTop: 2 }}>{l.date} · {l.purpose}</div>
                </div>
                <div className="mono" style={{ textAlign: "right" }}>
                  <div style={{ color: T.chalk, fontSize: 15 }}>{l.km} km</div>
                  <div style={{ color: T.green, fontSize: 12 }}>−{l.deduction.toFixed(2)}€</div>
                </div>
              </div>
            ))
          )}
        </Card>
      )}

      {showModal && (
        <Modal title="Nuevo viaje" onClose={() => setShowModal(false)}>
          <Input label="Destino" value={form.dest} onChange={e => setForm(p => ({ ...p, dest: e.target.value }))} placeholder="Ej: Madrid" />
          <Input label="Kilómetros" value={form.km} onChange={e => setForm(p => ({ ...p, km: e.target.value }))} type="number" />
          <Sel label="Propósito" value={form.purpose} onChange={e => setForm(p => ({ ...p, purpose: e.target.value }))} options={["Visita cliente", "Reunión", "Gestión", "Otro"].map(c => ({ value: c, label: c }))} />
          {form.km && (
            <div style={{ background: T.navyLight, borderRadius: 10, padding: 12, marginBottom: 16 }}>
              <div style={{ color: T.green, fontSize: 14, fontWeight: 600 }}>
                Deducción: {(parseFloat(form.km || 0) * 0.26).toFixed(2)}€
              </div>
            </div>
          )}
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <Btn variant="outline" onClick={() => setShowModal(false)}>Cancelar</Btn>
            <Btn onClick={addLog}>Guardar</Btn>
          </div>
        </Modal>
      )}
    </div>
  );
}

function FiscalReport() {
  const [trimestre, setTrimestre] = useState("2T");

  return (
    <div className="fu">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 className="serif" style={{ fontSize: 22 }}>🏛 Modelos Fiscales</h2>
        <select
          value={trimestre}
          onChange={e => setTrimestre(e.target.value)}
          style={{
            background: T.navyLight,
            border: `1px solid ${T.border}`,
            borderRadius: 10,
            color: T.chalk,
            padding: "8px 14px",
            fontSize: 13,
            fontFamily: "'Inter',sans-serif",
          }}
        >
          {FISCAL_ES.TRIMESTRES.map(t => (
            <option key={t.id} value={t.id}>{t.label}</option>
          ))}
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {[
          { name: "Modelo 303", desc: "IVA trimestral", icon: "🏛", color: T.amber },
          { name: "Modelo 130", desc: "Pago IRPF", icon: "📋", color: T.blue },
          { name: "Cuota SS", desc: "Autónomos", icon: "🛡", color: T.green },
        ].map(m => (
          <Card key={m.name} glow={m.color + "33"}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{m.icon}</div>
            <div style={{ color: m.color, fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{m.name}</div>
            <div style={{ color: T.dim, fontSize: 12 }}>{m.desc}</div>
          </Card>
        ))}
      </div>

      <div style={{ marginTop: 20, textAlign: "center", color: T.dim }}>
        <p>Conecta tu Supabase para guardar borradores y presentaciones de modelos fiscales.</p>
      </div>
    </div>
  );
}

function Settings({ session, onLogout, showToast }) {
  return (
    <div className="fu">
      <h2 className="serif" style={{ fontSize: 22, marginBottom: 20 }}>⚙️ Configuración</h2>

      <Card style={{ marginBottom: 16 }}>
        <div className="serif" style={{ fontSize: 16, marginBottom: 14 }}>👤 Mi cuenta</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontWeight: 600 }}>{session?.email}</div>
            <div style={{ color: T.dim, fontSize: 12, marginTop: 2 }}>
              {session?.isDemo ? "Modo demo — datos en localStorage" : "Conectado a Supabase"}
            </div>
          </div>
          <Btn variant="danger" onClick={() => { onLogout(); showToast("Sesión cerrada"); }}>
            Cerrar sesión
          </Btn>
        </div>
      </Card>

      <Card>
        <div className="serif" style={{ fontSize: 16, marginBottom: 14 }}>🗄 Almacenamiento</div>
        <div style={{ color: T.dim, lineHeight: 1.7, fontSize: 13 }}>
          <p style={{ marginBottom: 10 }}>
            📱 <strong>Modo Demo:</strong> Los datos se guardan en el almacenamiento local del navegador (localStorage).
          </p>
          <p style={{ marginBottom: 10 }}>
            ☁️ <strong>Modo Supabase:</strong> Para guardar datos en la nube, necesitas configurar tu proyecto en supabase.com
          </p>
          <p>
            Una vez tengas tu proyecto, reemplaza las variables SUPABASE_URL y SUPABASE_KEY en el código para sincronizar con la base de datos.
          </p>
        </div>
      </Card>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// APP ROOT
// ════════════════════════════════════════════════════════════════════════════
const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "⚡" },
  { id: "invoices", label: "Facturación", icon: "📄" },
  { id: "transactions", label: "Movimientos", icon: "↕" },
  { id: "expenses", label: "Gastos", icon: "💳" },
  { id: "mileage", label: "Kilometraje", icon: "🚗" },
  { id: "fiscal", label: "Modelos AEAT", icon: "🏛" },
  { id: "settings", label: "Configuración", icon: "⚙️" },
];

export default function App() {
  const [session, setSession] = useState(null);
  const [screen, setScreen] = useState("dashboard");
  const [toast, setToast] = useState(null);
  const [txns, setTxns] = useState([]);
  const [invoices, setInvoices] = useState([]);

  function showToast(msg, color = T.green) {
    setToast({ msg, color });
  }

  useEffect(() => {
    async function loadDashboardData() {
      if (session) {
        const t = await storage.list("transactions", session?.token, session?.isDemo);
        const i = await storage.list("invoices", session?.token, session?.isDemo);
        setTxns(t || []);
        setInvoices(i || []);
      }
    }
    loadDashboardData();
  }, [session]);

  if (!session) {
    return (
      <>
        <InjectStyle css={CSS} />
        <AuthScreen onAuth={s => { setSession(s); }} showToast={showToast} />
        {toast && <Toast msg={toast.msg} color={toast.color} onClose={() => setToast(null)} />}
      </>
    );
  }

  const SCREENS = {
    dashboard: <Dashboard plan="free" setScreen={setScreen} txns={txns} invoices={invoices} session={session} />,
    invoices: <Invoices showToast={showToast} session={session} />,
    transactions: <Transactions showToast={showToast} session={session} />,
    expenses: <Expenses showToast={showToast} session={session} />,
    mileage: <Mileage showToast={showToast} session={session} />,
    fiscal: <FiscalReport />,
    settings: <Settings session={session} onLogout={() => setSession(null)} showToast={showToast} />,
  };

  return (
    <>
      <InjectStyle css={CSS} />
      <div style={{ display: "flex", minHeight: "100vh" }}>
        {/* SIDEBAR */}
        <div style={{
          width: 220,
          flexShrink: 0,
          background: T.navyMid,
          borderRight: `1px solid ${T.border}`,
          display: "flex",
          flexDirection: "column",
          padding: "24px 0",
        }}>
          <div style={{ padding: "0 20px 24px" }}>
            <div className="serif" style={{ fontSize: 22, color: T.amber }}>ContaAI</div>
            <div style={{ fontSize: 11, color: T.dim, marginTop: 2 }}>España · Sin Stripe</div>
          </div>

          <div style={{ padding: "0 12px 16px" }}>
            <div style={{
              background: T.amber + "15",
              border: `1px solid ${T.amber}44`,
              borderRadius: 10,
              padding: "8px 12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}>
              <span style={{ fontSize: 12, color: T.dim }}>Usuario</span>
              <span style={{ color: T.amber, fontWeight: 700, fontSize: 12 }}>
                {session?.isDemo ? "DEMO" : "SUPABASE"}
              </span>
            </div>
          </div>

          <nav style={{ flex: 1, padding: "0 12px" }}>
            {NAV.map(item => {
              const active = screen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setScreen(item.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    width: "100%",
                    padding: "10px 12px",
                    marginBottom: 3,
                    background: active ? T.amber + "18" : "transparent",
                    border: `1px solid ${active ? T.amber + "44" : "transparent"}`,
                    borderRadius: 10,
                    cursor: "pointer",
                    color: active ? T.amber : T.dim,
                    fontFamily: "'Inter',sans-serif",
                    fontWeight: active ? 600 : 400,
                    fontSize: 13,
                    textAlign: "left",
                    transition: "all .15s",
                  }}
                  onMouseEnter={e => {
                    if (!active) e.currentTarget.style.background = T.navyLight;
                  }}
                  onMouseLeave={e => {
                    if (!active) e.currentTarget.style.background = "transparent";
                  }}
                >
                  <span style={{ fontSize: 15 }}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* MAIN */}
        <div style={{
          flex: 1,
          padding: "28px 32px",
          overflowY: "auto",
          maxHeight: "100vh",
          background: `radial-gradient(ellipse at 80% 0%, ${T.amber}04 0%, transparent 50%), ${T.navy}`,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
            <div>
              <div className="serif" style={{ fontSize: 26 }}>
                {NAV.find(n => n.id === screen)?.icon} {NAV.find(n => n.id === screen)?.label}
              </div>
              <div style={{ color: T.dim, fontSize: 12, marginTop: 2 }}>
                {new Date().toLocaleDateString("es-ES", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </div>
            </div>
            <button
              onClick={() => setScreen("settings")}
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: T.amber + "20",
                border: `1px solid ${T.amber}44`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: T.amber,
                fontSize: 16,
                cursor: "pointer",
              }}
            >
              👤
            </button>
          </div>

          {SCREENS[screen]}
        </div>
      </div>

      {toast && <Toast msg={toast.msg} color={toast.color} onClose={() => setToast(null)} />}
    </>
  );
}