import { useState } from 'react'
import { Coffee, Moon, Sun, Mail, Lock, Store, Loader2, ShieldAlert } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useStore } from '../store'

export default function LoginPage() {
  const { login, loading, error } = useAuth()
  const { isDarkMode, setIsDarkMode, platform, setCurrentUser } = useStore()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    await login(email, password)
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-4 pt-10 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="bg-white dark:bg-slate-800 p-8 md:p-10 rounded-3xl shadow-2xl w-full max-w-md border-t-8 border-indigo-600 z-10 relative">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-indigo-50 dark:bg-indigo-900/50 p-3 rounded-2xl shrink-0">
              {platform?.logoUrl
                ? <img src={platform.logoUrl} alt="logo" className="w-10 h-10 object-contain" onError={e => e.target.style.display='none'} />
                : <Coffee size={36} className="text-indigo-600" />
              }
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-800 dark:text-slate-100">
                {platform?.appName || 'كوفي ERP'}
              </h1>
              <p className="text-slate-500 font-bold text-sm">بوابة النظام الموحدة</p>
            </div>
          </div>
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2.5 bg-slate-100 dark:bg-slate-700 rounded-xl text-slate-500 hover:text-indigo-600 transition-colors">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        {/* Digital Menu Button */}
        <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setCurrentUser({ role: 'customer' })}
            className="w-full bg-emerald-50 hover:bg-emerald-600 text-emerald-600 hover:text-white dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-600 dark:hover:text-white font-black py-4 rounded-xl transition-all text-lg flex justify-center items-center gap-2"
          >
            <Store size={22} /> تصفح المنيو الرقمي
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-sm font-bold rounded-xl flex items-center gap-2 border border-rose-100 dark:border-rose-800">
            <ShieldAlert size={18} className="shrink-0" /> {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm font-bold text-slate-600 dark:text-slate-400">تسجيل دخول الموظفين</p>

          <div className="relative">
            <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
            <input
              required type="email" value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="البريد الإلكتروني"
              dir="ltr" autoComplete="email"
              className="w-full p-4 pr-12 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-indigo-500 text-slate-800 dark:text-white font-bold text-sm transition-colors"
            />
          </div>

          <div className="relative">
            <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
            <input
              required type="password" value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="كلمة المرور"
              autoComplete="current-password"
              className="w-full p-4 pr-12 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl outline-none focus:border-indigo-500 text-slate-800 dark:text-white font-bold tracking-widest transition-colors"
            />
          </div>

          <button
            type="submit" disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-indigo-600/30 text-lg flex items-center justify-center gap-2"
          >
            {loading && <Loader2 size={20} className="animate-spin" />}
            تسجيل الدخول
          </button>
        </form>

      </div>
    </div>
  )
}
