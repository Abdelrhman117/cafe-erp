import { useState } from 'react'
import { Building2, Plus, Settings, Users } from 'lucide-react'
import { useStore } from '../store'
import { Modal, DataTable, Badge, Btn, Input, PageHeader } from '../components/UI'

export default function SuperAdminPage() {
  const { platform, savePlatformField } = useStore()
  const tenants = platform?.tenants || []

  const [showTenantModal,   setShowTenantModal]   = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [editTenant,   setEditTenant]   = useState(null)
  const [form,         setForm]         = useState({})
  const [appNameForm,  setAppNameForm]  = useState(platform?.appName || '')

  const openAdd = () => {
    setEditTenant(null)
    setForm({ id: '', name: '', subscriptionEnds: '', adminEmail: '', status: 'active' })
    setShowTenantModal(true)
  }

  const openEdit = (t) => {
    setEditTenant(t)
    setForm({ ...t })
    setShowTenantModal(true)
  }

  const handleSaveTenant = (e) => {
    e.preventDefault()
    let next
    if (editTenant) {
      next = tenants.map(t => t.id === editTenant.id ? { ...t, ...form } : t)
    } else {
      if (tenants.find(t => t.id === form.id)) { alert('كود الكافيه موجود بالفعل!'); return }
      next = [...tenants, { ...form, cashiers: [] }]
    }
    savePlatformField({ tenants: next })
    setShowTenantModal(false)
  }

  const toggleStatus = (id) => {
    const next = tenants.map(t =>
      t.id === id ? { ...t, status: t.status === 'active' ? 'suspended' : 'active' } : t
    )
    savePlatformField({ tenants: next })
  }

  const handleSaveSettings = (e) => {
    e.preventDefault()
    savePlatformField({ appName: appNameForm })
    setShowSettingsModal(false)
  }

  const isExpired = (t) => t.subscriptionEnds && new Date(t.subscriptionEnds) < new Date()

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <Building2 className="text-indigo-600 w-8 h-8" />
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100">إدارة المنصة (SaaS)</h2>
        </div>
        <div className="flex gap-2">
          <Btn variant="secondary" onClick={() => { setAppNameForm(platform?.appName || ''); setShowSettingsModal(true) }}>
            <Settings size={16} /> إعدادات
          </Btn>
          <Btn onClick={openAdd}>
            <Plus size={17} /> عميل جديد
          </Btn>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 text-center shadow-sm">
          <p className="text-3xl font-black text-indigo-600">{tenants.length}</p>
          <p className="text-slate-500 text-sm font-bold mt-1">إجمالي العملاء</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 text-center shadow-sm">
          <p className="text-3xl font-black text-emerald-600">{tenants.filter(t => t.status === 'active').length}</p>
          <p className="text-slate-500 text-sm font-bold mt-1">نشط</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 text-center shadow-sm">
          <p className="text-3xl font-black text-rose-600">{tenants.filter(t => isExpired(t)).length}</p>
          <p className="text-slate-500 text-sm font-bold mt-1">منتهي الاشتراك</p>
        </div>
      </div>

      {/* Tenants table */}
      <DataTable
        headers={[
          { label: 'الكود' },
          { label: 'الاسم' },
          { label: 'إيميل المدير' },
          { label: 'الكاشيرية', center: true },
          { label: 'انتهاء الاشتراك' },
          { label: 'الحالة', center: true },
          { label: 'تحكم', center: true }
        ]}
        empty={!tenants.length ? 'لا يوجد عملاء مسجلون' : null}
      >
        {tenants.map(t => (
          <tr key={t.id} className={`border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-sm ${isExpired(t) ? 'bg-rose-50/30 dark:bg-rose-900/10' : ''}`}>
            <td className="p-4 font-black text-indigo-600 dark:text-indigo-400">{t.id}</td>
            <td className="p-4 font-bold text-slate-800 dark:text-white">{t.name}</td>
            <td className="p-4 text-slate-500 dark:text-slate-400 text-xs" dir="ltr">{t.adminEmail}</td>
            <td className="p-4 text-center">
              <span className="flex items-center justify-center gap-1 font-bold text-slate-600 dark:text-slate-300 text-xs">
                <Users size={12} className="text-indigo-400" />
                {(t.cashiers || []).filter(c => c.active !== false).length} نشط
                {' / '}
                {(t.cashiers || []).length} إجمالي
              </span>
            </td>
            <td className="p-4">
              <span className={`text-xs font-bold ${isExpired(t) ? 'text-rose-600' : 'text-slate-500 dark:text-slate-400'}`}>
                {isExpired(t) ? '⚠️ ' : ''}{t.subscriptionEnds}
              </span>
            </td>
            <td className="p-4 text-center">
              <Badge color={t.status === 'active' ? 'emerald' : 'rose'}>
                {t.status === 'active' ? 'نشط' : 'موقوف'}
              </Badge>
            </td>
            <td className="p-4 text-center">
              <div className="flex justify-center gap-2">
                <button onClick={() => toggleStatus(t.id)}
                  className="bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 dark:text-white transition-colors">
                  {t.status === 'active' ? 'إيقاف' : 'تفعيل'}
                </button>
                <button onClick={() => openEdit(t)}
                  className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-200 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors">
                  تعديل
                </button>
              </div>
            </td>
          </tr>
        ))}
      </DataTable>

      {/* Tenant modal */}
      {showTenantModal && (
        <Modal title={editTenant ? 'تعديل بيانات الكافيه' : 'إضافة كافيه جديد'} onClose={() => setShowTenantModal(false)}>
          <form onSubmit={handleSaveTenant} className="space-y-4">
            {!editTenant && (
              <Input label="كود الكافيه (معرّف فريد لا يتغير)" required value={form.id || ''}
                onChange={e => setForm({ ...form, id: e.target.value.toLowerCase().replace(/\s/g,'') })}
                placeholder="مثال: cafe2" />
            )}
            <Input label="اسم الكافيه" required value={form.name || ''}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="مثال: let's 24 — فرع المعادي" />
            <Input label="تاريخ انتهاء الاشتراك" required type="date" value={form.subscriptionEnds || ''}
              onChange={e => setForm({ ...form, subscriptionEnds: e.target.value })} />
            <Input label="إيميل المدير" required type="email" value={form.adminEmail || ''}
              onChange={e => setForm({ ...form, adminEmail: e.target.value })}
              placeholder="admin@cafe2.com" dir="ltr" />

            {/* Info about cashiers */}
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl p-3">
              <p className="text-xs font-black text-indigo-700 dark:text-indigo-400 mb-1">ℹ️ الكاشيرية</p>
              <p className="text-xs text-indigo-600 dark:text-indigo-300 font-bold">
                الكاشيرية بيتنشئوا من داخل الكافيه — الأدمن يدخل ويضيفهم من قسم <strong>الموظفين والرواتب</strong>.
              </p>
            </div>

            {/* Admin Firebase Auth reminder */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3">
              <p className="text-xs font-black text-amber-700 dark:text-amber-400">
                ⚠️ بعد الحفظ، أنشئ إيميل المدير في <strong>Firebase Console → Authentication → Add user</strong>
              </p>
            </div>

            <Btn type="submit" className="w-full justify-center py-4 text-base">
              {editTenant ? 'حفظ التعديلات' : 'إضافة الكافيه'}
            </Btn>
          </form>
        </Modal>
      )}

      {/* Settings modal */}
      {showSettingsModal && (
        <Modal title="إعدادات المنصة" onClose={() => setShowSettingsModal(false)} size="sm">
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <Input label="اسم المنصة" required value={appNameForm}
              onChange={e => setAppNameForm(e.target.value)} placeholder="كوفي ERP" />
            <Btn type="submit" className="w-full justify-center py-4 text-base">حفظ</Btn>
          </form>
        </Modal>
      )}
    </div>
  )
}
