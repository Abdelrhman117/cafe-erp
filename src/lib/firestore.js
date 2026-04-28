import { db } from './firebase'
import { doc, setDoc, onSnapshot } from 'firebase/firestore'

// ─── Platform ────────────────────────────────────────────
export const PLATFORM_DOC  = () => doc(db, 'erp_platform', 'config')
export const subscribePlatform = (cb, errCb) => onSnapshot(PLATFORM_DOC(), cb, errCb)
export const savePlatform      = (data) =>
  setDoc(PLATFORM_DOC(), { ...data, updatedAt: Date.now() }, { merge: true })

// ─── Cafe data ────────────────────────────────────────────
export const CAFE_DOC      = (cafeId) => doc(db, 'erp_cafes', cafeId)
export const subscribeCafe = (cafeId, cb, errCb) => onSnapshot(CAFE_DOC(cafeId), cb, errCb)
export const saveCafe      = (cafeId, data) =>
  setDoc(CAFE_DOC(cafeId), { ...data, updatedAt: Date.now() }, { merge: true })

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
    // Read: any signed-in user (admins need tenant list to login)
    // Write: only non-anonymous users (admins manage their own cashiers)
    match /erp_platform/{doc} {
      allow read:  if isSignedIn();
      allow write: if isNonAnonymous();
    }

    // ── Cafe data ─────────────────────────────────────────
    // Read: any signed-in user
    // Write: only the admin whose email matches the tenant's adminEmail,
    //        OR non-anonymous users that are already authenticated
    //
    // NOTE: To fully enforce per-cafe isolation (prevent cafe A admin
    //       writing to cafe B), set a Firebase Custom Claim on login:
    //         { cafeId: "cafe1" }
    //       Then use: request.auth.token.cafeId == cafeId
    //       This requires a Cloud Function or Admin SDK on the server.
    //       Until then, the app-level check in useFirestore provides
    //       the primary isolation.
    match /erp_cafes/{cafeId} {
      allow read:  if isSignedIn();
      allow write: if isNonAnonymous() ||
        (isSignedIn() &&
         get(/databases/$(database)/documents/erp_platform/config)
           .data.tenants
           .hasAny([{id: cafeId, adminEmail: request.auth.token.email}]));
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
