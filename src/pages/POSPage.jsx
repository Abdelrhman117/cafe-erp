import { useState, useMemo, useEffect } from 'react'
import { ShoppingCart, Plus, Minus, X, Banknote, Save, Package, Coffee,
         Armchair, RefreshCw, Receipt, Gamepad2, Tag, Play, Power, Clock, Gift } from 'lucide-react'
import { useStore } from '../store'
import { printReceipt } from '../lib/pdf'
import { Modal } from '../components/UI'

function getOfferPrice(product, offers) {
  if (!product || !offers?.length) return product?.price
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

function ProductCard({ product, offers, onAdd }) {
  const offerPrice = useMemo(() => getOfferPrice(product, offers), [product, offers])
  const hasOffer   = offerPrice < product.price
  return (
    <button
      onClick={() => onAdd(product, offerPrice)}
      className="bg-white dark:bg-slate-800 p-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:shadow-md transition-all flex flex-col items-center text-center gap-2 group relative"
    >
      {hasOffer && <div className="absolute top-1.5 right-1.5 bg-rose-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full z-10">عرض</div>}
      {product.image
        ? <img src={product.image} alt={product.name} className="w-14 h-14 rounded-full object-cover group-hover:scale-110 transition-transform border-2 border-slate-100 dark:border-slate-600"
            onError={e => { e.target.onerror = null; e.target.src = 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&q=80' }} />
        : <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"><Coffee className="w-6 h-6" /></div>
      }
      <p className="font-bold text-xs leading-tight line-clamp-2 text-slate-800 dark:text-white">{product.name}</p>
      <div>
        {hasOffer && <div className="text-slate-400 line-through text-[10px]">{product.price} ج</div>}
        <p className={`font-black text-xs ${hasOffer ? 'text-rose-500' : 'text-indigo-600 dark:text-indigo-400'}`}>{offerPrice.toFixed(0)} ج</p>
      </div>
    </button>
  )
}

function CartItem({ item, onInc, onDec }) {
  return (
    <div className="bg-slate-50 dark:bg-slate-700/50 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-600 flex justify-between items-center">
      <div className="flex gap-2 items-center min-w-0">
        {item.image
          ? <img src={item.image} alt={item.name} className="w-9 h-9 rounded-xl object-cover shrink-0" onError={e => { e.target.onerror=null; e.target.src='https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=200&q=80' }} />
          : <div className="w-9 h-9 bg-indigo-100 dark:bg-indigo-900 text-indigo-500 rounded-xl flex items-center justify-center shrink-0"><Coffee size={13} /></div>
        }
        <div className="min-w-0">
          <p className="font-bold text-slate-800 dark:text-white text-xs truncate max-w-[120px]">{item.name}</p>
          <p className="text-[10px] font-black text-indigo-600 dark:text-indigo-400">{(item.price * item.quantity).toFixed(2)} ج</p>
        </div>
      </div>
      <div className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-600 shrink-0">
        <button onClick={() => onInc(item.id)} className="text-emerald-500 p-1 hover:bg-emerald-50 dark:hover:bg-slate-700 rounded-lg"><Plus size={12} /></button>
        <span className="font-black w-5 text-center text-xs text-slate-800 dark:text-white">{item.quantity}</span>
        <button onClick={() => onDec(item.id)} className="text-rose-500 p-1 hover:bg-rose-50 dark:hover:bg-slate-700 rounded-lg"><Minus size={12} /></button>
      </div>
    </div>
  )
}

function LiveTimer({ startTime }) {
  const [elapsed, setElapsed] = useState(Math.floor((Date.now() - startTime) / 1000))
  useEffect(() => {
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 15000)
    return () => clearInterval(id)
  }, [startTime])
  const min = Math.floor(elapsed / 60)
  const hrs = Math.floor(min / 60)
  return <span>{hrs > 0 ? `${hrs}س ` : ''}{min % 60}د</span>
}

function PlayStationPanel({ currentUser }) {
  const { psDevices, psSessions, startPsSession, endPsSession } = useStore()
  const [, setTick] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60000)
    return () => clearInterval(id)
  }, [])

  const getSession  = (deviceId) => psSessions.find(s => s.deviceId === deviceId && s.status === 'active')
  const getLiveCost = (s, device) => Math.ceil(Math.ceil((Date.now() - s.startTime) / 60000) / 60) * (device.hourlyRate || 0)

  if (!psDevices.length) return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
      <Gamepad2 className="w-14 h-14 opacity-20" />
      <p className="font-bold text-sm">لا توجد أجهزة مسجلة</p>
      <p className="text-xs opacity-70">أضف أجهزة من قسم بلايستيشن في الإدارة</p>
    </div>
  )

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 overflow-y-auto custom-scrollbar p-0.5">
      {psDevices.map(device => {
        const session  = getSession(device.id)
        const liveCost = session ? getLiveCost(session, device) : 0
        return (
          <div key={device.id} className={`bg-white dark:bg-slate-800 p-4 rounded-2xl border-2 shadow-sm transition-all ${session ? 'border-emerald-400 dark:border-emerald-600' : 'border-slate-200 dark:border-slate-700'}`}>
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-black text-base text-slate-800 dark:text-white">{device.name}</h3>
                <p className="text-indigo-600 dark:text-indigo-400 font-bold text-xs mt-0.5 flex items-center gap-1">
                  <Clock size={10} /> {device.hourlyRate} ج/ساعة
                </p>
              </div>
              <span className={`px-2.5 py-1 rounded-xl text-[10px] font-black ${session ? 'bg-emerald-100 text-emerald-700 animate-pulse' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                {session ? '🟢 شغال' : '⚪ فاضي'}
              </span>
            </div>
            {session && (
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-2.5 mb-3 border border-emerald-200 dark:border-emerald-800 space-y-1">
                <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">⏱ المدة: <LiveTimer startTime={session.startTime} /></p>
                <p className="text-sm font-black text-emerald-600">💰 {liveCost} ج</p>
              </div>
            )}
            {session
              ? <button onClick={() => endPsSession(session.id)} className="w-full bg-rose-600 hover:bg-rose-700 text-white py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-colors"><Power size={13} /> إنهاء وإصدار فاتورة</button>
              : <button onClick={() => startPsSession(device.id, currentUser?.displayName)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 transition-colors"><Play size={13} /> بدء جلسة</button>
            }
          </div>
        )
      })}
    </div>
  )
}

function OffersPanel({ products }) {
  const { offers } = useStore()
  const activeOffers = useMemo(() => {
    const today = new Date()
    return offers.filter(o => o.isActive && (!o.startDate || today >= new Date(o.startDate)) && (!o.endDate || today <= new Date(o.endDate)))
  }, [offers])

  if (!activeOffers.length) return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400 gap-3">
      <Gift className="w-14 h-14 opacity-20" />
      <p className="font-bold text-sm">لا توجد عروض مفعّلة الآن</p>
    </div>
  )

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 overflow-y-auto custom-scrollbar p-0.5">
      {activeOffers.map(offer => {
        const targetProduct = offer.productId ? products.find(p => String(p.id) === String(offer.productId)) : null
        return (
          <div key={offer.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl border-2 border-emerald-300 dark:border-emerald-700 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-black text-base text-slate-800 dark:text-white leading-tight">{offer.name}</h3>
              <span className="bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400 px-2.5 py-1 rounded-xl font-black text-sm shrink-0">
                {offer.discountValue}{offer.discountType === 'percent' ? '%' : ' ج'}
              </span>
            </div>
            <div className="space-y-1 text-xs font-bold text-slate-500 dark:text-slate-400">
              {targetProduct && (
                <div className="flex items-center gap-1.5">
                  <Coffee size={10} className="text-indigo-400 shrink-0" />
                  <span className="text-indigo-600 dark:text-indigo-400 truncate">{targetProduct.name}</span>
                  <span className="text-slate-400 line-through shrink-0">{targetProduct.price} ج</span>
                  <span className="text-emerald-600 font-black shrink-0">{getOfferPrice(targetProduct, [offer]).toFixed(0)} ج</span>
                </div>
              )}
              {offer.category && !targetProduct && (
                <div className="flex items-center gap-1.5"><Tag size={10} className="text-indigo-400 shrink-0" /><span>فئة: {offer.category}</span></div>
              )}
              {!offer.productId && !offer.category && (
                <p className="text-amber-600 dark:text-amber-400">📢 يُطبق على جميع المنتجات</p>
              )}
              {offer.endDate && <p className="text-slate-400">⏰ ينتهي: {offer.endDate}</p>}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function POSPage() {
  const { products, offers, tables, isTaxEnabled, activeTableOrders, currentUser, placeOrder, holdTable } = useStore()
  const activeShift = useStore(s => s.shifts.find(sh => sh.status === 'open' && sh.cashierName === s.currentUser?.displayName))

  const [mode,         setMode]         = useState('takeaway')
  const [activeTable,  setActiveTable]  = useState(null)
  const [cart,         setCart]         = useState([])
  const [catFilter,    setCatFilter]    = useState('all')
  const [discountType, setDiscountType] = useState('percent')
  const [discountVal,  setDiscountVal]  = useState('')
  const [lastOrder,    setLastOrder]    = useState(null)
  const [cartOpen,     setCartOpen]     = useState(false)
  const [holding,      setHolding]      = useState(false)

  const isAdmin       = currentUser?.role === 'admin'
  const isProductMode = mode === 'takeaway' || mode === 'dine_in'
  const orderType     = mode === 'dine_in' ? 'dine_in' : 'takeaway'

  const categories       = useMemo(() => [...new Set(products.map(p => p.category).filter(Boolean))], [products])
  const filteredProducts = useMemo(() => catFilter === 'all' ? products : products.filter(p => p.category === catFilter), [products, catFilter])

  const activeOffersCount = useMemo(() => {
    const today = new Date()
    return offers.filter(o => o.isActive && (!o.startDate || today >= new Date(o.startDate)) && (!o.endDate || today <= new Date(o.endDate))).length
  }, [offers])
  const activePsCount = useStore(s => s.psSessions.filter(ss => ss.status === 'active').length)

  const addItem = (product, price) => {
    if (mode === 'dine_in' && !activeTable) { alert('اختر طاولة أولاً'); return }
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id)
      if (ex) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i)
      return [...prev, { ...product, price, quantity: 1 }]
    })
  }
  const incItem = id => setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: i.quantity + 1 } : i))
  const decItem = id => setCart(prev => {
    const it = prev.find(i => i.id === id)
    if (it?.quantity <= 1) return prev.filter(i => i.id !== id)
    return prev.map(i => i.id === id ? { ...i, quantity: i.quantity - 1 } : i)
  })

  const subtotal       = cart.reduce((s, i) => s + i.price * i.quantity, 0)
  const dv             = parseFloat(discountVal) || 0
  const discountAmount = isAdmin && dv > 0 ? (discountType === 'percent' ? Math.min(subtotal, subtotal * dv / 100) : Math.min(subtotal, dv)) : 0
  const afterDiscount  = subtotal - discountAmount
  const tax            = isTaxEnabled ? afterDiscount * 0.14 : 0
  const total          = afterDiscount + tax

  const handlePay = () => {
    if (!cart.length) return
    if (currentUser?.role === 'cashier' && !activeShift) { alert('افتح شيفت أولاً'); return }
    const order = placeOrder(cart, { orderType, tableId: activeTable?.id, tableName: activeTable?.name, shiftId: activeShift?.id, cashierName: currentUser?.displayName, discountType, discountValue: discountAmount > 0 ? dv : 0 })
    setLastOrder(order)
    setCart([]); setActiveTable(null); setMode('takeaway'); setDiscountVal(''); setCartOpen(false)
  }

  const handleHold = async () => {
    if (!activeTable || !cart.length || holding) return
    setHolding(true)
    await holdTable(activeTable.id, cart)
    setHolding(false)
    setCart([]); setActiveTable(null); setMode('takeaway'); setCartOpen(false)
  }

  const selectTable = (t) => {
    setActiveTable(t)
    const saved = activeTableOrders[t.id]
    setCart(Array.isArray(saved) ? saved : [])
  }

  const TABS = [
    { id: 'takeaway',    label: 'تيك أواي',  icon: <ShoppingCart size={14} /> },
    { id: 'dine_in',     label: 'صالة',       icon: <Armchair size={14} /> },
    { id: 'playstation', label: 'بلايستيشن',  icon: <Gamepad2 size={14} />, badge: activePsCount },
    { id: 'offers',      label: 'العروض',      icon: <Tag size={14} />,      badge: activeOffersCount },
  ]

  const CartPanel = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 flex justify-between items-center shrink-0">
        <h3 className="font-black text-lg flex items-center gap-2 text-slate-800 dark:text-white">
          <ShoppingCart className="text-indigo-500 w-5 h-5" /> السلة
          {activeTable && <span className="text-indigo-600 text-xs bg-indigo-100 dark:bg-indigo-900/40 px-2 py-1 rounded-lg">{activeTable.name}</span>}
        </h3>
        <div className="flex gap-2">
          {activeTable && <button onClick={() => { setCart([]); setActiveTable(null) }} className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2 py-1 rounded-lg hover:bg-rose-100">إلغاء</button>}
          <button className="lg:hidden text-slate-400 bg-slate-200 dark:bg-slate-700 p-1.5 rounded-lg" onClick={() => setCartOpen(false)}><X size={16} /></button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3 space-y-2 custom-scrollbar">
        {!cart.length
          ? <div className="text-center text-slate-400 mt-16"><Package className="w-10 h-10 mx-auto mb-2 opacity-20" /><p className="font-bold text-sm">السلة فارغة</p></div>
          : cart.map(item => <CartItem key={item.id} item={item} onInc={incItem} onDec={decItem} />)
        }
      </div>

      {isAdmin && cart.length > 0 && (
        <div className="px-3 pb-2">
          <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-800">
            <p className="text-xs font-black text-amber-700 dark:text-amber-400 mb-2 flex items-center gap-1"><Receipt size={12} /> خصم (المدير)</p>
            <div className="flex gap-2">
              <div className="flex bg-white dark:bg-slate-800 rounded-xl border border-amber-200 dark:border-amber-700 p-0.5 shrink-0">
                <button onClick={() => setDiscountType('percent')} className={`px-2 py-1 rounded-lg text-xs font-black ${discountType==='percent'?'bg-amber-500 text-white':'text-amber-600'}`}>%</button>
                <button onClick={() => setDiscountType('fixed')}   className={`px-2 py-1 rounded-lg text-xs font-black ${discountType==='fixed'?'bg-amber-500 text-white':'text-amber-600'}`}>ج</button>
              </div>
              <input type="number" min="0" value={discountVal} onChange={e => setDiscountVal(e.target.value)} placeholder={discountType==='percent'?'%':'مبلغ'}
                className="flex-1 p-2 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-700 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 outline-none text-center" />
              {discountVal && <button onClick={() => setDiscountVal('')} className="p-2 bg-white dark:bg-slate-800 border border-amber-200 rounded-xl text-amber-500"><X size={13} /></button>}
            </div>
          </div>
        </div>
      )}

      <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-700 shrink-0">
        <div className="space-y-1 mb-4 text-sm font-bold text-slate-500">
          <div className="flex justify-between"><span>المجموع</span><span>{subtotal.toFixed(2)} ج</span></div>
          {discountAmount > 0 && <div className="flex justify-between text-emerald-600 font-black"><span>خصم</span><span>-{discountAmount.toFixed(2)} ج</span></div>}
          {isTaxEnabled && <div className="flex justify-between"><span>ضريبة 14%</span><span>{tax.toFixed(2)} ج</span></div>}
          <div className="flex justify-between font-black text-2xl text-slate-800 dark:text-white pt-2 border-t border-slate-200 dark:border-slate-700">
            <span>الإجمالي</span><span className="text-indigo-600 dark:text-indigo-400">{total.toFixed(2)} ج</span>
          </div>
        </div>
        {mode === 'dine_in' && activeTable
          ? <div className="flex gap-2">
              <button onClick={handleHold} disabled={!cart.length || holding} className="flex-1 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-1.5 text-sm text-white disabled:opacity-50 bg-amber-500 hover:bg-amber-600 transition-colors">
                {holding ? <><RefreshCw size={14} className="animate-spin" />جاري...</> : <><Save size={15} />تعليق</>}
              </button>
              <button onClick={handlePay} disabled={!cart.length} className="flex-1 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-1.5 text-sm text-white disabled:opacity-50 bg-emerald-600 hover:bg-emerald-700 transition-colors">
                <Banknote size={15} /> دفع
              </button>
            </div>
          : <button onClick={handlePay} disabled={!cart.length} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 transition-colors text-base">
              <Banknote className="w-5 h-5" /> دفع وإصدار فاتورة
            </button>
        }
      </div>
    </div>
  )

  return (
    <div className="flex flex-col lg:flex-row h-full gap-4 p-3 md:p-5 overflow-hidden relative">

      <div className="flex-1 flex flex-col gap-3 overflow-hidden pb-16 lg:pb-0">

        {/* Mode tabs */}
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl w-fit border border-slate-200 dark:border-slate-700 gap-0.5">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setMode(tab.id)}
              className={`relative flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-sm transition-all
                ${mode === tab.id ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'}`}>
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge > 0 && (
                <span className={`absolute -top-1 -left-1 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-black flex items-center justify-center
                  ${mode === tab.id ? 'bg-white text-indigo-600' : 'bg-rose-500 text-white'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tables */}
        {mode === 'dine_in' && !activeTable && (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
            {tables.map(t => {
              const occ = Array.isArray(activeTableOrders[t.id]) && activeTableOrders[t.id].length > 0
              return (
                <button key={t.id} onClick={() => selectTable(t)}
                  className={`p-3 rounded-2xl border-2 flex flex-col items-center gap-1.5 transition-all text-sm
                    ${occ ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-amber-700' : 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 hover:border-indigo-400 text-slate-700 dark:text-slate-300'}`}>
                  <Armchair className="w-6 h-6" />
                  <span className="font-black text-xs line-clamp-1">{t.name}</span>
                  {occ && <span className="text-[9px] bg-amber-500 text-white px-1.5 py-0.5 rounded-full font-bold">{activeTableOrders[t.id].length} صنف</span>}
                </button>
              )
            })}
            {!tables.length && <p className="col-span-full text-center text-slate-400 font-bold py-4 text-sm">لا توجد طاولات</p>}
          </div>
        )}

        {isProductMode && (
          <>
            <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
              {['all', ...categories].map(c => (
                <button key={c} onClick={() => setCatFilter(c)}
                  className={`whitespace-nowrap px-4 py-2 rounded-xl font-bold text-xs transition-all
                    ${catFilter===c ? 'bg-indigo-600 text-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-300'}`}>
                  {c === 'all' ? 'الكل' : c}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2 overflow-y-auto custom-scrollbar pr-0.5">
              {filteredProducts.map(p => (
                <ProductCard key={p.id} product={p} offers={offers} onAdd={addItem} />
              ))}
            </div>
          </>
        )}

        {mode === 'playstation' && <PlayStationPanel currentUser={currentUser} />}
        {mode === 'offers'      && <OffersPanel products={products} />}
      </div>

      {/* Mobile bottom bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 p-3 border-t border-slate-200 dark:border-slate-700 z-30 flex justify-between items-center shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <span className="font-black text-indigo-600 dark:text-indigo-400 text-base">{total.toFixed(2)} ج</span>
        <button onClick={() => setCartOpen(true)} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 text-sm shadow-lg">
          <ShoppingCart size={16} /> السلة ({cart.length})
        </button>
      </div>

      {/* Desktop cart */}
      <div className="hidden lg:flex w-[340px] xl:w-[380px] bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm flex-col shrink-0">
        <CartPanel />
      </div>

      {/* Mobile cart drawer */}
      {cartOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-30 lg:hidden backdrop-blur-sm" onClick={() => setCartOpen(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-slate-800 rounded-t-3xl border border-slate-200 dark:border-slate-700 flex flex-col h-[85vh] lg:hidden">
            <CartPanel />
          </div>
        </>
      )}

      {/* Receipt */}
      {lastOrder && (
        <Modal title="إيصال الدفع" onClose={() => setLastOrder(null)}>
          <div className="print-section p-6 bg-white text-black text-center font-mono border-2 border-dashed border-slate-300 rounded-2xl mx-auto max-w-[280px]">
            <Coffee className="mx-auto mb-2 w-8 h-8 text-slate-800" />
            <h2 className="text-xl font-black mb-1">{currentUser?.cafeName}</h2>
            <p className="text-xs text-slate-500 mb-3">رقم: {String(lastOrder.id).slice(-6)}</p>
            <div className="border-y border-dashed border-slate-300 py-2 mb-3 text-xs">{lastOrder.date}</div>
            <div className="space-y-1.5 mb-3 text-right text-sm">
              {lastOrder.items.map((i, idx) => (
                <div key={idx} className="flex justify-between font-bold"><span>{i.quantity}× {i.name}</span><span>{(i.price * i.quantity).toFixed(2)}</span></div>
              ))}
            </div>
            <div className="border-t border-dashed border-slate-300 pt-2 space-y-1 text-sm mb-2">
              <div className="flex justify-between font-bold text-slate-600"><span>المجموع</span><span>{lastOrder.subtotal?.toFixed(2)}</span></div>
              {lastOrder.discountAmount > 0 && <div className="flex justify-between font-black text-emerald-600"><span>خصم</span><span>-{lastOrder.discountAmount.toFixed(2)}</span></div>}
              {lastOrder.tax > 0 && <div className="flex justify-between font-bold text-slate-600"><span>ضريبة 14%</span><span>{lastOrder.tax.toFixed(2)}</span></div>}
            </div>
            <div className="flex justify-between font-black text-xl border-t-2 border-slate-800 pt-3"><span>الإجمالي</span><span>{lastOrder.total.toFixed(2)} ج</span></div>
            <p className="text-[10px] mt-6 text-slate-500">الكاشير: {currentUser?.displayName}</p>
          </div>
          <button onClick={() => printReceipt({ order: lastOrder, cafeName: currentUser?.cafeName, cashierName: currentUser?.displayName })}
            className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 no-print shadow-lg text-base">
            🖨️ طباعة الإيصال
          </button>
        </Modal>
      )}
    </div>
  )
}
