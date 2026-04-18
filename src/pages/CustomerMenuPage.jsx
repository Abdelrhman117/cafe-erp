import { useState, useMemo } from 'react'
import { Coffee, Moon, Sun } from 'lucide-react'
import { useStore } from '../store'

export default function CustomerMenuPage() {
  const { products, offers, platform, isDarkMode, setIsDarkMode, setCurrentUser } = useStore()
  const [catFilter, setCatFilter] = useState('all')

  const categories = useMemo(() => [...new Set(products.map(p => p.category).filter(Boolean))], [products])

  const getOfferPrice = (product) => {
    const today = new Date()
    const offer = offers.find(o => {
      if (!o.isActive) return false
      if (o.productId && String(o.productId) !== String(product.id)) return false
      if (o.category  && o.category !== product.category) return false
      if (o.startDate && today < new Date(o.startDate)) return false
      if (o.endDate   && today > new Date(o.endDate))   return false
      return true
    })
    if (!offer) return product.price
    if (offer.discountType === 'percent') return Math.max(0, product.price * (1 - offer.discountValue / 100))
    return Math.max(0, product.price - offer.discountValue)
  }

  const filtered = catFilter === 'all' ? products : products.filter(p => p.category === catFilter)

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 w-full overflow-y-auto pb-10 pt-7 custom-scrollbar">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 px-4 md:px-8 py-4 shadow-sm sticky top-7 z-30 flex justify-between items-center border-b border-slate-200 dark:border-slate-700">
        <h1 className="text-xl md:text-2xl font-black text-indigo-600 flex items-center gap-2">
          <Coffee size={22} /> منيو {platform?.appName}
        </h1>
        <div className="flex items-center gap-3">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 bg-slate-100 dark:bg-slate-700 rounded-xl text-slate-500 dark:text-slate-300 transition-colors">
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={() => setCurrentUser(null)}
            className="text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-4 py-2 rounded-xl hover:bg-indigo-600 hover:text-white transition-colors">
            دخول الموظفين
          </button>
        </div>
      </header>

      {/* Category tabs */}
      <div className="px-4 md:px-8 flex gap-2 overflow-x-auto no-scrollbar sticky top-[calc(2rem+73px)] bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md z-20 pt-4 pb-3">
        <button onClick={() => setCatFilter('all')}
          className={`whitespace-nowrap px-5 py-2.5 rounded-full font-bold text-sm transition-all ${catFilter === 'all' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300'}`}>
          الكل
        </button>
        {categories.map(c => (
          <button key={c} onClick={() => setCatFilter(c)}
            className={`whitespace-nowrap px-5 py-2.5 rounded-full font-bold text-sm transition-all ${catFilter === c ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300'}`}>
            {c}
          </button>
        ))}
      </div>

      {/* Products grid */}
      <div className="px-4 md:px-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-5 max-w-7xl mx-auto mt-4">
        {filtered.map(p => {
          const op       = getOfferPrice(p)
          const hasOffer = op < p.price
          return (
            <div key={p.id} className="bg-white dark:bg-slate-800 rounded-3xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-lg transition-all duration-300 group flex flex-col relative">
              {hasOffer && (
                <div className="absolute top-3 left-3 z-10 bg-rose-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md">
                  🔥 عرض خاص!
                </div>
              )}
              {p.image
                ? <img src={p.image} alt={p.name} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500 shrink-0"
                    onError={e => { e.target.onerror=null; e.target.src='https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&q=80' }} />
                : <div className="w-full h-48 bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-300 shrink-0">
                    <Coffee size={56} />
                  </div>
              }
              <div className="p-4 flex flex-col flex-1 justify-between gap-3">
                <div>
                  <h3 className="font-black text-lg text-slate-800 dark:text-white mb-1.5 line-clamp-2 leading-snug">{p.name}</h3>
                  <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded-lg">{p.category}</span>
                </div>
                <div className="flex justify-between items-center border-t border-slate-100 dark:border-slate-700 pt-3">
                  <div>
                    {hasOffer && <span className="text-slate-400 line-through text-sm block">{p.price} ج</span>}
                    <span className={`font-black text-xl ${hasOffer ? 'text-rose-500' : 'text-indigo-600 dark:text-indigo-400'}`}>
                      {op.toFixed(0)} ج.م
                    </span>
                  </div>
                  {p.stock <= 0
                    ? <span className="text-xs font-bold text-rose-600 bg-rose-50 dark:bg-rose-900/30 px-2.5 py-1 rounded-lg">نفدت الكمية</span>
                    : <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-lg">متاح ✓</span>
                  }
                </div>
              </div>
            </div>
          )
        })}

        {!filtered.length && (
          <div className="col-span-full text-center py-20 text-slate-400">
            <Coffee className="w-16 h-16 mx-auto mb-4 opacity-20" />
            <p className="font-bold text-lg">لا توجد منتجات في هذا القسم</p>
          </div>
        )}
      </div>
    </div>
  )
}
