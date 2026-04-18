import { useState } from 'react'
import { Users, Plus, Trash2, User, Download, X, Shield, Eye, EyeOff,
         ToggleLeft, ToggleRight, UserCheck, Mail, Lock, AlertCircle } from 'lucide-react'
import { useStore } from '../store'
import { Modal, ConfirmDelete, PageHeader, Input, Btn, DataTable, Badge } from '../components/UI'
import { exportEmployeeReport } from '../lib/pdf'
import { useAuth } from '../hooks/useAuth'

function NumberCell({ value, onSave, color }) {
  const [val, setVal] = useState(value || '')
  return (
    <input type="number" min="0" step="any" placeholder="0" value={val}
      onChange={e => setVal(e.target.value)}
      onBlur={() => onSave(val === '' ? 0 : parseFloat(val))}
      className={`w-24 p-2 text-center border-2 rounded-xl bg-transparent focus:outline-none font-bold text-sm transition-colors dark:border-slate-600 ${color}`}
    />
  )
}

// ── نافذة إنشاء/تعديل كاشير ──────────────────────────────────
function CashierModal({ employee, tenantId, existingCashier, onClose, onSaved }) {
  const { saveCashier } = useAuth()
  const [form, setForm]     = useState({
    name:     existingCashier?.name  || employee?.name || '',
    email:    existingCashier?.email || '',
    password: '',
  })
  const [showPass, setShowPass] = useState(false)
  const [saving,   setSaving]   = useState(false)
  const [err,      setErr]      = useState('')

  const isEdit = !!existingCashier

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim())  { setErr('الاسم مطلوب');              return }
    if (!form.email.trim()) { setErr('الإيميل مطلوب');             return }
    if (!isEdit && !form.password) { setErr('كلمة المرور مطلوبة للإنشاء'); return }
    if (form.password && form.password.length < 6) { setErr('كلمة المرور 6 أحرف على الأقل'); return }

    setSaving(true); setErr('')
    const res = await saveCashier({
      tenantId,
      cashier: {
        id:         existingCashier?.id,
        name:       form.name.trim(),
        email:      form.email.trim(),
        password:   form.password || undefined,
        employeeId: employee?.id,
      }
    })
    setSaving(false)
    if (!res.ok) { setErr(res.error); return }
    onSaved()
  }

  return (
    <Modal title={isEdit ? 'تعديل حساب الكاشير' : 'إنشاء حساب كاشير'} onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* info banner */}
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-4 flex gap-3">
          <Shield size={18} className="text-indigo-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-black text-indigo-800 dark:text-indigo-300 text-sm">{employee?.name || form.name}</p>
            <p className="text-indigo-600 dark:text-indigo-400 text-xs mt-0.5 font-bold">
              {isEdit ? 'تعديل بيانات الدخول — اتركي كلمة المرور فارغة إن لم تريد تغييرها' : 'سيتمكن من الدخول بهذا الإيميل وكلمة المرور'}
            </p>
          </div>
        </div>

        <Input label="اسم الكاشير (للعرض)" required value={form.name}
          onChange={e => setForm({...form, name: e.target.value})} placeholder="اسم الموظف" />

        <div>
          <label className="block text-sm font-black mb-1.5 text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Mail size={13}/> البريد الإلكتروني
          </label>
          <input type="email" required value={form.email} dir="ltr"
            onChange={e => setForm({...form, email: e.target.value})}
            placeholder="cashier@example.com"
            className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 font-bold text-slate-800 dark:text-white text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-black mb-1.5 text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Lock size={13}/> كلمة المرور {isEdit && <span className="text-slate-400 font-bold text-xs">(اختياري للتعديل)</span>}
          </label>
          <div className="relative">
            <input type={showPass ? 'text' : 'password'} value={form.password}
              onChange={e => setForm({...form, password: e.target.value})}
              placeholder={isEdit ? 'اتركها فارغة بدون تغيير' : 'كلمة مرور قوية...'}
              className="w-full p-3.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 font-bold text-slate-800 dark:text-white text-sm"
            />
            <button type="button" onClick={() => setShowPass(!showPass)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
              {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
            </button>
          </div>
        </div>

        {err && (
          <div className="flex items-center gap-2 text-rose-600 bg-rose-50 dark:bg-rose-900/20 p-3 rounded-xl text-sm font-bold border border-rose-200 dark:border-rose-800">
            <AlertCircle size={15}/> {err}
          </div>
        )}

        <Btn type="submit" disabled={saving} className="w-full justify-center py-4 text-base">
          {saving ? 'جاري الحفظ...' : isEdit ? 'حفظ التعديلات' : 'إنشاء حساب الكاشير'}
        </Btn>
      </form>
    </Modal>
  )
}

// ── الصفحة الرئيسية HR ────────────────────────────────────────
export default function HRPage() {
  const { employees, orders, shifts, currentUser, upsertEmployee, deleteEmployee, platform } = useStore()
  const { deleteCashier, toggleCashier } = useAuth()

  const [showEmpModal,  setShowEmpModal]  = useState(false)
  const [deleteId,      setDeleteId]      = useState(null)
  const [selectedEmp,   setSelectedEmp]   = useState(null)
  const [cashierTarget, setCashierTarget] = useState(null)  // { employee, existing? }
  const [deleteConfig,  setDeleteConfig]  = useState(null)  // { type: cashier|employee, ... }
  const [form, setForm] = useState({ name: '', salary: '' })

  const tenantId = currentUser?.cafeId
  const tenant   = platform?.tenants?.find(t => t.id === tenantId)
  const cashiers = tenant?.cashiers || []

  // ربط كل موظف بكاشيره إن وجد
  const getCashier = (emp) => cashiers.find(c => c.employeeId === emp.id)

  const handleSaveEmp = (e) => {
    e.preventDefault()
    upsertEmployee({ name: form.name, salary: parseFloat(form.salary) })
    setShowEmpModal(false)
    setForm({ name: '', salary: '' })
  }

  const handleExport = (emp) => exportEmployeeReport({ employee: emp, orders, shifts, cafeName: currentUser?.cafeName || '' })

  const empOrders = (emp) => orders.filter(o => o.cashierName === emp.name)
  const empTotal  = (emp) => empOrders(emp).reduce((s, o) => s + o.total, 0)

  const confirmDelete = async () => {
    if (!deleteConfig) return
    if (deleteConfig.type === 'employee')
      deleteEmployee(deleteConfig.id)
    else if (deleteConfig.type === 'cashier')
      await deleteCashier({ tenantId, cashierId: deleteConfig.id })
    setDeleteConfig(null)
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <PageHeader
        icon={<Users size={28} />}
        title="الموظفين والرواتب"
        action={<Btn onClick={() => setShowEmpModal(true)}><Plus size={17}/> موظف جديد</Btn>}
      />

      {/* ── جدول الموظفين ─────────────────────────────────── */}
      <DataTable
        headers={[
          { label: 'الاسم' }, { label: 'الراتب' }, { label: 'سلفة' }, { label: 'خصم' },
          { label: 'الصافي', center: true }, { label: 'المبيعات', center: true },
          { label: 'صلاحية كاشير', center: true },
          { label: 'تقرير', center: true }, { label: 'حذف', center: true }
        ]}
        empty={!employees.length ? 'لا يوجد موظفون مسجلون' : null}
      >
        {employees.map(emp => {
          const net     = emp.salary - (emp.advances || 0) - (emp.deductions || 0)
          const cashier = getCashier(emp)
          return (
            <tr key={emp.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-sm">
              <td className="p-4 font-black text-slate-800 dark:text-white">{emp.name}</td>
              <td className="p-4 font-bold text-slate-600 dark:text-slate-300">{emp.salary} ج</td>
              <td className="p-2">
                <NumberCell value={emp.advances} color="text-amber-500 focus:border-amber-400 border-amber-200 bg-amber-50 dark:bg-amber-900/20"
                  onSave={v => upsertEmployee({ ...emp, advances: v })} />
              </td>
              <td className="p-2">
                <NumberCell value={emp.deductions} color="text-rose-500 focus:border-rose-400 border-rose-200 bg-rose-50 dark:bg-rose-900/20"
                  onSave={v => upsertEmployee({ ...emp, deductions: v })} />
              </td>
              <td className="p-4 text-center">
                <span className={`font-black text-base ${net >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{net} ج</span>
              </td>
              <td className="p-4 text-center font-bold text-indigo-600 dark:text-indigo-400">
                {empTotal(emp).toFixed(2)} ج
              </td>

              {/* ── عمود صلاحية الكاشير ── */}
              <td className="p-4 text-center">
                {cashier ? (
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <UserCheck size={14} className="text-emerald-500 shrink-0" />
                      <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 max-w-[120px] truncate" dir="ltr">
                        {cashier.email}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {/* تفعيل/إيقاف */}
                      <button
                        onClick={() => toggleCashier({ tenantId, cashierId: cashier.id, active: !cashier.active })}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-black transition-colors
                          ${cashier.active !== false
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-400'}`}
                      >
                        {cashier.active !== false
                          ? <><ToggleRight size={12}/> مفعّل</>
                          : <><ToggleLeft  size={12}/> موقوف</>
                        }
                      </button>
                      {/* تعديل */}
                      <button
                        onClick={() => setCashierTarget({ employee: emp, existing: cashier })}
                        className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-200 px-2 py-1 rounded-lg text-[10px] font-black transition-colors"
                      >تعديل</button>
                      {/* حذف الصلاحية */}
                      <button
                        onClick={() => setDeleteConfig({ type: 'cashier', id: cashier.id, label: `حساب ${emp.name}` })}
                        className="bg-rose-50 dark:bg-rose-900/30 text-rose-500 hover:bg-rose-100 p-1 rounded-lg transition-colors"
                      ><Trash2 size={11}/></button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setCashierTarget({ employee: emp, existing: null })}
                    className="flex items-center gap-1.5 mx-auto bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl text-xs font-black transition-colors shadow-sm"
                  >
                    <Shield size={12}/> تعيين كاشير
                  </button>
                )}
              </td>

              <td className="p-4 text-center">
                <button onClick={() => setSelectedEmp(emp)}
                  className="bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-indigo-100 hover:text-indigo-700 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 mx-auto transition-colors">
                  <User size={12}/> تقرير
                </button>
              </td>
              <td className="p-4 text-center">
                <button onClick={() => setDeleteConfig({ type: 'employee', id: emp.id, label: emp.name })}
                  className="text-rose-500 p-2 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-colors">
                  <Trash2 size={15}/>
                </button>
              </td>
            </tr>
          )
        })}
      </DataTable>

      {/* ── قائمة الكاشيرية المسجلين ─────────────────────── */}
      {cashiers.length > 0 && (
        <div>
          <h3 className="font-black text-lg text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <Shield size={18} className="text-indigo-500"/> حسابات الكاشيرية ({cashiers.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cashiers.map(c => {
              const emp = employees.find(e => e.id === c.employeeId)
              return (
                <div key={c.id} className={`bg-white dark:bg-slate-800 p-4 rounded-2xl border-2 shadow-sm transition-all
                  ${c.active !== false ? 'border-emerald-300 dark:border-emerald-700' : 'border-slate-200 dark:border-slate-700 opacity-60'}`}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-black text-slate-800 dark:text-white">{c.name}</p>
                      <p className="text-xs font-bold text-indigo-600 dark:text-indigo-400 mt-0.5" dir="ltr">{c.email}</p>
                    </div>
                    <Badge color={c.active !== false ? 'emerald' : 'slate'}>
                      {c.active !== false ? 'مفعّل' : 'موقوف'}
                    </Badge>
                  </div>
                  {emp && <p className="text-xs text-slate-500 font-bold">موظف: {emp.name}</p>}
                  <p className="text-xs text-slate-400 mt-1">
                    أنشئ: {c.createdAt ? new Date(c.createdAt).toLocaleDateString('ar-EG') : '—'}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => toggleCashier({ tenantId, cashierId: c.id, active: !c.active })}
                      className={`flex-1 py-1.5 rounded-xl text-xs font-black transition-colors
                        ${c.active !== false ? 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300'
                          : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}>
                      {c.active !== false ? 'إيقاف مؤقت' : 'تفعيل'}
                    </button>
                    <button onClick={() => setCashierTarget({ employee: emp, existing: c })}
                      className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-200 px-3 py-1.5 rounded-xl text-xs font-black transition-colors">
                      تعديل
                    </button>
                    <button onClick={() => setDeleteConfig({ type: 'cashier', id: c.id, label: `حساب ${c.name}` })}
                      className="bg-rose-50 dark:bg-rose-900/30 text-rose-500 hover:bg-rose-100 p-2 rounded-xl transition-colors">
                      <Trash2 size={13}/>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── تقرير موظف مختار ─────────────────────────────── */}
      {selectedEmp && (() => {
        const eo = empOrders(selectedEmp)
        const es = shifts.filter(s => s.cashierName === selectedEmp.name)
        const total = empTotal(selectedEmp)
        return (
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-indigo-200 dark:border-indigo-800 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-indigo-50 dark:bg-indigo-900/20">
              <h3 className="font-black text-lg text-indigo-800 dark:text-indigo-300 flex items-center gap-2">
                <User size={18}/> معاملات: {selectedEmp.name}
              </h3>
              <div className="flex gap-2">
                <button onClick={() => handleExport(selectedEmp)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 hover:bg-indigo-700 transition-colors">
                  <Download size={13}/> PDF
                </button>
                <button onClick={() => setSelectedEmp(null)} className="p-2 bg-white dark:bg-slate-700 rounded-xl text-slate-500 hover:text-rose-500 transition-colors">
                  <X size={16}/>
                </button>
              </div>
            </div>
            <div className="p-4 grid grid-cols-3 gap-4 border-b border-slate-100 dark:border-slate-700">
              <div className="text-center"><p className="text-2xl font-black text-indigo-600">{total.toFixed(2)} ج</p><p className="text-xs text-slate-500 font-bold">مبيعاته</p></div>
              <div className="text-center"><p className="text-2xl font-black text-emerald-600">{eo.length}</p><p className="text-xs text-slate-500 font-bold">طلبات</p></div>
              <div className="text-center"><p className="text-2xl font-black text-amber-600">{es.length}</p><p className="text-xs text-slate-500 font-bold">ورديات</p></div>
            </div>
            <div className="overflow-x-auto custom-scrollbar max-h-72">
              <table className="w-full text-right min-w-[500px]">
                <thead className="bg-slate-50 dark:bg-slate-800/80 sticky top-0 text-slate-500 font-bold text-xs">
                  <tr><th className="p-3">التاريخ</th><th className="p-3">الأصناف</th><th className="p-3">النوع</th><th className="p-3 text-center">الإجمالي</th></tr>
                </thead>
                <tbody>
                  {[...eo].reverse().map(o => (
                    <tr key={o.id} className="border-b border-slate-100 dark:border-slate-700 text-xs hover:bg-slate-50 dark:hover:bg-slate-700/30">
                      <td className="p-3 text-slate-500 whitespace-nowrap">{o.date}</td>
                      <td className="p-3 text-slate-700 dark:text-slate-300 max-w-[200px] truncate">{(o.items||[]).map(i=>i.name).join('، ')}</td>
                      <td className="p-3"><Badge color="indigo">{o.note||'تيك أواي'}</Badge></td>
                      <td className="p-3 text-center font-black text-indigo-600 dark:text-indigo-400">{o.total.toFixed(2)} ج</td>
                    </tr>
                  ))}
                  {!eo.length && <tr><td colSpan={4} className="p-6 text-center text-slate-400 font-bold">لا توجد معاملات</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )
      })()}

      {/* ── نافذة إضافة موظف ─────────────────────────────── */}
      {showEmpModal && (
        <Modal title="موظف جديد" onClose={() => setShowEmpModal(false)} size="sm">
          <form onSubmit={handleSaveEmp} className="space-y-4">
            <Input label="الاسم الكامل" required value={form.name}
              onChange={e => setForm({...form, name: e.target.value})} placeholder="اسم الموظف" />
            <Input label="الراتب الأساسي الشهري (ج)" required type="number" step="any" min="0"
              value={form.salary} onChange={e => setForm({...form, salary: e.target.value})} placeholder="0" />
            <Btn type="submit" className="w-full justify-center py-4 text-base">حفظ الموظف</Btn>
          </form>
        </Modal>
      )}

      {/* ── نافذة إنشاء/تعديل كاشير ──────────────────────── */}
      {cashierTarget && (
        <CashierModal
          employee={cashierTarget.employee}
          tenantId={tenantId}
          existingCashier={cashierTarget.existing}
          onClose={() => setCashierTarget(null)}
          onSaved={() => setCashierTarget(null)}
        />
      )}

      {/* ── تأكيد الحذف ──────────────────────────────────── */}
      {deleteConfig && (
        <ConfirmDelete
          message={`سيتم حذف ${deleteConfig.label} نهائياً.`}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfig(null)}
        />
      )}
    </div>
  )
}
