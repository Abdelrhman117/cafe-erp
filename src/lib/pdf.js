// PDF export using browser print (no external dep needed beyond jspdf)
// Simple approach: open a print window with styled HTML

const PERIOD_LABELS = {
  daily: 'يومي', weekly: 'أسبوعي', monthly: 'شهري',
  quarterly: 'ربع سنوي', semi: 'نصف سنوي', yearly: 'سنوي', all: 'كامل'
}

function printWindow(html) {
  const w = window.open('', '_blank', 'width=900,height=700')
  if (!w) { alert('افتح النوافذ المنبثقة للطباعة'); return }
  w.document.write(html)
  w.document.close()
}

const BASE_STYLE = `
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Cairo',Arial,sans-serif;direction:rtl;color:#1e293b;padding:24px;font-size:13px}
    h1{color:#4f46e5;font-size:20px;margin-bottom:4px}
    .meta{color:#64748b;margin-bottom:20px}
    .stats{display:flex;gap:12px;margin-bottom:20px;flex-wrap:wrap}
    .stat{background:#f1f5f9;border-radius:10px;padding:10px 18px;text-align:center;min-width:130px}
    .stat b{display:block;font-size:20px;color:#4f46e5}
    .stat span{font-size:11px;color:#64748b}
    table{width:100%;border-collapse:collapse}
    th{background:#4f46e5;color:#fff;padding:9px 8px;text-align:right;font-size:12px}
    td{padding:8px;border-bottom:1px solid #e2e8f0;font-size:12px}
    tr:nth-child(even) td{background:#f8fafc}
    .green{color:#16a34a} .red{color:#dc2626}
    @media print{body{padding:8px}}
  </style>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@600;700;900&display=swap" rel="stylesheet">
`
const PRINT_SCRIPT = `<script>window.onload=()=>{window.print();setTimeout(()=>window.close(),1500)}<\/script>`

// ─── تقرير المبيعات ───────────────────────────────────────
export function exportSalesReport({ orders, metrics, period, cafeName }) {
  const label = PERIOD_LABELS[period] || period
  const date  = new Date().toLocaleDateString('ar-EG')

  const rows = orders.slice().reverse().map((o, i) => `
    <tr>
      <td>${o.date || ''}</td>
      <td>${o.cashierName || '—'}</td>
      <td>${o.note || 'تيك أواي'}</td>
      <td>${(o.items || []).map(it => `${it.name}×${it.quantity}`).join('، ')}</td>
      <td>${o.discountAmount > 0 ? `-${o.discountAmount.toFixed(2)}` : '—'}</td>
      <td><b>${o.total.toFixed(2)} ج</b></td>
    </tr>`).join('')

  printWindow(`<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8">${BASE_STYLE}</head><body>
    <h1>تقرير المبيعات — ${label}</h1>
    <div class="meta">${cafeName} | ${date}</div>
    <div class="stats">
      <div class="stat"><b class="green">${metrics.revenue.toFixed(2)} ج</b><span>المبيعات</span></div>
      <div class="stat"><b>${metrics.ordersCount}</b><span>الطلبات</span></div>
      <div class="stat"><b class="red">${metrics.expenses.toFixed(2)} ج</b><span>المصروفات</span></div>
      <div class="stat"><b style="color:${metrics.profit>=0?'#4f46e5':'#dc2626'}">${metrics.profit.toFixed(2)} ج</b><span>صافي الربح</span></div>
    </div>
    <table>
      <thead><tr><th>التاريخ</th><th>الكاشير</th><th>النوع</th><th>الأصناف</th><th>الخصم</th><th>الإجمالي</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    ${PRINT_SCRIPT}
  </body></html>`)
}

// ─── تقرير موظف ───────────────────────────────────────────
export function exportEmployeeReport({ employee, orders, shifts, cafeName }) {
  const empOrders = orders.filter(o => o.cashierName === employee.name)
  const empShifts = shifts.filter(s => s.cashierName === employee.name)
  const total     = empOrders.reduce((s, o) => s + o.total, 0)
  const date      = new Date().toLocaleDateString('ar-EG')

  const rows = empOrders.slice().reverse().map(o => `
    <tr>
      <td>${o.date || ''}</td>
      <td>${(o.items || []).map(it => it.name).join('، ')}</td>
      <td>${o.note || 'تيك أواي'}</td>
      <td><b>${o.total.toFixed(2)} ج</b></td>
    </tr>`).join('')

  printWindow(`<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8">${BASE_STYLE}</head><body>
    <h1>تقرير الموظف: ${employee.name}</h1>
    <div class="meta">${cafeName} | ${date}</div>
    <div class="stats">
      <div class="stat"><b class="green">${total.toFixed(2)} ج</b><span>إجمالي مبيعاته</span></div>
      <div class="stat"><b>${empOrders.length}</b><span>الطلبات</span></div>
      <div class="stat"><b>${empShifts.length}</b><span>الورديات</span></div>
      <div class="stat"><b style="color:#059669">${employee.salary} ج</b><span>الراتب</span></div>
    </div>
    <table>
      <thead><tr><th>التاريخ</th><th>الأصناف</th><th>النوع</th><th>الإجمالي</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    ${PRINT_SCRIPT}
  </body></html>`)
}

// ─── إيصال طباعة ─────────────────────────────────────────
export function printReceipt({ order, cafeName, cashierName }) {
  printWindow(`<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8">
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:'Cairo',monospace;width:80mm;padding:12px;font-size:12px;direction:rtl}
      h2{text-align:center;font-size:16px;margin-bottom:2px}
      .center{text-align:center} .sep{border-top:1px dashed #000;margin:8px 0}
      .row{display:flex;justify-content:space-between;margin:3px 0}
      .total{font-size:16px;font-weight:900}
      @media print{body{width:80mm}}
    </style>
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@600;700&display=swap" rel="stylesheet">
  </head><body>
    <h2>${cafeName}</h2>
    <div class="center" style="font-size:10px;color:#666;margin-bottom:4px">رقم: ${String(order.id).slice(-6)}</div>
    <div class="center sep" style="font-size:10px;padding-top:4px">${order.date}</div>
    <div style="margin:8px 0">
      ${(order.items || []).map(i => `<div class="row"><span>${i.quantity}× ${i.name}</span><span>${(i.price * i.quantity).toFixed(2)}</span></div>`).join('')}
    </div>
    <div class="sep"></div>
    <div class="row"><span>المجموع</span><span>${order.subtotal?.toFixed(2)} ج</span></div>
    ${order.discountAmount > 0 ? `<div class="row" style="color:#16a34a"><span>خصم</span><span>-${order.discountAmount.toFixed(2)} ج</span></div>` : ''}
    ${order.tax > 0 ? `<div class="row"><span>ضريبة 14%</span><span>${order.tax.toFixed(2)} ج</span></div>` : ''}
    <div class="sep"></div>
    <div class="row total"><span>الإجمالي</span><span>${order.total.toFixed(2)} ج</span></div>
    <div class="sep" style="margin-top:12px"></div>
    <div class="center" style="font-size:10px;color:#666">الكاشير: ${cashierName}</div>
    <div class="center" style="font-size:10px;color:#666;margin-top:4px">شكراً لزيارتكم 🌟</div>
    ${PRINT_SCRIPT}
  </body></html>`)
}
