# ☕ كوفي ERP

نظام إدارة متكامل للكافيهات — Multi-tenant SaaS مبني على React + Vite + Firebase.

---

## 🚀 إعداد المشروع

### 1. تثبيت الحزم
```bash
npm install
```

### 2. إعداد Firebase

#### أ) أنشئ مشروع Firebase
- اذهب إلى [Firebase Console](https://console.firebase.google.com)
- أنشئ مشروعاً جديداً
- فعّل **Authentication** → Sign-in methods → **Email/Password**
- فعّل **Firestore Database** (ابدأ في Production mode)

#### ب) الصق بياناتك في `src/lib/firebase.js`
```js
const firebaseConfig = {
  apiKey:            "...",
  authDomain:        "...",
  projectId:         "...",
  storageBucket:     "...",
  messagingSenderId: "...",
  appId:             "..."
}
```

#### ج) Firestore Rules
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /erp_platform/{doc} {
      allow read, write: if request.auth != null;
    }
    match /erp_cafes/{cafeId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 3. إنشاء المستخدمين في Firebase Auth

اذهب إلى **Authentication → Users → Add user** وأنشئ:

| الإيميل | الدور |
|---------|-------|
| `owner@coffeeerp.app` | مالك المنصة (Super Admin) |
| `admin@cafe1.com` | مدير كافيه |
| `cashier@cafe1.com` | كاشير كافيه |

> ⚠️ تأكد أن الإيميلات تطابق تماماً ما هو مسجل في Firestore تحت `tenants`.

### 4. تشغيل المشروع
```bash
npm run dev
```

---

## 🏗️ هيكل المشروع

```
src/
├── lib/
│   ├── firebase.js      # Firebase config + init
│   ├── firestore.js     # Firestore helpers
│   └── pdf.js           # PDF/print export
├── store/
│   └── index.js         # Zustand global store + selectors
├── hooks/
│   ├── useAuth.js       # Firebase email login
│   └── useFirestore.js  # Real-time subscriptions
├── components/
│   ├── UI.jsx           # Shared components (Modal, Btn, Input...)
│   ├── Sidebar.jsx      # Navigation sidebar
│   └── StatusBar.jsx    # Top status bar
└── pages/
    ├── LoginPage.jsx
    ├── CustomerMenuPage.jsx
    ├── DashboardPage.jsx
    ├── POSPage.jsx
    ├── ReportsPage.jsx
    ├── ShiftsPage.jsx
    ├── InventoryPage.jsx
    ├── ProductsPage.jsx
    ├── OffersPage.jsx
    ├── TablesPage.jsx
    ├── PlayStationPage.jsx
    ├── HRPage.jsx
    ├── ExpensesPage.jsx
    └── SuperAdminPage.jsx
```

---

## 🎯 الميزات

| الميزة | الوصف |
|--------|-------|
| **Multi-tenant** | كل كافيه له بيانات منفصلة في Firestore |
| **تسجيل دخول بالإيميل** | Firebase Email Auth — بدون كود الكافيه |
| **3 أدوار** | Super Admin / مدير / كاشير |
| **POS** | سلة + خصومات + ضريبة + طاولات + hold |
| **فاتورة طباعة** | إيصال 80mm قابل للطباعة |
| **مخزون** | مواد خام + وصفات + خصم تلقائي |
| **العروض** | خصم % أو ثابت على منتج/فئة بتواريخ |
| **بلايستيشن** | جلسات بالساعة + فاتورة تلقائية |
| **ورديات** | عهدة + تقفيل + عجز/زيادة |
| **تقارير PDF** | مبيعات + موظفين بفترات مختلفة |
| **Dark mode** | كامل |
| **Offline support** | IndexedDB persistence |

---

## 📦 Build للإنتاج

```bash
npm run build
```

ارفع مجلد `dist/` على أي hosting (Vercel, Netlify, Firebase Hosting).
