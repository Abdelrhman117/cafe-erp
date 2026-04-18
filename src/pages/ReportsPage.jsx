import { useState } from 'react'
import { FileText, Download, Calendar } from 'lucide-react'
import { useStore, selectFinancials } from '../store'
import { exportSalesReport } from '../lib/pdf'
import { PeriodTabs, DataTable, Badge } from '../components/UI'

const PERIOD_LABELS = { daily:'يومي', weekly:'أسبوعي', monthly:'شهري', quarterly:'ربع سنوي', semi:'نصف سنوي', yearly:'سنوي', all:'كامل' }

export default function ReportsPage() {
  const [period, setPeriod] = useState('daily')
  const { currentUser } = useStore()
  const metrics = useStore(selectFinancials(period))

  const handleExport = () => {
    exportSalesReport({
      orders:   metrics.orders,
      metrics: { revenue: metrics.revenue, expenses: metrics.expenses, profit: metrics.profit, ordersCount: metrics.ordersCount },
      period,
      cafeName: currentUser?.cafeName || ''
    })
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex items-center gap-3">
        <FileText className="text-indigo-600 w-8 h-8" />
        <h2 className="text-2xl md:text-3xl font-black text-slate-800 dark:text-slate-100">التقارير والتصدير</h2>
      </div>

      {/* Period + summary */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-indigo-500" />
          <h3 className="font-black text-lg text-slate-800 dark:text-white">اختر الفترة</h3>
        </div>
        <PeriodTabs value={period} onChange={setPeriod} />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl text-center">
            <p className="text-2xl font-black text-emerald-600">{metrics.revenue.toFixed(2)} ج</p>
            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-1">المبيعات</p>
          </div>
          <div className="bg-rose-50 dark:bg-rose-900/20 p-4 rounded-2xl text-center">
            <p className="text-2xl font-black text-rose-600">{metrics.expenses.toFixed(2)} ج</p>
            <p className="text-xs font-bold text-rose-700 dark:text-rose-400 mt-1">المصروفات</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-2xl text-center">
            <p className="text-2xl font-black text-slate-700 dark:text-white">{metrics.ordersCount}</p>
            <p className="text-xs font-bold text-slate-500 mt-1">الطلبات</p>
          </div>
          <div className={`p-4 rounded-2xl text-center ${metrics.profit >= 0 ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'bg-rose-50 dark:bg-rose-900/20'}`}>
            <p className={`text-2xl font-black ${metrics.profit >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>{metrics.profit.toFixed(2)} ج</p>
            <p className="text-xs font-bold text-indigo-700 dark:text-indigo-400 mt-1">صافي الربح</p>
          </div>
        </div>

        <button onClick={handleExport} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2 shadow-lg text-base transition-colors">
          <Download size={20} /> تصدير PDF — {PERIOD_LABELS[period]}
        </button>
      </div>

      {/* Transactions table */}
      <DataTable
        headers={[
          { label: 'التاريخ' }, { label: 'الكاشير' }, { label: 'النوع' },
          { label: 'الأصناف' }, { label: 'الخصم', center: true }, { label: 'الإجمالي', center: true }
        ]}
        empty={metrics.orders.length === 0 ? 'لا توجد معاملات في هذه الفترة' : null}
      >
        {[...metrics.orders].reverse().slice(0, 100).map(o => (
          <tr key={o.id} className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 text-sm">
            <td className="p-4 text-slate-500 dark:text-slate-400 text-xs whitespace-nowrap">{o.date}</td>
            <td className="p-4 font-bold text-slate-700 dark:text-slate-300 text-xs">{o.cashierName || '—'}</td>
            <td className="p-4"><Badge color="indigo">{o.note || 'تيك أواي'}</Badge></td>
            <td className="p-4 text-xs text-slate-600 dark:text-slate-400 max-w-[200px] truncate">{(o.items || []).map(i => i.name).join('، ')}</td>
            <td className="p-4 text-center text-xs font-bold text-emerald-600">{o.discountAmount > 0 ? `-${o.discountAmount.toFixed(2)} ج` : '—'}</td>
            <td className="p-4 text-center font-black text-indigo-600 dark:text-indigo-400">{o.total.toFixed(2)} ج</td>
          </tr>
        ))}
      </DataTable>
    </div>
  )
}
