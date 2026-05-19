import { useState } from 'react'
import { Utensils, Plus, Trash2, Armchair, CalendarDays } from 'lucide-react'
import { useStore } from '../store'
import { Modal, ConfirmDelete, PageHeader, Input, Btn } from '../components/UI'

function TableCard({ t, onDelete }) {
  const isMonthly = t.billingType === 'monthly'
  return (
    <div className={`relative bg-white dark:bg-slate-800 p-4 rounded-2xl border-2 shadow-sm flex flex-col items-center gap-2 text-center
      ${isMonthly ? 'border-indigo-200 dark:border-indigo-800' : 'border-slate-200 dark:border-slate-700'}`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center
        ${isMonthly
          ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'
          : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
        {isMonthly ? <CalendarDays size={22} /> : <Armchair size={22} />}
      </div>
      <p className="font-black text-sm text-slate-800 dark:text-white line-clamp-2 leading-tight">{t.name}</p>
      <p className="text-xs font-bold text-slate-400">{t.capacity} كرسي</p>
      <button
        onClick={onDelete}
        className="absolute top-2 left-2 w-7 h-7 bg-rose-50 dark:bg-rose-900/30 text-rose-500 rounded-xl flex items-center justify-center hover:bg-rose-100 transition-colors">
        <Trash2 size={12} />
      </button>
    </div>
  )
}

export default function TablesPage() {
  const { tables, upsertTable, deleteTable } = useStore()
  const [showModal, setShowModal] = useState(false)
  const [deleteId,  setDeleteId]  = useState(null)
  const [form, setForm] = useState({ name: '', capacity: '', billingType: 'regular' })

  const handleSave = (e) => {
    e.preventDefault()
    upsertTable({ name: form.name, capacity: parseInt(form.capacity), billingType: form.billingType })
    setShowModal(false)
    setForm({ name: '', capacity: '', billingType: 'regular' })
  }

  const monthly = tables.filter(t => t.billingType === 'monthly')
  const regular  = tables.filter(t => t.billingType !== 'monthly')

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <PageHeader
        icon={<Utensils size={28} />}
        title="إدارة الصالة والطاولات"
        action={<Btn onClick={() => setShowModal(true)}><Plus size={17} /> طاولة جديدة</Btn>}
      />

      {!tables.length ? (
        <div className="text-center py-20 text-slate-400">
          <Armchair className="w-20 h-20 mx-auto mb-4 opacity-20" />
          <p className="font-bold text-lg">لا توجد طاولات مسجلة</p>
          <p className="text-sm mt-2">أضف طاولات حتى تتمكن من الطلب بالصالة في POS</p>
        </div>
      ) : (
        <div className="space-y-6">
          {monthly.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CalendarDays size={16} className="text-indigo-500" />
                <h3 className="font-black text-slate-700 dark:text-slate-300">طاولات شهرية</h3>
                <span className="text-xs font-bold text-indigo-600 bg-indigo-100 dark:bg-indigo-900/40 px-2 py-0.5 rounded-full">{monthly.length}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {monthly.map(t => <TableCard key={t.id} t={t} onDelete={() => setDeleteId(t.id)} />)}
              </div>
            </div>
          )}
          {regular.length > 0 && (
            <div>
              {monthly.length > 0 && (
                <div className="flex items-center gap-2 mb-3">
                  <Armchair size={16} className="text-slate-500" />
                  <h3 className="font-black text-slate-700 dark:text-slate-300">طاولات عادية</h3>
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-full">{regular.length}</span>
                </div>
              )}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {regular.map(t => <TableCard key={t.id} t={t} onDelete={() => setDeleteId(t.id)} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <Modal title="إضافة طاولة" onClose={() => setShowModal(false)} size="sm">
          <form onSubmit={handleSave} className="space-y-4">
            <Input label="اسم الطاولة" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="مثال: طاولة 1، VIP، حديقة..." />
            <Input label="عدد الكراسي" required type="number" min="1" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} placeholder="4" />
            <div>
              <p className="text-sm font-black text-slate-700 dark:text-slate-300 mb-2">نوع الحساب</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'regular', label: 'عادي', sub: 'يُدفع بعد كل جلسة', icon: <Armchair size={18} /> },
                  { id: 'monthly', label: 'شهري', sub: 'يُدفع آخر الشهر', icon: <CalendarDays size={18} /> },
                ].map(opt => (
                  <button key={opt.id} type="button" onClick={() => setForm({ ...form, billingType: opt.id })}
                    className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1 transition-all text-sm ${
                      form.billingType === opt.id
                        ? opt.id === 'monthly'
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                          : 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700'
                        : 'border-slate-200 dark:border-slate-600 text-slate-500'
                    }`}>
                    {opt.icon}
                    <span className="font-black">{opt.label}</span>
                    <span className="text-[10px] font-bold opacity-70">{opt.sub}</span>
                  </button>
                ))}
              </div>
            </div>
            <Btn type="submit" className="w-full justify-center py-4 text-base">حفظ الطاولة</Btn>
          </form>
        </Modal>
      )}

      {deleteId && (
        <ConfirmDelete
          onConfirm={() => { deleteTable(deleteId); setDeleteId(null) }}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  )
}
