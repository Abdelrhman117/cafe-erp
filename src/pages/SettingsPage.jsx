import { useState, useRef } from 'react'
import { Settings, Upload, ImageIcon, Coffee, RefreshCw, Monitor,
         CheckCircle, Palette, Type, Download } from 'lucide-react'
import { useStore } from '../store'
import { usePWA } from '../hooks/usePWA'
import { Btn, Input } from '../components/UI'

// ── Convert image file to base64 ──────────────────────────
function fileToBase64(file) {
  return new Promise((res, rej) => {
    const reader = new FileReader()
    reader.onload  = () => res(reader.result)
    reader.onerror = rej
    reader.readAsDataURL(file)
  })
}

// ── Resize image to max 256px ─────────────────────────────
function resizeImage(base64, maxSize = 256) {
  return new Promise((res) => {
    const img = new Image()
    img.onload = () => {
      const ratio  = Math.min(maxSize / img.width, maxSize / img.height, 1)
      const canvas = document.createElement('canvas')
      canvas.width  = img.width  * ratio
      canvas.height = img.height * ratio
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      res(canvas.toDataURL('image/png', 0.9))
    }
    img.src = base64
  })
}

export default function SettingsPage() {
  const { platform, savePlatformField, currentUser } = useStore()
  const { canInstall, install, isInstalled, isIOS }  = usePWA()

  const [appName,    setAppName]    = useState(platform?.appName    || '')
  const [logoUrl,    setLogoUrl]    = useState(platform?.logoUrl    || '')
  const [themeColor, setThemeColor] = useState(platform?.themeColor || '#4f46e5')
  const [saving,     setSaving]     = useState(false)
  const [saved,      setSaved]      = useState(false)
  const [uploading,  setUploading]  = useState(false)
  const [preview,    setPreview]    = useState(platform?.logoUrl    || '')

  const fileRef = useRef()

  // ── Upload local image (convert to base64) ────────────────
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) { alert('الحجم الأقصى 2MB'); return }
    setUploading(true)
    try {
      const b64     = await fileToBase64(file)
      const resized = await resizeImage(b64, 256)
      setPreview(resized)
      setLogoUrl(resized)
    } finally {
      setUploading(false)
    }
  }

  // ── Save settings ─────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    await savePlatformField({ appName, logoUrl, themeColor })
    // Update PWA theme-color meta tag dynamically
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', themeColor)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const clearLogo = () => { setPreview(''); setLogoUrl('') }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Settings className="text-indigo-600 w-8 h-8" />
        <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white">إعدادات المنصة</h2>
      </div>

      <form onSubmit={handleSave} className="space-y-6">

        {/* ── App Name ──────────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
          <h3 className="font-black text-lg text-slate-800 dark:text-white flex items-center gap-2">
            <Type size={18} className="text-indigo-500" /> اسم التطبيق
          </h3>
          <Input
            label="الاسم الذي يظهر في الهيدر وشاشة الدخول"
            value={appName}
            onChange={e => setAppName(e.target.value)}
            placeholder="كوفي ERP"
          />
          {/* Live preview */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
            {preview
              ? <img src={preview} alt="logo" className="w-8 h-8 rounded-lg object-contain" />
              : <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg flex items-center justify-center"><Coffee size={16} className="text-indigo-600" /></div>
            }
            <span className="font-black text-slate-800 dark:text-white">{appName || 'كوفي ERP'}</span>
          </div>
        </div>

        {/* ── Logo ──────────────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
          <h3 className="font-black text-lg text-slate-800 dark:text-white flex items-center gap-2">
            <ImageIcon size={18} className="text-indigo-500" /> اللوجو
          </h3>

          {/* Upload zone */}
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-indigo-300 dark:border-indigo-700 rounded-2xl p-8 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
          >
            {uploading ? (
              <RefreshCw className="w-8 h-8 text-indigo-500 mx-auto animate-spin mb-2" />
            ) : preview ? (
              <img src={preview} alt="logo preview" className="w-20 h-20 object-contain mx-auto mb-2 rounded-xl" />
            ) : (
              <Upload className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
            )}
            <p className="font-bold text-slate-600 dark:text-slate-400 text-sm">
              {uploading ? 'جاري الرفع...' : 'اضغط لاختيار صورة (PNG, JPG, SVG)'}
            </p>
            <p className="text-xs text-slate-400 mt-1">الحجم الأقصى 2MB — يُضغط تلقائياً إلى 256×256</p>
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />

          {/* URL input */}
          <div>
            <label className="block text-sm font-black mb-1.5 text-slate-600 dark:text-slate-400">أو أدخل رابط اللوجو مباشرة</label>
            <div className="flex gap-2">
              <input
                type="url" value={logoUrl.startsWith('data:') ? '' : logoUrl} dir="ltr"
                onChange={e => { setLogoUrl(e.target.value); setPreview(e.target.value) }}
                placeholder="https://example.com/logo.png"
                className="flex-1 p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 font-bold text-slate-800 dark:text-white text-sm"
              />
              {preview && (
                <button type="button" onClick={clearLogo}
                  className="px-3 py-2 bg-rose-50 dark:bg-rose-900/30 text-rose-500 rounded-xl font-bold text-xs hover:bg-rose-100 transition-colors">
                  مسح
                </button>
              )}
            </div>
          </div>

          {preview && (
            <div className="flex items-center gap-3 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <CheckCircle size={16} className="text-emerald-500 shrink-0" />
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">اللوجو جاهز للحفظ</span>
            </div>
          )}
        </div>

        {/* ── Theme Color ───────────────────────────────────── */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
          <h3 className="font-black text-lg text-slate-800 dark:text-white flex items-center gap-2">
            <Palette size={18} className="text-indigo-500" /> لون التطبيق
          </h3>
          <div className="flex items-center gap-4">
            <input type="color" value={themeColor} onChange={e => setThemeColor(e.target.value)}
              className="w-14 h-14 rounded-2xl border-2 border-slate-200 dark:border-slate-700 cursor-pointer p-1 bg-transparent" />
            <div>
              <p className="font-black text-slate-800 dark:text-white">{themeColor}</p>
              <p className="text-xs text-slate-500 font-bold mt-0.5">يظهر في شريط المتصفح وعند التثبيت</p>
            </div>
            {/* Preset colors */}
            <div className="flex gap-2 mr-auto">
              {['#4f46e5','#0f766e','#b45309','#be123c','#1d4ed8'].map(c => (
                <button key={c} type="button" onClick={() => setThemeColor(c)}
                  className={`w-8 h-8 rounded-xl border-2 transition-all ${themeColor === c ? 'border-slate-800 dark:border-white scale-110' : 'border-transparent'}`}
                  style={{ background: c }} />
              ))}
            </div>
          </div>
        </div>

        {/* ── Save button ───────────────────────────────────── */}
        <Btn type="submit" disabled={saving} className="w-full justify-center py-4 text-base">
          {saving ? <><RefreshCw size={16} className="animate-spin" /> جاري الحفظ...</> :
           saved  ? <><CheckCircle size={16} /> تم الحفظ ✓</> :
           'حفظ الإعدادات'}
        </Btn>
      </form>

      {/* ── PWA Install Section ───────────────────────────── */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-4">
        <h3 className="font-black text-lg text-slate-800 dark:text-white flex items-center gap-2">
          <Monitor size={18} className="text-indigo-500" /> تثبيت التطبيق
        </h3>

        {isInstalled ? (
          <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-200 dark:border-emerald-800">
            <CheckCircle size={20} className="text-emerald-500 shrink-0" />
            <div>
              <p className="font-black text-emerald-700 dark:text-emerald-400">التطبيق مثبّت بالفعل ✓</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-300 font-bold mt-0.5">يعمل بدون إنترنت وبشكل أسرع</p>
            </div>
          </div>
        ) : isIOS ? (
          <div className="space-y-3">
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400">لتثبيت التطبيق على iPhone / iPad:</p>
            <div className="space-y-2">
              {['1. افتح الموقع في Safari', '2. اضغط على زر Share (المربع مع السهم)', '3. اختر "Add to Home Screen"', '4. اضغط "Add"'].map((step, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-900 rounded-xl">
                  <span className="font-black text-indigo-600 text-sm w-4 shrink-0">{i+1}</span>
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{step.replace(/^\d+\. /, '')}</span>
                </div>
              ))}
            </div>
          </div>
        ) : canInstall ? (
          <div className="space-y-3">
            <p className="text-sm font-bold text-slate-600 dark:text-slate-400">
              ثبّت التطبيق على جهازك للعمل بدون إنترنت والوصول السريع من سطح المكتب.
            </p>
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              {[['⚡', 'أسرع بـ 3x'], ['📵', 'يعمل أوفلاين'], ['🖥️', 'سطح المكتب']].map(([icon, label]) => (
                <div key={label} className="bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-xl">
                  <div className="text-2xl mb-1">{icon}</div>
                  <div className="font-bold text-indigo-700 dark:text-indigo-400">{label}</div>
                </div>
              ))}
            </div>
            <button onClick={install}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-600/20 text-base">
              <Download size={18} /> تثبيت التطبيق الآن
            </button>
          </div>
        ) : (
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-2xl">
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
              لتثبيت التطبيق، افتح الموقع في <strong>Chrome</strong> أو <strong>Edge</strong> على الكمبيوتر أو Android.
              <br />ستظهر أيقونة التثبيت تلقائياً في شريط العنوان.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
