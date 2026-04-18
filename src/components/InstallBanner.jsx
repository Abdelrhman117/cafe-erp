import { useState } from 'react'
import { Download, X, Smartphone, Monitor } from 'lucide-react'
import { usePWA } from '../hooks/usePWA'

export default function InstallBanner() {
  const { canInstall, install, isInstalled, isIOS } = usePWA()
  const [dismissed, setDismissed] = useState(
    () => sessionStorage.getItem('pwa_dismissed') === '1'
  )

  const dismiss = () => {
    sessionStorage.setItem('pwa_dismissed', '1')
    setDismissed(true)
  }

  // Already installed or dismissed
  if (isInstalled || dismissed) return null

  // iOS — show manual instructions
  if (isIOS) return (
    <div className="fixed bottom-4 left-4 right-4 z-[200] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-indigo-200 dark:border-indigo-800 p-4 flex items-start gap-3">
      <Smartphone size={20} className="text-indigo-500 shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="font-black text-slate-800 dark:text-white text-sm">تثبيت التطبيق على iPhone</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-bold">
          اضغط <strong>Share</strong> ثم <strong>"Add to Home Screen"</strong> من Safari
        </p>
      </div>
      <button onClick={dismiss} className="text-slate-400 hover:text-rose-500 transition-colors p-1">
        <X size={16} />
      </button>
    </div>
  )

  // Chrome/Edge — show install button
  if (!canInstall) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:w-80 z-[200] bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-indigo-200 dark:border-indigo-800 overflow-hidden">
      <div className="bg-indigo-600 px-4 py-2 flex justify-between items-center">
        <span className="text-white font-black text-sm flex items-center gap-2">
          <Monitor size={15} /> تثبيت كتطبيق
        </span>
        <button onClick={dismiss} className="text-indigo-200 hover:text-white transition-colors">
          <X size={15} />
        </button>
      </div>
      <div className="p-4">
        <p className="text-sm text-slate-600 dark:text-slate-300 font-bold mb-3">
          ثبّت النظام على جهازك للعمل بدون إنترنت وبشكل أسرع
        </p>
        <div className="flex gap-2 text-xs text-slate-500 dark:text-slate-400 font-bold mb-4">
          <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-lg">⚡ أسرع</span>
          <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-lg">📵 أوفلاين</span>
          <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-lg">🖥️ سطح المكتب</span>
        </div>
        <button
          onClick={install}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-black flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-600/20"
        >
          <Download size={16} /> تثبيت الآن
        </button>
      </div>
    </div>
  )
}
