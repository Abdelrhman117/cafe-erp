import { useState } from 'react'
import { TrendingUp, Wallet, Bell, AlertCircle, AlertTriangle } from 'lucide-react'
import { useStore, selectFinancials, selectLowStock, selectExpiringProducts } from '../store'
import { StatCard, PeriodTabs, AlertBanner } from '../components/UI'

export default function DashboardPage({ onNavigate }) {
  const [period, setPeriod] = useState('daily')
  const metrics  = useStore(selectFinancials(period))
  const lowStock = useStore(selectLowStock(50))
  const { expired, nearExpiry } = useStore(selectExpiringProducts)

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-white">الملخص العام</h2>
        <PeriodTabs value={period} onChange={setPeriod} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard label="المبيعات"      value={`${metrics.revenue.toFixed(2)} ج`}  color="emerald" />
        <StatCard label="المصروفات"     value={`${metrics.expenses.toFixed(2)} ج`}  color="rose"    />
        <StatCard label="تكلفة الخامات" value={`${metrics.cogs.toFixed(2)} ج`}      color="amber"   />
        <div className="bg-indigo-600 p-6 rounded-3xl shadow-lg text-white relative overflow-hidden">
          <div className="absolute -left-4 -top-4 text-indigo-500/50"><Wallet size={80} /></div>
          <div className="relative z-10">
            <p className="text-indigo-200 text-sm font-bold mb-2">الربح الصافي</p>
            <p className={`text-3xl font-black ${metrics.profit < 0 ? 'text-rose-300' : ''}`}>
              {metrics.profit.toFixed(2)} ج
            </p>
          </div>
        </div>
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm text-center">
          <p className="text-3xl font-black text-slate-800 dark:text-white">{metrics.ordersCount}</p>
          <p className="text-slate-500 text-sm font-bold mt-1">عدد الطلبات</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm text-center">
          <p className="text-3xl font-black text-slate-800 dark:text-white">
            {metrics.ordersCount > 0 ? (metrics.revenue / metrics.ordersCount).toFixed(0) : 0} ج
          </p>
          <p className="text-slate-500 text-sm font-bold mt-1">متوسط الطلب</p>
        </div>
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm text-center">
          <p className={`text-3xl font-black ${metrics.revenue > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
            {metrics.revenue > 0 ? ((metrics.profit / metrics.revenue) * 100).toFixed(1) : 0}%
          </p>
          <p className="text-slate-500 text-sm font-bold mt-1">هامش الربح</p>
        </div>
      </div>

      {/* Alerts */}
      {(lowStock.length > 0 || expired.length > 0 || nearExpiry.length > 0) && (
        <div className="space-y-3">
          {lowStock.length > 0 && (
            <button onClick={() => onNavigate('inventory')} className="w-full text-right">
              <AlertBanner
                icon={<Bell className="w-5 h-5 text-rose-500" />}
                title={`⚠️ مواد خام منخفضة المخزون (${lowStock.length})`}
                items={lowStock.map(m => `${m.name} (${m.currentStock} ${m.unit})`)}
                color="rose"
              />
            </button>
          )}
          {expired.length > 0 && (
            <button onClick={() => onNavigate('products')} className="w-full text-right">
              <AlertBanner
                icon={<AlertCircle className="w-5 h-5 text-red-500" />}
                title={`🚫 منتجات منتهية الصلاحية (${expired.length})`}
                items={expired.map(p => p.name)}
                color="red"
              />
            </button>
          )}
          {nearExpiry.length > 0 && (
            <button onClick={() => onNavigate('products')} className="w-full text-right">
              <AlertBanner
                icon={<AlertTriangle className="w-5 h-5 text-amber-500" />}
                title={`⏰ تنتهي صلاحيتها خلال 7 أيام (${nearExpiry.length})`}
                items={nearExpiry.map(p => `${p.name} (${p.expiryDate})`)}
                color="amber"
              />
            </button>
          )}
        </div>
      )}
    </div>
  )
}
