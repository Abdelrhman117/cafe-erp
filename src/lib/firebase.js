// ==========================================
// 🔧 ضع هنا بيانات Firebase الخاصة بك
// ==========================================
// 1. اذهب إلى https://console.firebase.google.com
// 2. أنشئ مشروع جديد أو استخدم مشروع موجود
// 3. Project Settings → Your apps → Web app
// 4. انسخ firebaseConfig والصقها هنا

const firebaseConfig = {
  apiKey:            "AIzaSyC_h5f_fpqVsrqe_nEexbKPAQnRQNw4ZCU",
  authDomain:        "zerolets-3dcbf.firebaseapp.com",
  projectId:         "zerolets-3dcbf",
  storageBucket:     "zerolets-3dcbf.firebasestorage.app",
  messagingSenderId: "855856820755",
  appId:             "1:855856820755:web:7cc84ae5fe485f78c285e6",
  measurementId:     "G-0594R4YVX4"
}

// ==========================================
// Firebase Services — لا تعدّل هنا
// ==========================================
import { initializeApp }     from 'firebase/app'
import { getAuth }           from 'firebase/auth'
import { getFirestore, initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore'

const app  = initializeApp(firebaseConfig)
export const auth = getAuth(app)

// Offline persistence (Firebase v9.19+)
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
})

export default app
