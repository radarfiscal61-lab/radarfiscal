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
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-cyan-500 selection:text-white flex flex-col">
      {/* Header */}
      <header className="border-b border-slate-800 backdrop-blur-md fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Radar Fiscal" className="h-8 w-8" />
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              RADAR FISCAL
            </span>
          </div>
          <nav>
            <a href="#" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Login</a>
          </nav>
        </div>
      </header>

      {/* Hero Centrado */}
      <main className="flex-grow flex items-center justify-center px-6 pt-24 pb-12 relative overflow-hidden">
        {/* Background Gradients (Decorativo) */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl w-full mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            SISTEMA ACTIVO | SAT 2026 READY
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
            Detecta Riesgos Fiscales <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-100 to-white">
              antes que el SAT.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Auditoría preventiva automatizada. Sube tus XMLs y detecta EFOS, errores de deducibilidad y discrepancias en segundos.
            <span className="block mt-4 text-slate-500 text-sm font-medium tracking-wide border-t border-slate-800/50 pt-4 mx-auto w-fit px-6">
              *Tu información nunca sale de tu navegador.*
            </span>
          </p>

          {/* Lead Capture Micro-Form Responsive */}
          {!submitted ? (
            <form onSubmit={handleSubmit} className="max-w-lg mx-auto flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <input
                type="email"
                required
                placeholder="Ingresa tu correo profesional"
                className="w-full bg-slate-800/80 border border-slate-700 text-white rounded-lg px-4 py-3.5 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all placeholder:text-slate-500 text-center sm:text-left shadow-lg backdrop-blur-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto whitespace-nowrap bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold px-8 py-3.5 rounded-lg transition-all shadow-[0_0_20px_rgba(59,130,246,0.25)] hover:shadow-[0_0_30px_rgba(59,130,246,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
              >
                {loading ? 'Conectando...' : 'Auditar Ahora'}
              </button>
            </form>
          ) : (
            <div className="max-w-md mx-auto bg-green-500/10 border border-green-500/20 text-green-400 p-6 rounded-xl animate-fade-in shadow-2xl backdrop-blur-sm">
              <p className="font-bold text-lg mb-1">¡Registro exitoso!</p>
              <p className="text-sm opacity-90">El sistema de auditoría se está inicializando...</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer Centrado */}
      <footer className="border-t border-slate-800 bg-slate-900/50 backdrop-blur-sm py-8 text-center text-slate-600 text-sm">
        <div className="max-w-7xl mx-auto px-6">
          <p>© 2026 Radar Fiscal. Tecnología de Mentores Estratégicos.</p>
          <div className="flex justify-center gap-6 mt-4">
            <a href="#" className="hover:text-cyan-400 transition-colors">Privacidad</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Términos</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
