import { useState } from 'react'
import { Tag, Plus, Trash2, Gift } from 'lucide-react'
import { useStore } from '../store'
import { Modal, ConfirmDelete, PageHeader, Input, Select, Btn } from '../components/UI'

export default function OffersPage() {
  const { offers, products, upsertOffer, deleteOffer } = useStore()
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))]

  const [showModal, setShowModal] = useState(false)
  const [deleteId,  setDeleteId]  = useState(null)
  const [form, setForm] = useState({ name: '', discountType: 'percent', discountValue: '', productId: '', category: '', startDate: '', endDate: '' })

  const handleSave = (e) => {
    e.preventDefault()
    upsertOffer({
      name:          form.name,
      discountType:  form.discountType,
      discountValue: parseFloat(form.discountValue),
      productId:     form.productId || null,
      category:      form.category  || null,
      startDate:     form.startDate || null,
      endDate:       form.endDate   || null,
      isActive:      true
    })
    setShowModal(false)
    setForm({ name: '', discountType: 'percent', discountValue: '', productId: '', category: '', startDate: '', endDate: '' })
  }

  const toggleOffer = (offer) => upsertOffer({ ...offer, isActive: !offer.isActive })

  const isActive = (offer) => {
    if (!offer.isActive) return false
    const today = new Date()
    if (offer.startDate && today < new Date(offer.startDate)) return false
    if (offer.endDate   && today > new Date(offer.endDate))   return false
    return true
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6">
      <PageHeader
        icon={<Tag size={28} />}
        title="العروض والخصومات"
        action={<Btn onClick={() => setShowModal(true)}><Plus size={17} /> عرض جديد</Btn>}
      />

      {!offers.length ? (
        <div className="text-center py-20 text-slate-400">
          <Gift className="w-20 h-20 mx-auto mb-4 opacity-20" />
          <p className="font-bold text-lg">لا توجد عروض مفعّلة</p>
          <p className="text-sm mt-2">أضف عروضاً لتطبيقها تلقائياً على المنتجات في POS والمنيو الرقمي</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {offers.map(offer => {
            const active = isActive(offer)
            return (
              <div key={offer.id} className={`bg-white dark:bg-slate-800 p-5 rounded-3xl border-2 shadow-sm transition-all ${active ? 'border-emerald-300 dark:border-emerald-700' : 'border-slate-200 dark:border-slate-700 opacity-60'}`}>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-black text-lg text-slate-800 dark:text-white leading-tight">{offer.name}</h3>
                  <span className={`px-2.5 py-1 rounded-xl text-xs font-black shrink-0 ${active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                    {active ? '✅ مفعّل' : '⏸ موقوف'}
                  </span>
                </div>

                <div className="space-y-1.5 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-bold">الخصم</span>
                    <span className="font-black text-rose-600">{offer.discountValue}{offer.discountType === 'percent' ? '%' : ' ج'}</span>
                  </div>
                  {offer.productId && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold">المنتج</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 text-xs truncate max-w-[140px]">
                        {products.find(p => String(p.id) === String(offer.productId))?.name || offer.productId}
                      </span>
                    </div>
                  )}
                  {offer.category && (
                    <div className="flex justify-between">
                      <span className="text-slate-500 font-bold">الفئة</span>
                      <span className="font-bold text-indigo-600 dark:text-indigo-400">{offer.category}</span>
                    </div>
                  )}
                  {offer.startDate && <div className="flex justify-between"><span className="text-slate-500 font-bold">من</span><span className="font-bold text-xs">{offer.startDate}</span></div>}
                  {offer.endDate   && <div className="flex justify-between"><span className="text-slate-500 font-bold">حتى</span><span className="font-bold text-xs">{offer.endDate}</span></div>}
                  {!offer.productId && !offer.category && <p className="text-xs text-amber-600 font-bold bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg">📢 يُطبق على جميع المنتجات</p>}
                </div>

                <div className="flex gap-2">
                  <button onClick={() => toggleOffer(offer)}
                    className={`flex-1 py-2 rounded-xl text-xs font-black transition-colors ${offer.isActive ? 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}>
                    {offer.isActive ? 'إيقاف' : 'تفعيل'}
                  </button>
                  <button onClick={() => setDeleteId(offer.id)} className="bg-rose-50 dark:bg-rose-900/30 text-rose-500 hover:bg-rose-100 p-2 rounded-xl transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <Modal title="إضافة عرض جديد" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSave} className="space-y-4">
            <Input label="اسم العرض" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="مثال: خصم رمضان، عرض الصيف..." />
            <div className="grid grid-cols-2 gap-4">
              <Select label="نوع الخصم" value={form.discountType} onChange={e => setForm({ ...form, discountType: e.target.value })}>
                <option value="percent">نسبة مئوية %</option>
                <option value="fixed">مبلغ ثابت ج</option>
              </Select>
              <Input label={`قيمة الخصم (${form.discountType === 'percent' ? '%' : 'ج'})`} required type="number" step="any" min="0"
                value={form.discountValue} onChange={e => setForm({ ...form, discountValue: e.target.value })} placeholder="0" />
            </div>
            <Select label="تطبيق على منتج محدد (اختياري)" value={form.productId} onChange={e => setForm({ ...form, productId: e.target.value, category: '' })}>
              <option value="">كل المنتجات</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
            <Select label="أو تطبيق على فئة (اختياري)" value={form.category} onChange={e => setForm({ ...form, category: e.target.value, productId: '' })}>
              <option value="">كل الفئات</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </Select>
            <div className="grid grid-cols-2 gap-4">
              <Input label="تاريخ البداية" type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
              <Input label="تاريخ النهاية" type="date" value={form.endDate}   onChange={e => setForm({ ...form, endDate: e.target.value })} />
            </div>
            <Btn type="submit" variant="danger" className="w-full justify-center py-4 text-base">💾 حفظ العرض</Btn>
          </form>
        </Modal>
      )}

      {deleteId && (
        <ConfirmDelete
          onConfirm={() => { deleteOffer(deleteId); setDeleteId(null) }}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  )
}
