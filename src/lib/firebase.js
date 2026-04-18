const firebaseConfig = {
  apiKey:            "AIzaSyC_h5f_fpqVsrqe_nEexbKPAQnRQNw4ZCU",
  authDomain:        "zerolets-3dcbf.firebaseapp.com",
  projectId:         "zerolets-3dcbf",
  storageBucket:     "zerolets-3dcbf.firebasestorage.app",
  messagingSenderId: "855856820755",
  appId:             "1:855856820755:web:7cc84ae5fe485f78c285e6",
  measurementId:     "G-0594R4YVX4"
}

import { initializeApp }  from 'firebase/app'
import { getAuth }        from 'firebase/auth'
import {
  initializeFirestore,
  persistentLocalCache,
  persistentSingleTabManager
} from 'firebase/firestore'

const app         = initializeApp(firebaseConfig)
export const auth = getAuth(app)

// persistentSingleTabManager — أكثر استقراراً من MultipleTab في بيئة الإنتاج
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentSingleTabManager({ forceOwnership: true })
  })
})

export default app
