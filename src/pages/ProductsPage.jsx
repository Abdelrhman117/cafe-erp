import { useState, useRef } from 'react'
import { Coffee, Plus, Trash2, AlertCircle, AlertTriangle, Calendar,
         Edit2, Check, X as XIcon, Camera, Upload, Link, Image } from 'lucide-react'
import { useStore, selectExpiringProducts } from '../store'
import { Modal, ConfirmDelete, PageHeader, Input, Select, Btn, AlertBanner } from '../components/UI'

// ── Resize image to base64 max 400px ─────────────────────
function resizeImage(file, maxSize = 400) {
  return new Promise((res, rej) => {
    const reader = new FileReader()
    reader.onerror = rej
    reader.onload  = (e) => {
      const img = new window.Image()
      img.onerror = rej
      img.onload  = () => {
        const ratio  = Math.min(maxSize / img.width, maxSize / img.height, 1)
        const canvas = document.createElement('canvas')
        canvas.width  = Math.round(img.width  * ratio)
        canvas.height = Math.round(img.height * ratio)
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        res(canvas.toDataURL('image/jpeg', 0.85))
      }
      img.src = e.target.result
    }
    reader.readAsDataURL(file)
  })
}

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
        ${product.price === 0
          ? 'bg-rose-50 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400'
          : 'bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400'}`}>
      {product.price === 0 ? '⚠️ 0' : product.price} ج
      <Edit2 size={10} className="opacity-0 group-hover:opacity-70 transition-opacity" />
    </button>
  )
}

// ── Image upload modal ────────────────────────────────────
function ImageModal({ product, onSave, onClose }) {
  const [tab,       setTab]       = useState('upload')   // 'upload' | 'url'
  const [urlVal,    setUrlVal]    = useState(product.image?.startsWith('http') ? product.image : '')
  const [preview,   setPreview]   = useState(product.image || '')
  const [uploading, setUploading] = useState(false)
  const [err,       setErr]       = useState('')
  const fileRef = useRef()

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { setErr('الحجم الأقصى 5MB'); return }
    setErr(''); setUploading(true)
    try {
      const b64 = await resizeImage(file, 400)
      setPreview(b64)
    } catch { setErr('فشل تحميل الصورة') }
    finally { setUploading(false) }
  }

  const handleUrlChange = (v) => {
    setUrlVal(v)
    setPreview(v)
    setErr('')
  }

  const handleSave = () => {
    const img = tab === 'url' ? urlVal.trim() : preview
    onSave(img || null)
    onClose()
  }

  return (
    <Modal title={`صورة — ${product.name}`} onClose={onClose} size="sm">
      <div className="space-y-4">

        {/* Preview */}
        <div className="flex justify-center">
          <div className="w-36 h-36 rounded-2xl border-2 border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
            {preview
              ? <img src={preview} alt="preview" className="w-full h-full object-cover"
                  onError={() => { setPreview(''); setErr('رابط الصورة غير صحيح') }} />
              : <Image size={40} className="text-slate-300 dark:text-slate-600" />
            }
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl">
          <button onClick={() => setTab('upload')}
            className={`flex-1 py-2 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-colors
              ${tab === 'upload' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500'}`}>
            <Upload size={13} /> رفع صورة
          </button>
          <button onClick={() => setTab('url')}
            className={`flex-1 py-2 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-colors
              ${tab === 'url' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-500'}`}>
            <Link size={13} /> رابط URL
          </button>
        </div>

        {/* Upload tab */}
        {tab === 'upload' && (
          <div>
            <div onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-indigo-300 dark:border-indigo-700 rounded-2xl p-6 text-center cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors">
              {uploading
                ? <div className="text-indigo-500 font-bold text-sm">جاري الضغط والرفع...</div>
                : <>
                    <Upload size={24} className="text-indigo-400 mx-auto mb-2" />
                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400">اضغط لاختيار صورة</p>
                    <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP — حتى 5MB</p>
                  </>
              }
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          </div>
        )}

        {/* URL tab */}
        {tab === 'url' && (
          <input type="url" value={urlVal} dir="ltr"
            onChange={e => handleUrlChange(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="w-full p-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 font-bold text-slate-800 dark:text-white text-sm"
          />
        )}

        {/* Error */}
        {err && <p className="text-xs text-rose-500 font-bold text-center">{err}</p>}

        {/* Actions */}
        <div className="flex gap-2">
          {(preview || product.image) && (
            <button onClick={() => { setPreview(''); setUrlVal(''); onSave(null); onClose() }}
              className="px-4 py-3 bg-rose-50 dark:bg-rose-900/30 text-rose-500 hover:bg-rose-100 rounded-xl font-bold text-sm transition-colors">
              حذف الصورة
            </button>
          )}
          <Btn onClick={handleSave} disabled={uploading || (!preview && tab === 'upload' && !product.image)}
            className="flex-1 justify-center py-3">
            حفظ الصورة
          </Btn>
        </div>
      </div>
    </Modal>
  )
}

// ── Main Page ─────────────────────────────────────────────
export default function ProductsPage() {
  const { products, rawMaterials, upsertProduct, deleteProduct } = useStore()
  const { expired, nearExpiry } = useStore(selectExpiringProducts)

  const [showModal,   setShowModal]   = useState(false)
  const [deleteId,    setDeleteId]    = useState(null)
  const [imageTarget, setImageTarget] = useState(null)  // product being edited
  const [search,      setSearch]      = useState('')
  const [filterCat,   setFilterCat]   = useState('الكل')
  const [form, setForm] = useState({ name: '', category: '', price: '', image: '', expiryDate: '', recipe: [] })

  const categories = ['الكل', ...new Set(products.map(p => p.category).filter(Boolean))]

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase())
    const matchCat    = filterCat === 'الكل' || p.category === filterCat
    return matchSearch && matchCat
  })

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

  const saveImage = (product, image) => upsertProduct({ ...product, image })

  const addRecipeRow    = () => setForm(f => ({ ...f, recipe: [...f.recipe, { materialId: '', amount: '' }] }))
  const removeRecipeRow = (i) => setForm(f => ({ ...f, recipe: f.recipe.filter((_, idx) => idx !== i) }))
  const updateRecipe    = (i, field, value) => setForm(f => {
    const r = [...f.recipe]; r[i] = { ...r[i], [field]: value }; return { ...f, recipe: r }
  })

  const isExpired = (p) => p.expiryDate && new Date(p.expiryDate) <= new Date()
  const isNearExp = (p) => {
    if (!p.expiryDate || isExpired(p)) return false
    return new Date(p.expiryDate) <= new Date(Date.now() + 7 * 86400000)
  }

  const noImageCount = products.filter(p => !p.image).length

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      <PageHeader
        icon={<Coffee size={28} />}
        title="المنتجات والوصفات"
        action={<Btn onClick={openAdd}><Plus size={17} /> منتج جديد</Btn>}
      />

      {/* Alerts */}
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
          items={products.filter(p => p.price === 0).slice(0, 8).map(p => p.name)} color="amber" />
      )}
      {noImageCount > 0 && (
        <AlertBanner icon={<Camera className="w-5 h-5 text-slate-400" />}
          title={`📷 ${noImageCount} منتج بدون صورة — اضغط أيقونة الكاميرا على أي كارت لإضافة صورة`}
          items={[]} color="slate" />
      )}

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="بحث في المنتجات..."
          className="flex-1 p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-indigo-500 font-bold text-slate-700 dark:text-white text-sm" />
        <div className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar">
          {categories.map(c => (
            <button key={c} onClick={() => setFilterCat(c)}
              className={`px-3 py-2 rounded-xl text-xs font-black whitespace-nowrap transition-colors
                ${filterCat === c ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-indigo-400'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(p => (
          <div key={p.id} className={`bg-white dark:bg-slate-800 rounded-3xl border-2 shadow-sm transition-colors overflow-hidden
            ${isExpired(p) ? 'border-red-300 dark:border-red-700' : isNearExp(p) ? 'border-amber-300 dark:border-amber-700' : 'border-slate-200 dark:border-slate-700'}`}>

            {/* Image area — click to change */}
            <div className="relative group cursor-pointer" onClick={() => setImageTarget(p)}>
              {p.image
                ? <img src={p.image} alt={p.name}
                    className="w-full h-40 object-cover"
                    onError={e => { e.target.onerror=null; e.target.style.display='none' }} />
                : <div className="w-full h-40 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex flex-col items-center justify-center gap-2">
                    <Coffee size={32} className="text-slate-300 dark:text-slate-600" />
                    <span className="text-xs font-bold text-slate-400">لا توجد صورة</span>
                  </div>
              }
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <div className="bg-white/90 text-slate-800 px-3 py-2 rounded-xl font-black text-xs flex items-center gap-1.5">
                  <Camera size={14} /> {p.image ? 'تغيير الصورة' : 'إضافة صورة'}
                </div>
              </div>
              {/* No image badge */}
              {!p.image && (
                <div className="absolute top-2 left-2 bg-slate-500/80 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                  بدون صورة
                </div>
              )}
            </div>

            {/* Card content */}
            <div className="p-4">
              <div className="flex justify-between items-start mb-3">
                <div className="min-w-0 flex-1 ml-2">
                  <h3 className="font-black text-base text-slate-800 dark:text-white truncate">{p.name}</h3>
                  <p className="text-xs text-slate-400 font-bold mt-0.5">{p.category}</p>
                  {p.expiryDate && (
                    <p className={`text-[10px] font-bold mt-0.5 flex items-center gap-1
                      ${isExpired(p) ? 'text-red-600' : isNearExp(p) ? 'text-amber-600' : 'text-slate-400'}`}>
                      <Calendar size={9} />
                      {isExpired(p) ? '🚫 منتهي' : isNearExp(p) ? '⏰ ينتهي قريباً' : '✓ صالح'} — {p.expiryDate}
                    </p>
                  )}
                </div>
                <PriceCell product={p} onSave={price => upsertProduct({ ...p, price })} />
              </div>

              {/* Recipe */}
              {p.recipe?.length > 0 && (
                <div className="space-y-1 mb-3">
                  {p.recipe.slice(0, 3).map((r, i) => {
                    const mat = rawMaterials.find(m => m.id === r.materialId)
                    return mat ? (
                      <div key={i} className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 px-2.5 py-1.5 rounded-lg flex justify-between border border-slate-100 dark:border-slate-600">
                        <span className="truncate ml-2">{mat.name}</span>
                        <span className="text-indigo-600 dark:text-indigo-400 shrink-0">{r.amount} {mat.unit}</span>
                      </div>
                    ) : null
                  })}
                  {p.recipe.length > 3 && (
                    <p className="text-[10px] text-slate-400 font-bold text-center">+{p.recipe.length - 3} مكونات أخرى</p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 mt-2">
                <button onClick={() => setImageTarget(p)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-colors flex-1 justify-center
                    ${p.image
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400'}`}>
                  <Camera size={13} />
                  {p.image ? 'تغيير الصورة' : 'إضافة صورة'}
                </button>
                <button onClick={() => setDeleteId(p.id)}
                  className="text-rose-500 bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 p-2.5 rounded-xl transition-colors">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {!filtered.length && (
          <div className="col-span-3 text-center py-16 text-slate-400 font-bold">
            {search || filterCat !== 'الكل' ? `لا توجد نتائج` : 'لا توجد منتجات'}
          </div>
        )}
      </div>

      {/* Add modal */}
      {showModal && (
        <Modal title="إضافة منتج" onClose={() => setShowModal(false)} size="lg">
          <form onSubmit={handleSave} className="space-y-4">
            <Input label="اسم المنتج" required value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} placeholder="مثال: لاتيه، موهيتو..." />
            <div className="grid grid-cols-2 gap-4">
              <Input label="الفئة / القسم" required value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                placeholder="مثال: Espresso، Frappe..." list="cats-list" />
              <datalist id="cats-list">{categories.filter(c => c !== 'الكل').map(c => <option key={c} value={c} />)}</datalist>
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
                <button type="button" onClick={addRecipeRow}
                  className="text-xs bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-200 px-3 py-1.5 rounded-lg font-bold">
                  + مكوّن
                </button>
              </div>
              {!rawMaterials.length && (
                <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl font-bold">
                  ⚠️ أضف مواد خام أولاً حتى تتمكن من بناء الوصفة.
                </p>
              )}
              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                {form.recipe.map((row, i) => (
                  <div key={i} className="flex gap-2">
                    <select required value={row.materialId} onChange={e => updateRecipe(i, 'materialId', e.target.value)}
                      className="flex-1 p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:border-indigo-500">
                      <option value="" disabled>اختر مادة</option>
                      {rawMaterials.map(m => <option key={m.id} value={m.id}>{m.name} ({m.unit})</option>)}
                    </select>
                    <input required type="number" step="any" min="0.01" value={row.amount}
                      onChange={e => updateRecipe(i, 'amount', parseFloat(e.target.value))}
                      placeholder="الكمية"
                      className="w-24 p-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-center font-bold bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-white outline-none focus:border-indigo-500" />
                    <button type="button" onClick={() => removeRecipeRow(i)}
                      className="text-rose-500 bg-rose-50 dark:bg-rose-900/30 hover:bg-rose-100 p-2.5 rounded-xl">
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

      {/* Image modal */}
      {imageTarget && (
        <ImageModal
          product={imageTarget}
          onSave={(img) => saveImage(imageTarget, img)}
          onClose={() => setImageTarget(null)}
        />
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
