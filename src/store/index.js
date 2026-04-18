import { create } from 'zustand'
import { saveCafe, savePlatform } from '../lib/firestore'
import { RAW_MATERIALS as SEED_MATERIALS, PRODUCTS as SEED_PRODUCTS } from '../lib/seed'

// ─── Default data (من ريسيبي let's Café) ──────────────────
const DEFAULT_PRODUCTS      = SEED_PRODUCTS
const DEFAULT_RAW_MATERIALS = SEED_MATERIALS

const DEFAULT_PLATFORM = {
  appName: '',
  tenants: [
    {
      id:                'cafe1',
      name:              'let\'s 24',
      status:            'active',
      subscriptionEnds:  '2026-12-31',
      adminEmail:        'admin@cafe1.com',
      cashiers:          []
    }
  ]
}

// ─── Store ────────────────────────────────────────────────
export const useStore = create((set, get) => ({

  // ── Auth / Session ──────────────────────────────────────
  currentUser: null,      // { uid, email, role, cafeId, cafeName, displayName }
  isDarkMode: false,
  isOnline: true,
  syncStatus: 'idle',     // idle | saving | saved | error

  setCurrentUser:  (u)  => set({ currentUser: u }),
  setIsDarkMode:   (v)  => set({ isDarkMode: v }),
  setIsOnline:     (v)  => set({ isOnline: v }),
  setSyncStatus:   (v)  => set({ syncStatus: v }),

  // ── Platform (Super Admin) ──────────────────────────────
  platform: DEFAULT_PLATFORM,
  setPlatform: (data) => set({ platform: data }),

  savePlatformField: async (partial) => {
    const next = { ...get().platform, ...partial }
    set({ platform: next })
    try {
      await savePlatform(next)
    } catch (e) { console.error('Platform save error:', e) }
  },

  // ── Cafe data ────────────────────────────────────────────
  products:          DEFAULT_PRODUCTS,
  rawMaterials:      DEFAULT_RAW_MATERIALS,
  employees:         [],
  expenses:          [],
  tables:            [],
  shifts:            [],
  orders:            [],
  activeTableOrders: {},   // { tableId: cartItem[] }
  offers:            [],
  psDevices:         [],
  psSessions:        [],
  isTaxEnabled:      false,

  setCafeData: (data) => set({
    products:          data.products?.length    ? data.products          : DEFAULT_PRODUCTS,
    rawMaterials:      data.rawMaterials?.length ? data.rawMaterials     : DEFAULT_RAW_MATERIALS,
    employees:         data.employees           || [],
    expenses:          data.expenses            || [],
    tables:            data.tables              || [],
    shifts:            data.shifts              || [],
    orders:            data.orders              || [],
    activeTableOrders: data.activeTableOrders   || {},
    offers:            data.offers              || [],
    psDevices:         data.psDevices           || [],
    psSessions:        data.psSessions          || [],
    isTaxEnabled:      data.isTaxEnabled        ?? false
  }),

  resetCafeData: () => set({
    products: DEFAULT_PRODUCTS, rawMaterials: DEFAULT_RAW_MATERIALS, employees: [],
    expenses: [], tables: [], shifts: [], orders: [],
    activeTableOrders: {}, offers: [], psDevices: [], psSessions: [],
    isTaxEnabled: false
  }),

  // ── Sync — debounced + instant first call ────────────────
  // يحفظ فوراً، ولو جاء request ثاني خلال 300ms يدمجهم معاً
  _syncTimer:   null,
  _syncBuffer:  {},

  sync: (partial) => {
    const { currentUser } = get()
    if (!currentUser?.cafeId) return

    const cafeId = currentUser.cafeId

    // دمج الـ partial الجديد في الـ buffer
    set(s => ({ _syncBuffer: { ...s._syncBuffer, ...partial } }))
    set({ syncStatus: 'saving' })

    // إلغاء الـ timer السابق لو موجود (debounce)
    if (get()._syncTimer) clearTimeout(get()._syncTimer)

    const timer = setTimeout(async () => {
      const buffer = get()._syncBuffer
      if (!Object.keys(buffer).length) return

      // امسح الـ buffer قبل الإرسال عشان أي تغييرات جديدة تتجمع من جديد
      set({ _syncBuffer: {}, _syncTimer: null })

      try {
        await saveCafe(cafeId, buffer)
        set({ syncStatus: 'saved' })
        setTimeout(() => set(s => s.syncStatus === 'saved' ? { syncStatus: 'idle' } : {}), 2000)
      } catch (e) {
        // عند الفشل: ارجع الـ buffer + علّم بالخطأ
        set(s => ({ syncStatus: 'error', _syncBuffer: { ...buffer, ...s._syncBuffer } }))
        console.error('Sync error:', e)
      }
    }, 300) // 300ms debounce — سريع جداً للمستخدم ومش بيحمّل Firebase

    set({ _syncTimer: timer })
  },

  // ── Products ─────────────────────────────────────────────
  upsertProduct: (product) => {
    const list = get().products
    const next = product.id
      ? list.map(p => p.id === product.id ? { ...p, ...product } : p)
      : [...list, { ...product, id: `p_${Date.now()}` }]
    set({ products: next })
    get().sync({ products: next })
  },
  deleteProduct: (id) => {
    const next = get().products.filter(p => p.id !== id)
    set({ products: next })
    get().sync({ products: next })
  },

  // ── Raw Materials ─────────────────────────────────────────
  upsertMaterial: (mat) => {
    const list = get().rawMaterials
    const next = mat.id
      ? list.map(m => m.id === mat.id ? { ...m, ...mat } : m)
      : [...list, { ...mat, id: `rm_${Date.now()}` }]
    set({ rawMaterials: next })
    get().sync({ rawMaterials: next })
  },
  deleteMaterial: (id) => {
    const next = get().rawMaterials.filter(m => m.id !== id)
    set({ rawMaterials: next })
    get().sync({ rawMaterials: next })
  },

  // ── Employees ─────────────────────────────────────────────
  upsertEmployee: (emp) => {
    const list = get().employees
    const next = emp.id
      ? list.map(e => e.id === emp.id ? { ...e, ...emp } : e)
      : [...list, { ...emp, id: `emp_${Date.now()}`, advances: 0, deductions: 0 }]
    set({ employees: next })
    get().sync({ employees: next })
  },
  deleteEmployee: (id) => {
    const next = get().employees.filter(e => e.id !== id)
    set({ employees: next })
    get().sync({ employees: next })
  },

  // ── Expenses ─────────────────────────────────────────────
  addExpense: (exp) => {
    const next = [...get().expenses, { ...exp, id: `ex_${Date.now()}`, date: new Date().toISOString().split('T')[0] }]
    set({ expenses: next })
    get().sync({ expenses: next })
  },
  deleteExpense: (id) => {
    const next = get().expenses.filter(e => e.id !== id)
    set({ expenses: next })
    get().sync({ expenses: next })
  },

  // ── Tables ────────────────────────────────────────────────
  upsertTable: (table) => {
    const list = get().tables
    const next = table.id
      ? list.map(t => t.id === table.id ? { ...t, ...table } : t)
      : [...list, { ...table, id: `tbl_${Date.now()}` }]
    set({ tables: next })
    get().sync({ tables: next })
  },
  deleteTable: (id) => {
    const next = get().tables.filter(t => t.id !== id)
    set({ tables: next })
    get().sync({ tables: next })
  },

  // ── Offers ────────────────────────────────────────────────
  upsertOffer: (offer) => {
    const list = get().offers
    const next = offer.id
      ? list.map(o => o.id === offer.id ? { ...o, ...offer } : o)
      : [...list, { ...offer, id: `off_${Date.now()}`, isActive: true }]
    set({ offers: next })
    get().sync({ offers: next })
  },
  deleteOffer: (id) => {
    const next = get().offers.filter(o => o.id !== id)
    set({ offers: next })
    get().sync({ offers: next })
  },

  // ── Tax ───────────────────────────────────────────────────
  toggleTax: () => {
    const next = !get().isTaxEnabled
    set({ isTaxEnabled: next })
    get().sync({ isTaxEnabled: next })
  },

  // ── Shifts ────────────────────────────────────────────────
  openShift: (cashierName, startingCash) => {
    const shift = { id: `sh_${Date.now()}`, cashierName, startingCash, startTime: new Date().toLocaleString('ar-EG'), timestamp: Date.now(), status: 'open' }
    const next  = [...get().shifts, shift]
    set({ shifts: next })
    get().sync({ shifts: next })
    return shift
  },
  closeShift: (shiftId, actualCash) => {
    const { shifts, orders } = get()
    const shiftOrders = orders.filter(o => o.shiftId === shiftId)
    const totalSales  = shiftOrders.reduce((s, o) => s + o.total, 0)
    const next = shifts.map(s => s.id === shiftId
      ? { ...s, status: 'closed', endTime: new Date().toLocaleString('ar-EG'), actualCash, totalSales }
      : s)
    set({ shifts: next })
    get().sync({ shifts: next })
  },

  // ── Orders / POS ─────────────────────────────────────────
  placeOrder: (cart, options) => {
    const { orders, rawMaterials, products, activeTableOrders, isTaxEnabled } = get()
    const { orderType, tableId, shiftId, cashierName, discountType, discountValue, tableName } = options
    const TAX_RATE = 0.14

    // حساب المجاميع
    const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0)
    let discountAmount = 0
    if (discountValue > 0) {
      discountAmount = discountType === 'percent'
        ? Math.min(subtotal, subtotal * discountValue / 100)
        : Math.min(subtotal, discountValue)
    }
    const afterDiscount = subtotal - discountAmount
    const tax   = isTaxEnabled ? afterDiscount * TAX_RATE : 0
    const total = afterDiscount + tax

    // خصم من المخزون
    const newMaterials = rawMaterials.map(rm => ({ ...rm }))
    cart.forEach(ci => {
      const prod = products.find(p => p.id === ci.id)
      if (!prod?.recipe) return
      prod.recipe.forEach(r => {
        const idx = newMaterials.findIndex(m => m.id === r.materialId)
        if (idx !== -1) newMaterials[idx].currentStock -= r.amount * ci.quantity
      })
    })

    const order = {
      id: `ord_${Date.now()}`,
      items: cart, subtotal, discountAmount, discountType, discountValue,
      tax, total, shiftId, cashierName,
      note: orderType === 'takeaway' ? 'تيك أواي' : `صالة — ${tableName}`,
      date: new Date().toLocaleString('ar-EG'),
      timestamp: Date.now()
    }

    const newOrders = [...orders, order]
    let newATO = { ...activeTableOrders }
    if (orderType === 'dine_in' && tableId) delete newATO[tableId]

    set({ orders: newOrders, rawMaterials: newMaterials, activeTableOrders: newATO })
    get().sync({ orders: newOrders, rawMaterials: newMaterials, activeTableOrders: newATO })
    return order
  },

  holdTable: async (tableId, cart) => {
    const next = { ...get().activeTableOrders, [tableId]: cart }
    set({ activeTableOrders: next })
    await get().sync({ activeTableOrders: next })
  },

  // ── PlayStation ───────────────────────────────────────────
  upsertPsDevice: (device) => {
    const list = get().psDevices
    const next = device.id
      ? list.map(d => d.id === device.id ? { ...d, ...device } : d)
      : [...list, { ...device, id: `ps_${Date.now()}` }]
    set({ psDevices: next })
    get().sync({ psDevices: next })
  },
  deletePsDevice: (id) => {
    const next = get().psDevices.filter(d => d.id !== id)
    set({ psDevices: next })
    get().sync({ psDevices: next })
  },
  startPsSession: (deviceId, cashierName) => {
    const device  = get().psDevices.find(d => d.id === deviceId)
    const session = { id: `pss_${Date.now()}`, deviceId, deviceName: device?.name || '', startTime: Date.now(), startTimeStr: new Date().toLocaleString('ar-EG'), status: 'active', cashierName }
    const next    = [...get().psSessions, session]
    set({ psSessions: next })
    get().sync({ psSessions: next })
  },
  endPsSession: (sessionId) => {
    const { psSessions, psDevices, orders } = get()
    const session = psSessions.find(s => s.id === sessionId)
    if (!session) return
    const device      = psDevices.find(d => d.id === session.deviceId)
    const durationMin = Math.ceil((Date.now() - session.startTime) / 60000)

    // تقريب لأقرب 15 دقيقة — كل 15 دقيقة = ربع تعريفة الساعة
    // مثال: 13 دقيقة → 15 دقيقة (ربع ساعة)، 28 دقيقة → 30 دقيقة (نص ساعة)
    const quarterUnits  = Math.ceil(durationMin / 15)          // عدد الأرباع
    const hourlyRate    = device?.hourlyRate || 0
    const cost          = (quarterUnits * (hourlyRate / 4))     // كل ربع = hourlyRate ÷ 4
    const billedMin     = quarterUnits * 15                     // الوقت المحسوب فعلياً

    const ended = {
      ...session,
      status: 'ended',
      endTime:     Date.now(),
      endTimeStr:  new Date().toLocaleString('ar-EG'),
      durationMin,   // الوقت الفعلي
      billedMin,     // الوقت المحسوب (مقرّب)
      cost
    }
    const newSessions = psSessions.map(s => s.id === sessionId ? ended : s)

    let newOrders = orders
    if (cost > 0) {
      const psOrder = {
        id: `ord_${Date.now()}`,
        items: [{
          id:       sessionId,
          name:     `${device.name} — ${durationMin} دقيقة (محسوب: ${billedMin} دقيقة)`,
          price:    cost,
          quantity: 1
        }],
        subtotal: cost, discountAmount: 0, tax: 0, total: cost,
        note:        `بلايستيشن — ${device.name}`,
        cashierName: session.cashierName,
        date:        new Date().toLocaleString('ar-EG'),
        timestamp:   Date.now()
      }
      newOrders = [...orders, psOrder]
    }
    set({ psSessions: newSessions, orders: newOrders })
    get().sync({ psSessions: newSessions, orders: newOrders })
  }
}))

// ─── Selectors (computed) ─────────────────────────────────
export const selectActiveShift = (cashierName) => (state) =>
  state.shifts.find(s => s.status === 'open' && s.cashierName === cashierName)

export const selectLowStock = (threshold = 50) => (state) =>
  state.rawMaterials.filter(m => m.currentStock <= threshold)

export const selectExpiringProducts = (state) => {
  const now  = new Date()
  const soon = new Date(now.getTime() + 7 * 86400000)
  return {
    expired: state.products.filter(p => p.expiryDate && new Date(p.expiryDate) <= now),
    nearExpiry: state.products.filter(p => p.expiryDate && new Date(p.expiryDate) > now && new Date(p.expiryDate) <= soon)
  }
}

export const selectFinancials = (period) => (state) => {
  const filter = makeFilter(period)
  const orders   = (state.orders   || []).filter(o => filter(o.timestamp))
  const expenses = (state.expenses || []).filter(e => filter(new Date(e.date).getTime()))

  const revenue  = orders.reduce((s, o) => s + o.total, 0)
  const expTotal = expenses.reduce((s, e) => s + e.amount, 0)
  let cogs = 0
  orders.forEach(o => (o.items || []).forEach(item => {
    const prod = (state.products || []).find(p => p.id === item.id)
    if (!prod?.recipe) return
    prod.recipe.forEach(r => {
      const mat = (state.rawMaterials || []).find(m => m.id === r.materialId)
      if (mat) cogs += r.amount * item.quantity * mat.costPerUnit
    })
  }))
  return { revenue, expenses: expTotal, cogs, profit: revenue - expTotal - cogs, orders, ordersCount: orders.length }
}

function makeFilter(period) {
  const now = new Date()
  return (ts) => {
    if (!ts || period === 'all') return true
    const d = new Date(ts)
    if (period === 'daily')     return d.toDateString() === now.toDateString()
    if (period === 'weekly')    { const s = new Date(now); s.setDate(now.getDate() - now.getDay()); return d >= s }
    if (period === 'monthly')   return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    if (period === 'quarterly') return Math.floor(d.getMonth()/3) === Math.floor(now.getMonth()/3) && d.getFullYear() === now.getFullYear()
    if (period === 'semi')      return Math.floor(d.getMonth()/6) === Math.floor(now.getMonth()/6) && d.getFullYear() === now.getFullYear()
    if (period === 'yearly')    return d.getFullYear() === now.getFullYear()
    return true
  }
}
