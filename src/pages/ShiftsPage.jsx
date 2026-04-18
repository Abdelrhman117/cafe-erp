import { ClipboardList, Users, Play, Power } from 'lucide-react'
import { useStore } from '../store'
import { useAuth } from '../hooks/useAuth'
import { DataTable, Badge, PageHeader } from '../components/UI'

export default function ShiftsPage() {
  const { shifts, orders, currentUser, openShift, closeShift } = useStore()
  const { logout } = useAuth()

  const activeShift = shifts.find(s => s.status === 'open' && s.cashierName === currentUser?.displayName)

  const handleOpenShift = (e) => {
    e.preventDefault()
    const cash = parseFloat(e.target.startingCash.value) || 0
    openShift(currentUser.displayName, cash)
    e.target.reset()
  }

  const handleCloseShift = (e) => {
    e.preventDefault()
    const actual = parseFloat(e.target.actualCash.value) || 0
    closeShift(activeShift.id, actual)
    logout()
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <PageHeader icon={<ClipboardList size={28} />} title="سجل الورديات" />

      {/* Open/Close shift for cashier */}
      {currentUser?.role === 'cashier' && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm">
          {!activeShift ? (
            <form onSubmit={handleOpenShift} className="max-w-sm">
              <h3 className="font-black text-lg text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Play size={18} className="text-emerald-500" /> فتح وردية جديدة</h3>
              <div className="mb-4">
                <label className="block text-sm font-black mb-2 text-slate-700 dark:text-slate-300">العهدة (مبلغ الدرج)</label>
                <input required name="startingCash" type="number" min="0" step="any" placeholder="0.00"
                  className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-center font-black text-2xl focus:outline-none focus:border-indigo-500 text-slate-800 dark:text-white" />
              </div>
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg transition-colors">
                <Play size={18} /> بدء الوردية
              </button>
            </form>
          ) : (
            <form onSubmit={handleCloseShift} className="max-w-sm">
              <h3 className="font-black text-lg text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Power size={18} className="text-rose-500" /> تقفيل الوردية</h3>
              <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-2xl mb-4 border border-indigo-100 dark:border-indigo-800">
                <div className="flex justify-between text-sm font-bold text-indigo-800 dark:text-indigo-300 mb-2">
                  <span>العهدة المستلمة</span><span>{activeShift.startingCash} ج</span>
                </div>
                <div className="flex justify-between text-sm font-black text-indigo-800 dark:text-indigo-300 border-t border-indigo-200 dark:border-indigo-700 pt-2">
                  <span>مبيعات الشيفت</span>
                  <span>{orders.filter(o => o.shiftId === activeShift.id).reduce((s, o) => s + o.total, 0).toFixed(2)} ج</span>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-black mb-2 text-slate-700 dark:text-slate-300">المبلغ الفعلي في الدرج الآن</label>
                <input required name="actualCash" type="number" min="0" step="any" placeholder="0.00"
                  className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl text-center font-black text-2xl focus:outline-none focus:border-rose-500 text-slate-800 dark:text-white" />
              </div>
              <button type="submit" className="w-full bg-rose-600 hover:bg-rose-700 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg transition-colors">
                <Power size={18} /> تأكيد التقفيل والخروج
              </button>
            </form>
          )}
        </div>
      )}

      {/* Shifts table */}
      <DataTable
        headers={[
          { label: 'الموظف' }, { label: 'البداية' }, { label: 'النهاية' },
          { label: 'العهدة', center: true }, { label: 'المبيعات', center: true },
          { label: 'الدرج الفعلي', center: true }, { label: 'العجز/الزيادة', center: true }, { label: 'الحالة', center: true }
        ]}
        empty={!shifts.length ? 'لا توجد ورديات مسجلة' : null}
      >
        {[...shifts].reverse().map(shift => {
          const shiftSales = orders.filter(o => o.shiftId === shift.id).reduce((s, o) => s + o.total, 0)
          const expected   = (shift.startingCash || 0) + shiftSales
          const variance   = shift.status === 'closed' ? (shift.actualCash || 0) - expected : null

          return (
            <tr key={shift.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-sm">
              <td className="p-4 font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Users size={14} className="text-indigo-400 shrink-0" /> {shift.cashierName}
              </td>
              <td className="p-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{shift.startTime}</td>
              <td className="p-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">{shift.endTime || '—'}</td>
              <td className="p-4 text-center font-bold">{shift.startingCash} ج</td>
              <td className="p-4 text-center font-black text-indigo-600 dark:text-indigo-400">{shiftSales.toFixed(2)} ج</td>
              <td className="p-4 text-center font-bold">{shift.actualCash != null ? `${shift.actualCash} ج` : '—'}</td>
              <td className="p-4 text-center">
                {variance != null
                  ? <Badge color={variance < 0 ? 'rose' : variance > 0 ? 'emerald' : 'slate'}>
                      {variance < 0 ? `عجز ${Math.abs(variance).toFixed(2)}` : variance > 0 ? `زيادة ${variance.toFixed(2)}` : 'مضبوط'}
                    </Badge>
                  : '—'
                }
              </td>
              <td className="p-4 text-center">
                <Badge color={shift.status === 'open' ? 'amber' : 'slate'}>
                  {shift.status === 'open' ? '🟢 مفتوح' : 'مغلق'}
                </Badge>
              </td>
            </tr>
          )
        })}
      </DataTable>
    </div>
  )
}
