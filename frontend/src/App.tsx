import { useState, useEffect } from 'react'

function App() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Auto-hide error after 5 seconds
  useEffect(() => {
    if (errorMsg) {
      const timer = setTimeout(() => setErrorMsg(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [errorMsg])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null) // Clear previous errors

    // Fallback inteligente: Si no hay ENV, intenta la URL probable de Render por defecto
    const API_URL = import.meta.env.VITE_API_URL || 'https://radarfiscal.onrender.com';

    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000) // 10s timeout timeout

      const res = await fetch(`${API_URL}/api/leads`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          full_name: 'Lead Web',
          risk_score_captured: 0
        }),
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!res.ok) {
        throw new Error(`Error del servidor (${res.status})`)
      }

      setSubmitted(true)
    } catch (err: any) {
      console.error(err)
      if (err.name === 'AbortError') {
        setErrorMsg('La conexión tardó demasiado. Intenta de nuevo.')
      } else {
        setErrorMsg('No se pudo conectar con el servidor de auditoría. Verifica tu internet.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-slate-900 text-white font-sans selection:bg-cyan-500 selection:text-white overflow-hidden">

      {/* Toast Error Notification (Fixed, no layout shift) */}
      {errorMsg && (
        <div className="fixed top-24 right-6 z-50 max-w-sm w-full animate-fade-in-down">
          <div className="bg-red-500/10 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg shadow-2xl backdrop-blur-md flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className="text-sm font-medium">{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="ml-auto text-red-400 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Header (Absolute to allow Hero centering relative to viewport) */}
      <header className="absolute top-0 left-0 w-full z-40 border-b border-slate-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="Radar Fiscal" className="h-9 w-9" />
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              RADAR FISCAL
            </span>
          </div>
          <nav>
            <a href="#" className="text-sm font-medium text-slate-400 hover:text-white transition-colors">Login</a>
          </nav>
        </div>
      </header>

      {/* Main Layout Container - Flex Center Perfect */}
      <main className="min-h-screen flex items-center justify-center relative px-6 py-20">

        {/* Background Gradients */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] opacity-30 animate-pulse-slow"></div>
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[100px] opacity-20"></div>
        </div>

        {/* Content Box */}
        <div className="w-full max-w-5xl mx-auto text-center relative z-10">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-8 mx-auto">
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

          {/* Form Area */}
          <div className="max-w-xl mx-auto">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="Ingresa tu correo profesional"
                    className="w-full bg-slate-800/80 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-4 focus:ring-2 focus:ring-cyan-500 focus:outline-none transition-all placeholder:text-slate-500 text-center sm:text-left shadow-lg backdrop-blur-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="whitespace-nowrap bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-bold px-8 py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] disabled:opacity-70 disabled:grayscale transform active:scale-95 flex items-center justify-center gap-2 min-w-[160px]"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Procesando</span>
                    </>
                  ) : 'Auditar Ahora'}
                </button>
              </form>
            ) : (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-6 rounded-xl animate-fade-in shadow-2xl backdrop-blur-sm">
                <div className="flex flex-col items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-500 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="font-bold text-xl">¡Solicitud Recibida!</p>
                  <p className="text-sm opacity-80">Estamos inicializando tu entorno de riesgo...</p>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Footer (Absolute bottom) */}
      <footer className="absolute bottom-4 left-0 w-full text-center text-slate-600 text-sm z-40">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center bg-slate-900/50 backdrop-blur-sm py-4 rounded-t-xl md:rounded-full md:px-8">
          <p>© 2026 Radar Fiscal. </p>
          <div className="flex gap-6 mt-2 md:mt-0">
            <a href="#" className="hover:text-cyan-400 transition-colors">Privacidad</a>
            <a href="#" className="hover:text-cyan-400 transition-colors">Términos</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
