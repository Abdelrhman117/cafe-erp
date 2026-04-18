import { useState, useRef } from 'react'
import { Coffee, Plus, Trash2, AlertCircle, AlertTriangle, Calendar, Edit2, Check, X as XIcon } from 'lucide-react'
import { useStore, selectExpiringProducts } from '../store'
import { Modal, ConfirmDelete, PageHeader, Input, Select, Btn, AlertBanner } from '../components/UI'

// ── Inline price editor ───────────────────────────────────
function PriceCell({ product, onSave }) {
  const [editing, setEditing] = useState(false)
  const [val,     setVal]     = useState(product.price)
  const inputRef              = useRef()

  const start  = () => { setVal(product.price); setEditing(true); setTimeout(() => inputRef.current?.focus(), 30) }
  const save   = () => { const n = parseFloat(val); if (!isNaN(n) && n >= 0) onSave(n); setEditing(false) }
  const cancel = () => setEditing(false)

  if (editing) return (
    <div className="flex items-center gap-1">
      <input ref={inputRef} type="number" min="0" step="any" value={val}
        onChange={e => setVal(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel() }}
        className="w-20 p-1.5 border-2 border-indigo-400 rounded-lg text-center text-sm font-black text-indigo-600 bg-white dark:bg-slate-900 outline-none"
      />
      <button onClick={save}   className="text-emerald-500 p-1 hover:text-emerald-600"><Check size={14}/></button>
      <button onClick={cancel} className="text-slate-400 p-1 hover:text-rose-500"><XIcon size={14}/></button>
    </div>
  )

  return (
    <button onClick={start}
      className={`group flex items-center gap-1.5 px-3 py-1 rounded-xl font-black text-sm transition-all hover:bg-indigo-100 dark:hover:bg-indigo-900/60
        ${product.price === 0 ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' : 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'}`}>
      {product.price === 0 ? '⚠️ 0' : product.price} ج
      <Edit2 size={10} className="opacity-0 group-hover:opacity-70 transition-opacity" />
    </button>
  )
}

export default function ProductsPage() {
  const { products, rawMaterials, upsertProduct, deleteProduct } = useStore()
  const { expired, nearExpiry } = useStore(selectExpiringProducts)

  const [showModal, setShowModal] = useState(false)
  const [deleteId,  setDeleteId]  = useState(null)
  const [form, setForm] = useState({ name: '', category: '', price: '', image: '', expiryDate: '', recipe: [] })

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))]

  const openAdd = () => {
    setForm({ name: '', category: '', price: '', image: '', expiryDate: '', recipe: [] })
    setShowModal(true)
  }

  const handleSave = (e) => {
    e.preventDefault()
    upsertProduct({
      ...form,
      price:      parseFloat(form.price),
      image:      form.image || null,
      expiryDate: form.expiryDate || null,
      recipe:     form.recipe.filter(r => r.materialId && r.amount > 0)
    })
    setShowModal(false)
  }

  const addRecipeRow    = () => setForm(f => ({ ...f, recipe: [...f.recipe, { materialId: '', amount: '' }] }))
  const removeRecipeRow = (i) => setForm(f => ({ ...f, recipe: f.recipe.filter((_, idx) => idx !== i) }))
  const updateRecipe    = (i, field, value) => setForm(f => {
    const r = [...f.recipe]; r[i] = { ...r[i], [field]: value }; return { ...f, recipe: r }
  })

  const isExpired  = (p) => p.expiryDate && new Date(p.expiryDate) <= new Date()
  const isNearExp  = (p) => {
    if (!p.expiryDate || isExpired(p)) return false
    return new Date(p.expiryDate) <= new Date(Date.now() + 7 * 86400000)
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <PageHeader
        icon={<Coffee size={28} />}
        title="المنتجات والوصفات"
        action={<Btn onClick={openAdd}><Plus size={17} /> منتج جديد</Btn>}
      />

      {expired.length > 0 && (
        <AlertBanner icon={<AlertCircle className="w-5 h-5 text-red-500" />}
          title={`🚫 منتجات منتهية الصلاحية (${expired.length})`}
          items={expired.map(p => p.name)} color="red" />
      )}
      {nearExpiry.length > 0 && (
        <AlertBanner icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
          title={`⏰ تنتهي صلاحيتها خلال 7 أيام (${nearExpiry.length})`}
          items={nearExpiry.map(p => `${p.name} (${p.expiryDate})`)} color="amber" />
      )}
      {products.filter(p => p.price === 0).length > 0 && (
        <AlertBanner icon={<AlertCircle className="w-5 h-5 text-amber-500" />}
          title={`💰 ${products.filter(p => p.price === 0).length} منتج سعره صفر — اضغط على السعر لتعديله`}
          items={products.filter(p => p.price === 0).slice(0, 8).map(p => p.name)}
          color="amber" />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {products.map(p => (
          <div key={p.id} className={`bg-white dark:bg-slate-800 p-5 rounded-3xl border-2 shadow-sm transition-colors ${isExpired(p) ? 'border-red-300 dark:border-red-700' : isNearExp(p) ? 'border-amber-300 dark:border-amber-700' : 'border-slate-200 dark:border-slate-700'}`}>
            <div className="flex justify-between mb-4">
              <div className="flex items-center gap-3 min-w-0">
                {p.image
                  ? <img src={p.image} alt={p.name} className="w-12 h-12 rounded-xl object-cover shadow-sm border border-slate-200 dark:border-slate-600 shrink-0"
                      onError={e => { e.target.onerror=null; e.target.src='https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&q=80' }} />
                  : <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/40 text-indigo-500 flex items-center justify-center shrink-0"><Coffee size={18} /></div>
                }
                <div className="min-w-0">
                  <h3 className="font-black text-base text-slate-800 dark:text-white truncate">{p.name}</h3>
                  <p className="text-xs text-slate-400 font-bold">{p.category}</p>
                  {p.expiryDate && (
                    <p className={`text-[10px] font-bold mt-0.5 flex items-center gap-1 ${isExpired(p) ? 'text-red-600' : isNearExp(p) ? 'text-amber-600' : 'text-slate-400'}`}>
                      <Calendar size={9} />
                      {isExpired(p) ? '🚫 منتهي' : isNearExp(p) ? '⏰ ينتهي قريباً' : '✓ صالح'} — {p.expiryDate}
                    </p>
                  )}
                </div>
              </div>
              <PriceCell product={p} onSave={price => upsertProduct({ ...p, price })} />
            </div>

            {/* Recipe */}
            {p.recipe?.length > 0 && (
              <div className="space-y-1.5 mb-4">
                {p.recipe.map((r, i) => {
                  const mat = rawMaterials.find(m => m.id === r.materialId)
                  return mat ? (
                    <div key={i} className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 p-2.5 rounded-xl flex justify-between border border-slate-100 dark:border-slate-600">
                      <span>{mat.name}</span>
                      <span className="text-indigo-600 dark:text-indigo-400">{r.amount} {mat.unit}</span>
                    </div>
                  ) : null
                })}
              </div>
            )}

            <button onClick={() => setDeleteId(p.id)} className="text-rose-500 bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 p-2.5 rounded-xl transition-colors">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      {/* Add modal */}
      {showModal && (
        <Modal title="إضافة منتج" onClose={() => setShowModal(false)} size="lg">
          <form onSubmit={handleSave} className="space-y-4">
            <Input label="اسم المنتج" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="مثال: لاتيه، موهيتو..." />
            <div className="grid grid-cols-2 gap-4">
              <Input label="الفئة / القسم" required value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                placeholder="مثال: ساخن، بارد..." list="cats-list" />
              <datalist id="cats-list">{categories.map(c => <option key={c} value={c} />)}</datalist>
              <Input label="السعر (ج)" required type="number" step="any" min="0" value={form.price}
                onChange={e => setForm({ ...form, price: e.target.value })} placeholder="0.00" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="تاريخ الصلاحية (اختياري)" type="date" value={form.expiryDate}
                onChange={e => setForm({ ...form, expiryDate: e.target.value })} />
              <Input label="رابط الصورة (اختياري)" value={form.image} dir="ltr"
                onChange={e => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
            </div>

            {/* Recipe builder */}
            <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-black text-slate-700 dark:text-white">مقادير الوصفة</label>
                <button type="button" onClick={addRecipeRow} className="text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-200 px-3 py-1.5 rounded-lg font-bold">+ مكوّن</button>
              </div>
              {!rawMaterials.length && (
                <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl font-bold">⚠️ أضف مواد خام أولاً حتى تتمكن من بناء الوصفة.</p>
              )}
              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                {form.recipe.map((row, i) => (
                  <div key={i} className="flex gap-2">
                    <select required value={row.materialId} onChange={e => updateRecipe(i, 'materialId', e.target.value)}
                      className="flex-1 p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:border-indigo-500">
                      <option value="" disabled>اختر مادة</option>
                      {rawMaterials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>)}
                    </select>
                    <input required type="number" step="any" min="0.01" value={row.amount} onChange={e => updateRecipe(i, 'amount', parseFloat(e.target.value))}
                      placeholder="الكمية"
                      className="w-24 p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-center font-bold bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:border-indigo-500" />
                    <button type="button" onClick={() => removeRecipeRow(i)} className="text-rose-500 bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 p-2.5 rounded-xl">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <Btn type="submit" className="w-full justify-center py-4 text-base">حفظ المنتج</Btn>
          </form>
        </Modal>
      )}

      {deleteId && (
        <ConfirmDelete
          onConfirm={() => { deleteProduct(deleteId); setDeleteId(null) }}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  )
}
