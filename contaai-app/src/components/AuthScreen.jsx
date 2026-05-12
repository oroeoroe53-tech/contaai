import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function AuthScreen({ onAuth, showToast }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) { 
          showToast('Error: ' + error.message, '#ef4444')
          setLoading(false)
          return 
        }
        onAuth({ email: data.user.email, token: data.session.access_token, isDemo: false })
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) { 
          showToast('Error: ' + error.message, '#ef4444')
          setLoading(false)
          return 
        }
        // Loguearse automáticamente después de registrarse
        const { data: loginData } = await supabase.auth.signInWithPassword({ email, password })
        onAuth({ email: loginData.user.email, token: loginData.session.access_token, isDemo: false })
      }
    } catch (err) {
      showToast('Error: ' + err.message, '#ef4444')
    }
    setLoading(false)
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
  }

  function handleDemo() {
    onAuth({ email: 'demo@contaai.app', token: null, isDemo: true })
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0f1e', padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 380, background: '#111827', border: '1px solid #1e2d45', borderRadius: 20, padding: 32 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#f59e0b', fontFamily: 'Georgia, serif' }}>ContaAI</div>
          <div style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>Finanzas inteligentes para España</div>
        </div>

        <div style={{ display: 'flex', background: '#0a0f1e', borderRadius: 10, padding: 4, marginBottom: 24 }}>
          {['login', 'register'].map(m => (
            <button key={m} onClick={() => setMode(m)}
              style={{ flex: 1, padding: '8px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600,
                background: mode === m ? '#f59e0b' : 'transparent',
                color: mode === m ? '#0a0f1e' : '#64748b' }}>
              {m === 'login' ? 'Entrar' : 'Registrarse'}
            </button>
          ))}
        </div>

        <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
          style={{ width: '100%', padding: '12px 14px', background: '#0a0f1e', border: '1px solid #1e2d45', borderRadius: 10, color: '#e2e8f0', fontSize: 14, marginBottom: 10, boxSizing: 'border-box' }} />
        <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)}
          style={{ width: '100%', padding: '12px 14px', background: '#0a0f1e', border: '1px solid #1e2d45', borderRadius: 10, color: '#e2e8f0', fontSize: 14, marginBottom: 16, boxSizing: 'border-box' }} />

        <button onClick={handleSubmit} disabled={loading}
          style={{ width: '100%', padding: '12px', background: '#f59e0b', border: 'none', borderRadius: 10, color: '#0a0f1e', fontWeight: 700, fontSize: 15, cursor: 'pointer', marginBottom: 10 }}>
          {loading ? 'Cargando...' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
        </button>

        <button onClick={handleGoogle}
          style={{ width: '100%', padding: '12px', background: 'transparent', border: '1px solid #1e2d45', borderRadius: 10, color: '#e2e8f0', fontSize: 14, cursor: 'pointer', marginBottom: 10 }}>
          🔵 Continuar con Google
        </button>

        <button onClick={handleDemo}
          style={{ width: '100%', padding: '10px', background: 'transparent', border: 'none', color: '#64748b', fontSize: 13, cursor: 'pointer' }}>
          Probar en modo demo →
        </button>
      </div>
    </div>
  )
}
