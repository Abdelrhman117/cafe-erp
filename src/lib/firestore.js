import { db } from './firebase'
import { doc, setDoc, onSnapshot } from 'firebase/firestore'

// removes undefined fields that Firestore rejects
function stripUndefined(obj) {
  return JSON.parse(JSON.stringify(obj))
}

// ─── Platform ────────────────────────────────────────────
export const PLATFORM_DOC  = () => doc(db, 'erp_platform', 'config')
export const subscribePlatform = (cb, errCb) => onSnapshot(PLATFORM_DOC(), cb, errCb)
export const savePlatform      = (data) =>
  setDoc(PLATFORM_DOC(), { ...stripUndefined(data), updatedAt: Date.now() }, { merge: true })

// ─── Cafe data ────────────────────────────────────────────
export const CAFE_DOC      = (cafeId) => doc(db, 'erp_cafes', cafeId)
export const subscribeCafe = (cafeId, cb, errCb) => onSnapshot(CAFE_DOC(cafeId), cb, errCb)
export const saveCafe      = (cafeId, data) =>
  setDoc(CAFE_DOC(cafeId), { ...stripUndefined(data), updatedAt: Date.now() }, { merge: true })

/*
══════════════════════════════════════════════════════════════
  FIRESTORE SECURITY RULES — الصق هذا في Firebase Console
  Firestore Database → Rules → Edit → Publish
══════════════════════════════════════════════════════════════

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // ── Helper functions ──────────────────────────────────
    function isSignedIn() {
      return request.auth != null;
    }

    function isNonAnonymous() {
      return isSignedIn() &&
        request.auth.token.firebase.sign_in_provider != 'anonymous';
    }

    function isOwner() {
      return isNonAnonymous() &&
        request.auth.token.email == 'owner@coffeeerp.app';
    }

    // ── Platform config ───────────────────────────────────
    // Read: public — login page needs tenant list BEFORE auth
    // Write: only non-anonymous users
    match /erp_platform/{doc} {
      allow read:  if true;
      allow write: if isNonAnonymous();
    }

    // ── Cafe data ─────────────────────────────────────────
    // All signed-in users can read and write their cafe data.
    // Cashiers are anonymous but still signed-in — they need to write
    // orders, update inventory, and manage tables.
    match /erp_cafes/{cafeId} {
      allow read:  if isSignedIn();
      allow write: if isSignedIn();
    }

  }
}

──────────────────────────────────────────────────────────────
  ملاحظة أمنية:
  الـ rules دي تمنع:
  ✅ غير المسجلين من القراءة أو الكتابة
  ✅ الكاشير الـ anonymous من الكتابة على platform config
  ✅ أي شخص مش مسجل من الوصول للداتا

  للحماية الكاملة بين الكافيهات:
  → أضف Firebase Custom Claims بالـ cafeId عند تسجيل دخول الأدمن
  → استبدل شرط الكتابة بـ: request.auth.token.cafeId == cafeId
──────────────────────────────────────────────────────────────
*/
