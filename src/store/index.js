import { create } from 'zustand'
import { saveCafe, savePlatform } from '../lib/firestore'
import { saveLocal } from '../lib/localCache'
import { RAW_MATERIALS as SEED_MATERIALS, PRODUCTS as SEED_PRODUCTS } from '../lib/seed'

const PENDING_DELETES_KEY = 'erp_pending_deletes'
const PENDING_DELETES_TTL = 86400000 // 24 hours — covers all-day offline scenarios

function loadPendingDeletes() {
  try {
    const stored = JSON.parse(localStorage.getItem(PENDING_DELETES_KEY) || '{}')
    const now = Date.now()
    return Object.fromEntries(Object.entries(stored).filter(([, ts]) => now - ts < PENDING_DELETES_TTL))
  } catch { return {} }
}

function savePendingDeletes(obj) {
  try { localStorage.setItem(PENDING_DELETES_KEY, JSON.stringify(obj)) } catch {}
}

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
  isDarkMode: localStorage.getItem('erp_darkMode') === 'true',
  isOnline: true,
  syncStatus: 'idle',     // idle | saving | saved | error

  setCurrentUser:  (u)  => set({ currentUser: u }),
  setIsDarkMode:   (v)  => { localStorage.setItem('erp_darkMode', v); set({ isDarkMode: v }) },
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
  isServiceEnabled:  false,

  // ── Snapshot guard: prevents stale snapshots from restoring deleted tables ──
  // { [tableId]: timestamp } — persisted in localStorage, 24h TTL
  _pendingTableDeletes: loadPendingDeletes(),

  setCafeData: (data) => {
    const now     = Date.now()
    const pending = get()._pendingTableDeletes || {}
    const activePending = Object.fromEntries(
      Object.entries(pending).filter(([, ts]) => now - ts < PENDING_DELETES_TTL)
    )
    savePendingDeletes(activePending)
    const rawATO = data.activeTableOrders || {}
    const safeATO = Object.fromEntries(
      Object.entries(rawATO).filter(([id]) => !activePending[id])
    )
    set({
      products:             data.products?.length    ? data.products          : DEFAULT_PRODUCTS,
      rawMaterials:         data.rawMaterials?.length ? data.rawMaterials     : DEFAULT_RAW_MATERIALS,
      employees:            data.employees           || [],
      expenses:             data.expenses            || [],
      tables:               data.tables              || [],
      shifts:               data.shifts              || [],
      orders:               data.orders              || [],
      activeTableOrders:    safeATO,
      offers:               data.offers              || [],
      psDevices:            data.psDevices           || [],
      psSessions:           data.psSessions          || [],
      isTaxEnabled:         data.isTaxEnabled        ?? false,
      isServiceEnabled:     data.isServiceEnabled    ?? false,
      _pendingTableDeletes: activePending,
    })
  },

  resetCafeData: () => set({
    products: DEFAULT_PRODUCTS, rawMaterials: DEFAULT_RAW_MATERIALS, employees: [],
    expenses: [], tables: [], shifts: [], orders: [],
    activeTableOrders: {}, offers: [], psDevices: [], psSessions: [],
    isTaxEnabled: false, isServiceEnabled: false, _pendingTableDeletes: {}
  }),

  // ── Sync ─────────────────────────────────────────────────
  _syncTimer:  null,
  _syncBuffer: {},

  sync: (partial, { immediate = false } = {}) => {
    const { currentUser } = get()
    if (!currentUser?.cafeId) return
    const cafeId = currentUser.cafeId

    // ── immediate path: no timer — save fires NOW as a Promise ──
    // (setTimeout(0) would allow stale Firestore snapshots to fire first
    //  and restore deleted tables before the write reaches Firestore)
    if (immediate) {
      if (get()._syncTimer) clearTimeout(get()._syncTimer)
      const buffer = { ...get()._syncBuffer, ...partial }
      set({ _syncBuffer: {}, _syncTimer: null, syncStatus: 'saving' })

      const s = get()
      saveLocal(cafeId, {
        products: s.products, rawMaterials: s.rawMaterials, employees: s.employees,
        expenses: s.expenses, tables: s.tables, shifts: s.shifts, orders: s.orders,
        activeTableOrders: s.activeTableOrders, offers: s.offers, psDevices: s.psDevices,
        psSessions: s.psSessions, isTaxEnabled: s.isTaxEnabled, isServiceEnabled: s.isServiceEnabled
      })

      saveCafe(cafeId, buffer)
        .then(() => {
          set({ syncStatus: 'saved' })
          setTimeout(() => set(s => s.syncStatus === 'saved' ? { syncStatus: 'idle' } : {}), 2000)
        })
        .catch(() => {
          setTimeout(() => {
            // merge any new changes that arrived during the 1s retry window
            const retryBuffer = { ...buffer, ...get()._syncBuffer }
            set({ _syncBuffer: {} })
            saveCafe(cafeId, retryBuffer)
              .then(() => {
                set({ syncStatus: 'saved' })
                setTimeout(() => set(s => s.syncStatus === 'saved' ? { syncStatus: 'idle' } : {}), 2000)
              })
              .catch(e => {
                console.error('Sync failed:', e.code, e.message)
                set(s => ({ syncStatus: 'error', _syncBuffer: { ...retryBuffer, ...s._syncBuffer } }))
              })
          }, 1000)
        })
      return
    }

    // ── debounced path: 300ms for non-critical updates ───────
    set(s => ({ _syncBuffer: { ...s._syncBuffer, ...partial }, syncStatus: 'saving' }))
    if (get()._syncTimer) clearTimeout(get()._syncTimer)

    // Save to localStorage IMMEDIATELY — not inside the timer.
    // If the browser closes before the 300ms fires, Firestore IndexedDB won't
    // have the write yet, but localStorage will, so data survives a page reload.
    const snap = get()
    saveLocal(cafeId, {
      products: snap.products, rawMaterials: snap.rawMaterials, employees: snap.employees,
      expenses: snap.expenses, tables: snap.tables, shifts: snap.shifts, orders: snap.orders,
      activeTableOrders: snap.activeTableOrders, offers: snap.offers, psDevices: snap.psDevices,
      psSessions: snap.psSessions, isTaxEnabled: snap.isTaxEnabled, isServiceEnabled: snap.isServiceEnabled
    })

    const timer = setTimeout(async () => {
      const buffer = get()._syncBuffer
      if (!Object.keys(buffer).length) return
      set({ _syncBuffer: {}, _syncTimer: null })

      const doSave = async () => { await saveCafe(cafeId, buffer) }
      try {
        await doSave()
        set({ syncStatus: 'saved' })
        setTimeout(() => set(s => s.syncStatus === 'saved' ? { syncStatus: 'idle' } : {}), 2000)
      } catch (e1) {
        setTimeout(async () => {
          try {
            await doSave()
            set({ syncStatus: 'saved' })
            setTimeout(() => set(s => s.syncStatus === 'saved' ? { syncStatus: 'idle' } : {}), 2000)
          } catch (e2) {
            console.error('Sync failed:', e2.code, e2.message)
            set(s => ({ syncStatus: 'error', _syncBuffer: { ...buffer, ...s._syncBuffer } }))
          }
        }, 1000)
      }
    }, 300)

    set({ _syncTimer: timer })
  },

  // ── Products ─────────────────────────────────────────────
  upsertProduct: (product) => {
    const list = get().products
    const next = product.id
      ? list.map(p => p.id === product.id ? { ...p, ...product } : p)
      : [...list, { ...product, id: crypto.randomUUID() }]
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
      : [...list, { ...mat, id: crypto.randomUUID() }]
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
      : [...list, { ...emp, id: crypto.randomUUID(), advances: 0, deductions: 0 }]
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
    const next = [...get().expenses, { ...exp, id: crypto.randomUUID(), date: new Date().toISOString().split('T')[0] }]
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
      : [...list, { ...table, id: crypto.randomUUID() }]
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
      : [...list, { ...offer, id: crypto.randomUUID(), isActive: true }]
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

  toggleService: () => {
    const next = !get().isServiceEnabled
    set({ isServiceEnabled: next })
    get().sync({ isServiceEnabled: next })
  },

  // ── Shifts ────────────────────────────────────────────────
  openShift: (cashierName, startingCash) => {
    const shift = { id: crypto.randomUUID(), cashierName, startingCash, startTime: new Date().toLocaleString('ar-EG'), timestamp: Date.now(), status: 'open' }
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
    // immediate: true queues the Firestore write before fbSignOut fires (logout is async).
    // Without this, the 300ms debounce timer may fire after the anonymous auth is revoked
    // and the closed shift would never reach Firestore (safe in localStorage, but delayed).
    get().sync({ shifts: next }, { immediate: true })
  },

  // ── Orders / POS ─────────────────────────────────────────
  placeOrder: (cart, options) => {
    const { orders, rawMaterials, products, activeTableOrders, isTaxEnabled, isServiceEnabled } = get()
    const { orderType, tableId, shiftId, cashierName, discountType, discountValue, tableName, note } = options

    // حساب المجاميع بالترتيب الصحيح:
    // subtotal → خصم → خدمة 10% → ضريبة 14%
    const subtotal = cart.reduce((s, i) => s + i.price * i.quantity, 0)
    let discountAmount = 0
    if (discountValue > 0) {
      discountAmount = discountType === 'percent'
        ? Math.min(subtotal, subtotal * discountValue / 100)
        : Math.min(subtotal, discountValue)
    }
    const afterDiscount  = subtotal - discountAmount
    const serviceCharge  = isServiceEnabled ? afterDiscount * 0.10 : 0
    const afterService   = afterDiscount + serviceCharge
    const tax            = isTaxEnabled ? afterService * 0.14 : 0
    const total          = afterService + tax

    // خصم من المخزون + تجميع تحذيرات النفاد
    const newMaterials = rawMaterials.map(rm => ({ ...rm }))
    const lowStockWarnings = []
    cart.forEach(ci => {
      const prod = products.find(p => p.id === ci.id)
      if (!prod?.recipe) return
      prod.recipe.forEach(r => {
        const idx = newMaterials.findIndex(m => m.id === r.materialId)
        if (idx !== -1) {
          newMaterials[idx].currentStock -= r.amount * ci.quantity
          if (newMaterials[idx].currentStock < 0) {
            lowStockWarnings.push(newMaterials[idx].name)
          }
        }
      })
    })

    const order = {
      id: crypto.randomUUID(),
      items: cart, subtotal, discountAmount, discountType, discountValue,
      serviceCharge, tax, total, shiftId, cashierName,
      note: orderType === 'takeaway' ? 'تيك أواي' : `صالة — ${tableName}`,
      orderNote: note || '',
      date: new Date().toLocaleString('ar-EG'),
      timestamp: Date.now()
    }

    const newOrders = [...orders, order]
    // حذف الطاولة من activeTableOrders عند الدفع
    let newATO = { ...activeTableOrders }
    if (tableId) delete newATO[tableId]

    // Mark tableId as locally-deleted so stale Firestore snapshots can't restore it
    const newPending = tableId
      ? { ...get()._pendingTableDeletes, [tableId]: Date.now() }
      : get()._pendingTableDeletes
    if (tableId) savePendingDeletes(newPending)

    set({ orders: newOrders, rawMaterials: newMaterials, activeTableOrders: newATO, _pendingTableDeletes: newPending })
    // immediate: true لضمان حذف الطاولة فوراً دون تأخير 300ms
    get().sync({ orders: newOrders, rawMaterials: newMaterials, activeTableOrders: newATO }, { immediate: true })
    return { ...order, lowStockWarnings }
  },

  holdTable: (tableId, cart) => {
    const next = { ...get().activeTableOrders, [tableId]: cart }
    set({ activeTableOrders: next })
    get().sync({ activeTableOrders: next }, { immediate: true })
  },

  clearAllTableOrders: () => {
    set({ activeTableOrders: {} })
    get().sync({ activeTableOrders: {} }, { immediate: true })
  },

  // ── PlayStation ───────────────────────────────────────────
  upsertPsDevice: (device) => {
    const list = get().psDevices
    const next = device.id
      ? list.map(d => d.id === device.id ? { ...d, ...device } : d)
      : [...list, { ...device, id: crypto.randomUUID() }]
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
    const session = { id: crypto.randomUUID(), deviceId, deviceName: device?.name || '', startTime: Date.now(), startTimeStr: new Date().toLocaleString('ar-EG'), status: 'active', cashierName }
    const next    = [...get().psSessions, session]
    set({ psSessions: next })
    get().sync({ psSessions: next })
  },
  endPsSession: (sessionId) => {
    const { psSessions, psDevices, orders, shifts } = get()
    const session = psSessions.find(s => s.id === sessionId)
    if (!session) return
    const device      = psDevices.find(d => d.id === session.deviceId)
    const activeShift = shifts.find(s => s.status === 'open' && s.cashierName === session.cashierName)
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
        id: crypto.randomUUID(),
        items: [{
          id:       sessionId,
          name:     `${device.name} — ${durationMin} دقيقة (محسوب: ${billedMin} دقيقة)`,
          price:    cost,
          quantity: 1
        }],
        subtotal: cost, discountAmount: 0, serviceCharge: 0, tax: 0, total: cost,
        note:        `بلايستيشن — ${device.name}`,
        shiftId:     activeShift?.id,
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
