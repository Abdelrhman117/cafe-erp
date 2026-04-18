import { useState } from 'react'
import { Receipt, Plus, Trash2 } from 'lucide-react'
import { useStore } from '../store'
import { Modal, ConfirmDelete, PageHeader, Input, Btn, DataTable } from '../components/UI'

export default function ExpensesPage() {
  const { expenses, addExpense, deleteExpense } = useStore()
  const [showModal, setShowModal] = useState(false)
  const [deleteId,  setDeleteId]  = useState(null)
  const [form, setForm] = useState({ description: '', amount: '' })

  const handleSave = (e) => {
    e.preventDefault()
    addExpense({ description: form.description, amount: parseFloat(form.amount) })
    setShowModal(false)
    setForm({ description: '', amount: '' })
  }

  const total = expenses.reduce((s, e) => s + e.amount, 0)

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <PageHeader
        icon={<Receipt size={28} />}
        title="المصروفات اليومية"
        action={<Btn onClick={() => setShowModal(true)}><Plus size={17} /> تسجيل مصروف</Btn>}
      />

      {expenses.length > 0 && (
        <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-2xl p-4 flex justify-between items-center">
          <span className="font-black text-rose-700 dark:text-rose-400">إجمالي المصروفات المسجلة</span>
          <span className="font-black text-2xl text-rose-600">{total.toFixed(2)} ج</span>
        </div>
      )}

      <DataTable
        headers={[{ label: 'التاريخ' }, { label: 'البيان' }, { label: 'المبلغ' }, { label: 'حذف', center: true }]}
        empty={!expenses.length ? 'لا توجد مصروفات مسجلة' : null}
      >
        {[...expenses].reverse().map(ex => (
          <tr key={ex.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-sm">
            <td className="p-4 font-bold text-slate-500 dark:text-slate-400 whitespace-nowrap">{ex.date}</td>
            <td className="p-4 font-black text-slate-800 dark:text-white">{ex.description}</td>
            <td className="p-4 font-black text-rose-500 dark:text-rose-400 text-base">{ex.amount} ج</td>
            <td className="p-4 text-center">
              <button onClick={() => setDeleteId(ex.id)} className="text-rose-500 p-2 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-colors">
                <Trash2 size={15} />
              </button>
            </td>
          </tr>
        ))}
      </DataTable>

      {showModal && (
        <Modal title="تسجيل مصروف" onClose={() => setShowModal(false)} size="sm">
          <form onSubmit={handleSave} className="space-y-4">
            <Input label="البيان (فيم صُرف المبلغ؟)" required value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })} placeholder="مثال: فاتورة كهرباء، نظافة..." />
            <Input label="المبلغ (ج.م)" required type="number" step="any" min="0.01"
              value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} placeholder="0.00" />
            <Btn type="submit" variant="danger" className="w-full justify-center py-4 text-base">تسجيل المصروف</Btn>
          </form>
        </Modal>
      )}

      {deleteId && (
        <ConfirmDelete
          onConfirm={() => { deleteExpense(deleteId); setDeleteId(null) }}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  )
}
