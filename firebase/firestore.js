import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  setDoc,
  limit,
} from 'firebase/firestore';
import { db } from '@/firebase/config'

// ---- DOCUMENTS ----
export const addDocument = async (userId, docData) => {
  const ref = await addDoc(collection(db, 'documents'), {
    ...docData,
    userId,
    uploadDate: serverTimestamp(),
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const getUserDocuments = async (userId, familyMemberId = null) => {
  let q = query(
    collection(db, 'documents'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  if (familyMemberId) {
    q = query(
      collection(db, 'documents'),
      where('userId', '==', userId),
      where('familyMemberId', '==', familyMemberId)
    );
  }
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const getDocumentById = async (docId) => {
  const snap = await getDoc(doc(db, 'documents', docId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
};

export const updateDocument = async (docId, updates) => {
  await updateDoc(doc(db, 'documents', docId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
};

export const deleteDocument = async (docId) => {
  await deleteDoc(doc(db, 'documents', docId));
};

// ---- FAMILY MEMBERS ----
export const addFamilyMember = async (userId, memberData) => {
  const ref = await addDoc(collection(db, 'familyMembers'), {
    ...memberData,
    userId,
    createdAt: serverTimestamp(),
  });
  return ref.id;
};

export const getFamilyMembers = async (userId) => {
  const q = query(
    collection(db, 'familyMembers'),
    where('userId', '==', userId)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const deleteFamilyMember = async (memberId) => {
  await deleteDoc(doc(db, 'familyMembers', memberId));
};

// ---- SHARE LINKS ----
export const createShareLink = async (shareData) => {
  const ref = await addDoc(collection(db, 'shareLinks'), {
    ...shareData,
    createdAt: serverTimestamp(),
    viewCount: 0,
  });
  return ref.id;
};

export const getShareLink = async (linkId) => {
  const snap = await getDoc(doc(db, 'shareLinks', linkId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
};

export const incrementShareViewCount = async (linkId) => {
  const ref = doc(db, 'shareLinks', linkId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await updateDoc(ref, { viewCount: (snap.data().viewCount || 0) + 1 });
  }
};

export const getUserShareLinks = async (userId) => {
  const q = query(
    collection(db, 'shareLinks'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// ---- USER PROFILE ----
export const getUserProfile = async (userId) => {
  const snap = await getDoc(doc(db, 'users', userId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
};

export const setUserProfile = async (userId, data) => {
  await setDoc(doc(db, 'users', userId), {
    ...data,
    updatedAt: serverTimestamp(),
  }, { merge: true });
};
