import { X, AlertCircle } from 'lucide-react'

// ─── Modal ────────────────────────────────────────────────
export function Modal({ title, onClose, children, size = 'md' }) {
  const widths = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className={`bg-white dark:bg-slate-800 rounded-3xl w-full ${widths[size]} shadow-2xl border border-slate-200 dark:border-slate-700 flex flex-col max-h-[92vh]`}>
        <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-700 shrink-0">
          <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">{title}</h3>
          {onClose && (
            <button onClick={onClose} className="text-slate-400 hover:text-rose-500 bg-slate-100 dark:bg-slate-700 p-1.5 rounded-lg transition-colors">
              <X size={20} />
            </button>
          )}
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar flex-1">{children}</div>
      </div>
    </div>
  )
}

// ─── Confirm Delete ───────────────────────────────────────
export function ConfirmDelete({ message = 'سيتم الحذف نهائياً.', onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[110] p-4">
      <div className="bg-white dark:bg-slate-800 p-8 rounded-3xl w-full max-w-sm text-center shadow-2xl">
        <AlertCircle className="w-20 h-20 text-rose-500 mx-auto mb-4" />
        <h3 className="text-2xl font-black mb-2 dark:text-white">هل أنت متأكد؟</h3>
        <p className="text-slate-500 dark:text-slate-400 font-bold mb-8 text-sm">{message}</p>
        <div className="flex gap-3">
          <button onClick={onConfirm} className="flex-1 bg-rose-600 hover:bg-rose-700 text-white py-3.5 rounded-xl font-black transition-colors">نعم، احذف</button>
          <button onClick={onCancel}  className="flex-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white py-3.5 rounded-xl font-black transition-colors">إلغاء</button>
        </div>
      </div>
    </div>
  )
}

// ─── Badge ────────────────────────────────────────────────
export function Badge({ children, color = 'indigo' }) {
  const colors = {
    indigo:  'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-400',
    emerald: 'bg-emerald-100 text-emerald-700',
    rose:    'bg-rose-100 text-rose-700',
    amber:   'bg-amber-100 text-amber-700',
    slate:   'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
  }
  return <span className={`px-2.5 py-1 rounded-lg text-xs font-black ${colors[color] || colors.indigo}`}>{children}</span>
}

// ─── Btn ──────────────────────────────────────────────────
export function Btn({ children, onClick, variant = 'primary', size = 'md', disabled, className = '', type = 'button' }) {
  const variants = {
    primary:   'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20',
    secondary: 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white',
    danger:    'bg-rose-600 hover:bg-rose-700 text-white',
    ghost:     'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300',
    emerald:   'bg-emerald-600 hover:bg-emerald-700 text-white'
  }
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-5 py-3 text-sm', lg: 'px-6 py-4 text-base' }
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${variants[variant]} ${sizes[size]} rounded-xl font-bold flex items-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  )
}

// ─── Input ────────────────────────────────────────────────
export function Input({ label, ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-black mb-1.5 text-slate-700 dark:text-slate-300">{label}</label>}
      <input
        {...props}
        className={`w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 font-bold text-slate-800 dark:text-white text-sm transition-colors ${props.className || ''}`}
      />
    </div>
  )
}

// ─── Select ───────────────────────────────────────────────
export function Select({ label, children, ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-black mb-1.5 text-slate-700 dark:text-slate-300">{label}</label>}
      <select
        {...props}
        className={`w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 font-bold text-slate-800 dark:text-white text-sm transition-colors ${props.className || ''}`}
      >
        {children}
      </select>
    </div>
  )
}

// ─── Section Header ───────────────────────────────────────
export function PageHeader({ icon, title, action }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white flex items-center gap-3">
        <span className="text-indigo-500">{icon}</span> {title}
      </h2>
      {action}
    </div>
  )
}

// ─── Table wrapper ────────────────────────────────────────
export function DataTable({ headers, children, empty }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-right">
          <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 text-sm font-bold">
            <tr>{headers.map((h, i) => <th key={i} className={`p-4 ${h.center ? 'text-center' : ''}`}>{h.label}</th>)}</tr>
          </thead>
          <tbody>
            {children}
            {empty && (
              <tr><td colSpan={headers.length} className="p-10 text-center text-slate-400 font-bold">{empty}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────
export function StatCard({ label, value, color = 'emerald', icon }) {
  const colors = {
    emerald: 'text-emerald-600 dark:text-emerald-400',
    rose:    'text-rose-600 dark:text-rose-400',
    amber:   'text-amber-500 dark:text-amber-400',
    indigo:  'text-indigo-600 dark:text-indigo-400',
  }
  return (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
      {icon && <div className="text-slate-300 dark:text-slate-600 mb-3">{icon}</div>}
      <p className="text-slate-500 dark:text-slate-400 text-sm font-bold mb-2">{label}</p>
      <p className={`text-3xl font-black ${colors[color]}`}>{value}</p>
    </div>
  )
}

// ─── Toggle Switch ────────────────────────────────────────
export function Toggle({ checked, onChange, label }) {
  return (
    <div className="flex items-center justify-between">
      {label && <span className="text-sm font-bold text-slate-600 dark:text-slate-400">{label}</span>}
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`w-12 h-6 rounded-full transition-colors relative shrink-0 ${checked ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}
      >
        <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${checked ? 'left-7' : 'left-1'}`} />
      </button>
    </div>
  )
}

// ─── Period Tabs ──────────────────────────────────────────
export const PERIODS = [
  { v: 'daily', l: 'يوم' }, { v: 'weekly', l: 'أسبوع' }, { v: 'monthly', l: 'شهر' },
  { v: 'quarterly', l: 'ربع سنوي' }, { v: 'semi', l: 'نصف سنوي' }, { v: 'yearly', l: 'سنة' }, { v: 'all', l: 'الكل' }
]

export function PeriodTabs({ value, onChange }) {
  return (
    <div className="flex gap-1 p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-x-auto no-scrollbar w-fit">
      {PERIODS.map(p => (
        <button key={p.v} onClick={() => onChange(p.v)}
          className={`px-3 py-2 rounded-lg font-bold text-xs whitespace-nowrap transition-colors ${value === p.v ? 'bg-indigo-600 text-white' : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>
          {p.l}
        </button>
      ))}
    </div>
  )
}

// ─── Alert Banner ─────────────────────────────────────────
export function AlertBanner({ icon, title, items, color = 'rose' }) {
  const colors = {
    rose:  'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400',
    amber: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400',
    red:   'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
  }
  return (
    <div className={`rounded-2xl p-4 border flex items-start gap-3 ${colors[color]}`}>
      <span className="shrink-0 mt-0.5">{icon}</span>
      <div>
        <p className="font-black text-sm mb-1">{title}</p>
        <p className="text-xs font-bold opacity-80">{items.join('  •  ')}</p>
      </div>
    </div>
  )
}
