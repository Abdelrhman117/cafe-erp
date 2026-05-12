import { Wifi, WifiOff, RefreshCw, AlertCircle, Bell, AlertTriangle, RotateCcw } from 'lucide-react'
import { useStore, selectLowStock, selectExpiringProducts } from '../store'

export default function StatusBar({ onNavigate }) {
  const { isOnline, syncStatus, syncStatus: status, currentUser, _syncBuffer } = useStore()
  const lowStock = useStore(selectLowStock(50))
  const { expired, nearExpiry } = useStore(selectExpiringProducts)

  const hasPending = currentUser?.cafeId && Object.keys(_syncBuffer || {}).length > 0

  const barColor =
    !isOnline              ? 'bg-rose-600'   :
    status === 'error'     ? 'bg-rose-600'   :
    status === 'saving'    ? 'bg-amber-500'  :
    status === 'saved'     ? 'bg-emerald-500':
    hasPending             ? 'bg-amber-600'  :
    'bg-emerald-600'

  const statusText =
    !isOnline          ? '📵 أوفلاين — البيانات محفوظة محلياً، ستُرفع عند الاتصال' :
    status === 'error' ? '❌ فشل الحفظ — اضغط للمحاولة مجدداً' :
    status === 'saving'? 'جاري الحفظ...' :
    status === 'saved' ? '✅ تم الحفظ' :
    hasPending         ? '⏳ جاري الحفظ...' :
    '🔗 متصل'

  const handleRetry = () => {
    if (status !== 'error') return
    const { _syncBuffer: buf, sync } = useStore.getState()
    if (Object.keys(buf || {}).length > 0) sync(buf)
    else useStore.getState().setSyncStatus('idle')
  }

  return (
    <div className={`fixed top-0 left-0 right-0 z-[60] text-[10px] md:text-xs font-bold py-1.5 px-3 flex justify-between items-center text-white transition-colors duration-300 ${barColor}`}>
      {/* Status */}
      <div className="flex items-center gap-1.5">
        {!isOnline
          ? <WifiOff size={12} />
          : status === 'saving' || hasPending
          ? <RefreshCw size={12} className="animate-spin" />
          : status === 'error'
          ? <AlertCircle size={12} />
          : <Wifi size={12} />
        }
        <button
          onClick={handleRetry}
          className={status === 'error' ? 'underline cursor-pointer' : 'cursor-default'}
        >
          <span className="truncate max-w-[220px]">{statusText}</span>
        </button>
      </div>

      {/* Alerts */}
      {currentUser && currentUser.role !== 'customer' && (
        <div className="flex items-center gap-2">
          {lowStock.length > 0 && (
            <button onClick={() => onNavigate?.('inventory')}
              className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full hover:bg-white/30 transition-colors">
              <Bell size={10} /> {lowStock.length} منخفض
            </button>
          )}
          {(expired.length + nearExpiry.length) > 0 && (
            <button onClick={() => onNavigate?.('products')}
              className="flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded-full hover:bg-white/30 transition-colors">
              <AlertTriangle size={10} /> {expired.length + nearExpiry.length} صلاحيات
            </button>
          )}
        </div>
      )}

      {/* Ping dot */}
      <span className="relative flex h-2 w-2 shrink-0">
        {isOnline && syncStatus !== 'error' && !hasPending && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${!isOnline || syncStatus === 'error' ? 'bg-rose-300' : 'bg-white'}`} />
      </span>
    </div>
  )
}
