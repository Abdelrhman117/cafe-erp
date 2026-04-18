import { useState, useRef } from 'react'
import { Package, Plus, Trash2, Bell, Edit2, Check, X as XIcon } from 'lucide-react'
import { useStore, selectLowStock } from '../store'
import { Modal, ConfirmDelete, PageHeader, Input, Select, Btn, AlertBanner } from '../components/UI'

const UNITS = ['جرام', 'مللي', 'قطعة', 'كيلو', 'لتر', 'باكت', 'كيس', 'كان', 'علبة', 'زجاجة', 'ورقة', 'عود']
const LOW_THRESHOLD = 50

function EditCell({ value, onSave, className = '' }) {
  const [editing, setEditing] = useState(false)
  const [val, setVal]         = useState(value)
  const inputRef              = useRef(null)

  const start  = () => { setVal(value); setEditing(true); setTimeout(() => inputRef.current?.focus(), 50) }
  const save   = () => { onSave(parseFloat(val) || 0); setEditing(false) }
  const cancel = () => setEditing(false)

  if (editing) return (
    <div className="flex items-center gap-1">
      <input ref={inputRef} type="number" value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel() }}
        className="w-24 p-1.5 border-2 border-indigo-400 rounded-lg text-center text-sm font-bold bg-white dark:bg-slate-900 text-slate-800 dark:text-white outline-none"
      />
      <button onClick={save}   className="text-emerald-500 hover:text-emerald-600 p-1"><Check size={14}/></button>
      <button onClick={cancel} className="text-slate-400 hover:text-rose-500 p-1"><XIcon size={14}/></button>
    </div>
  )

  return (
    <button onClick={start} className={`group flex items-center gap-1.5 hover:text-indigo-600 transition-colors font-bold text-sm ${className}`}>
      {value}
      <Edit2 size={11} className="opacity-0 group-hover:opacity-60 transition-opacity" />
    </button>
  )
}

export default function InventoryPage() {
  const { rawMaterials, upsertMaterial, deleteMaterial } = useStore()
  const lowStock = useStore(selectLowStock(LOW_THRESHOLD))

  const [showModal, setShowModal] = useState(false)
  const [deleteId,  setDeleteId]  = useState(null)
  const [search,    setSearch]    = useState('')
  const [form, setForm] = useState({ name: '', unit: 'جرام', currentStock: '', costPerUnit: '' })

  const handleSave = (e) => {
    e.preventDefault()
    upsertMaterial({ ...form, currentStock: parseFloat(form.currentStock), costPerUnit: parseFloat(form.costPerUnit) })
    setShowModal(false)
    setForm({ name: '', unit: 'جرام', currentStock: '', costPerUnit: '' })
  }

  const totalValue = rawMaterials.reduce((s, m) => s + m.currentStock * m.costPerUnit, 0)
  const filtered   = search.trim() ? rawMaterials.filter(m => m.name.includes(search.trim())) : rawMaterials

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <PageHeader
        icon={<Package size={28} />}
        title="المواد الخام والمخزون"
        action={<Btn onClick={() => setShowModal(true)}><Plus size={17} /> مادة جديدة</Btn>}
      />

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm text-center">
          <p className="text-2xl font-black text-indigo-600">{rawMaterials.length}</p>
          <p className="text-xs text-slate-500 font-bold mt-1">إجمالي المواد</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm text-center">
          <p className="text-2xl font-black text-rose-600">{lowStock.length}</p>
          <p className="text-xs text-slate-500 font-bold mt-1">مواد منخفضة</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm text-center">
          <p className="text-2xl font-black text-emerald-600">{rawMaterials.filter(m => m.currentStock > LOW_THRESHOLD).length}</p>
          <p className="text-xs text-slate-500 font-bold mt-1">مواد كافية</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm text-center">
          <p className="text-2xl font-black text-amber-600">{totalValue.toFixed(0)} ج</p>
          <p className="text-xs text-slate-500 font-bold mt-1">قيمة المخزون</p>
        </div>
      </div>

      {lowStock.length > 0 && (
        <AlertBanner
          icon={<Bell className="w-5 h-5 text-rose-500" />}
          title={`⚠️ ${lowStock.length} مادة وصلت للحد الأدنى (${LOW_THRESHOLD})`}
          items={lowStock.map(m => `${m.name} (${m.currentStock} ${m.unit})`)}
          color="rose"
        />
      )}

      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث في المواد الخام..."
        className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 font-bold text-slate-700 dark:text-white text-sm"
      />

      <p className="text-xs text-slate-400 dark:text-slate-500 font-bold flex items-center gap-1.5">
        <Edit2 size={11} /> اضغط على أي قيمة للتعديل المباشر — Enter للحفظ، Esc للإلغاء
      </p>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-right">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-500 text-xs font-bold">
              <tr>
                <th className="p-4">المادة</th>
                <th className="p-4">الوحدة</th>
                <th className="p-4">الكمية الحالية ✏️</th>
                <th className="p-4">تكلفة الوحدة (ج) ✏️</th>
                <th className="p-4">قيمة المخزون</th>
                <th className="p-4 text-center">حذف</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(m => {
                const isEmpty = m.currentStock <= 0
                const isLow   = m.currentStock <= LOW_THRESHOLD && !isEmpty
                return (
                  <tr key={m.id} className={`border-b border-slate-100 dark:border-slate-700 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${isLow || isEmpty ? 'bg-rose-50/40 dark:bg-rose-900/10' : ''}`}>
                    <td className="p-4">
                      <div className="flex items-center gap-2 font-black text-slate-800 dark:text-white">
                        {(isLow || isEmpty) && <Bell size={13} className="text-rose-500 shrink-0 animate-pulse" />}
                        {m.name}
                      </div>
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400 font-bold">{m.unit}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-lg font-black text-[10px] ${isEmpty ? 'bg-red-100 text-red-700' : isLow ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
                          {isEmpty ? 'نفد' : isLow ? 'منخفض' : 'كافٍ'}
                        </span>
                        <EditCell value={m.currentStock} onSave={v => upsertMaterial({ ...m, currentStock: v })}
                          className={isEmpty ? 'text-red-600' : isLow ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-200'} />
                      </div>
                    </td>
                    <td className="p-4">
                      <EditCell value={m.costPerUnit} onSave={v => upsertMaterial({ ...m, costPerUnit: v })}
                        className="text-indigo-600 dark:text-indigo-400" />
                    </td>
                    <td className="p-4 font-bold text-slate-500 dark:text-slate-400 text-sm">
                      {(m.currentStock * m.costPerUnit).toFixed(2)} ج
                    </td>
                    <td className="p-4 text-center">
                      <button onClick={() => setDeleteId(m.id)} className="text-rose-500 p-2 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-xl transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                )
              })}
              {!filtered.length && (
                <tr><td colSpan={6} className="p-10 text-center text-slate-400 font-bold">
                  {search ? `لا توجد نتائج لـ "${search}"` : 'لا توجد مواد خام'}
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal title="إضافة مادة خام" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="space-y-4">
            <Input label="اسم المادة" required value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} placeholder="مثال: حليب، قهوة..." />
            <Select label="وحدة القياس" required value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })}>
              {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
            </Select>
            <div className="grid grid-cols-2 gap-4">
              <Input label="الكمية الافتتاحية" required type="number" step="any" min="0"
                value={form.currentStock} onChange={e => setForm({ ...form, currentStock: e.target.value })} placeholder="0" />
              <Input label="تكلفة الوحدة (ج)" required type="number" step="any" min="0"
                value={form.costPerUnit} onChange={e => setForm({ ...form, costPerUnit: e.target.value })} placeholder="0.00" />
            </div>
            <Btn type="submit" className="w-full justify-center py-4 text-base">حفظ المادة</Btn>
          </form>
        </Modal>
      )}

      {deleteId && (
        <ConfirmDelete
          onConfirm={() => { deleteMaterial(deleteId); setDeleteId(null) }}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  )
}
