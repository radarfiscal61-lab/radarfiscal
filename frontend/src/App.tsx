import { useState } from 'react'

function App() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simular conexión a producción
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    try {
      const res = await fetch(`${API_URL}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          full_name: 'Lead Web',
          risk_score_captured: 0 // Mock por ahora
        })
      });

      if (res.ok) {
        setSubmitted(true)
      } else {
        alert('Error al conectar con el servidor.')
      }
    } catch (err) {
      console.error(err)
      alert('Error de red. Verifica tu conexión.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-cyan-500 selection:text-white">
      {/* Header */}
      <header className="border-b border-slate-800 backdrop-blur-md fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Radar Fiscal" className="h-8 w-8" />
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              RADAR FISCAL
            </span>
          </div>
          <nav>
            <a href="#" className="text-sm text-slate-400 hover:text-white transition-colors">Login</a>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="pt-32 pb-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            SISTEMA ACTIVO | SAT 2026 READY
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
            Detecta Riesgos Fiscales <br />
            <span className="text-white">antes que el SAT.</span>
          </h1>

          <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
            Auditoría preventiva automatizada. Sube tus XMLs y detecta EFOS, errores de deducibilidad y discrepancias en segundos.
            <span className="block mt-2 text-slate-500 text-sm">*Tu información nunca sale de tu navegador.*</span>
          </p>

          {/* Lead Capture Micro-Form */}
          {!submitted ? (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto flex gap-2">
              <input
                type="email"
                required
                placeholder="Ingresa tu correo profesional"
                className="flex-1 bg-slate-800 border-slate-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all placeholder:text-slate-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-lg transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Conectando...' : 'Auditar Ahora'}
              </button>
            </form>
          ) : (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-4 rounded-lg animate-fade-in">
              <p className="font-semibold">¡Registro exitoso!</p>
              <p className="text-sm opacity-80">El sistema de auditoría se está inicializando...</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-20 py-8 text-center text-slate-600 text-sm">
        <p>© 2026 Radar Fiscal. Tecnología de Mentores Estratégicos.</p>
        <div className="flex justify-center gap-4 mt-4">
          <a href="#" className="hover:text-slate-400">Privacidad</a>
          <a href="#" className="hover:text-slate-400">Términos</a>
        </div>
      </footer>
    </div>
  )
}

export default App
