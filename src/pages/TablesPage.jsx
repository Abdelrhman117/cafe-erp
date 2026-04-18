import { useState } from 'react'
import { Utensils, Plus, Trash2, Armchair } from 'lucide-react'
import { useStore } from '../store'
import { Modal, ConfirmDelete, PageHeader, Input, Btn } from '../components/UI'

export default function TablesPage() {
  const { tables, upsertTable, deleteTable } = useStore()
  const [showModal, setShowModal] = useState(false)
  const [deleteId,  setDeleteId]  = useState(null)
  const [form, setForm] = useState({ name: '', capacity: '' })

  const handleSave = (e) => {
    e.preventDefault()
    upsertTable({ name: form.name, capacity: parseInt(form.capacity) })
    setShowModal(false)
    setForm({ name: '', capacity: '' })
  }

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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {tables.map(t => (
            <div key={t.id} className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 flex flex-col items-center shadow-sm relative group hover:border-indigo-300 transition-colors">
              <Armchair className="text-slate-300 dark:text-slate-600 mb-3 w-12 h-12 group-hover:text-indigo-400 transition-colors" />
              <h3 className="font-black text-base text-slate-800 dark:text-white line-clamp-1 text-center">{t.name}</h3>
              <p className="text-sm font-bold text-indigo-500 mt-1">{t.capacity} كراسي</p>
              <button
                onClick={() => setDeleteId(t.id)}
                className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 text-rose-500 bg-rose-50 dark:bg-rose-900/30 p-1.5 rounded-xl transition-all hover:bg-rose-100"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title="إضافة طاولة" onClose={() => setShowModal(false)} size="sm">
          <form onSubmit={handleSave} className="space-y-4">
            <Input label="اسم الطاولة" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="مثال: طاولة 1، VIP، حديقة..." />
            <Input label="عدد الكراسي" required type="number" min="1" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} placeholder="4" />
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
