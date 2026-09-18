import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import {
  ref,
  set,
  get,
  onValue,
  push,
  remove,
  update
} from 'firebase/database';
import { db, rtdb } from './config';

// ==========================================
// CLOUD FIRESTORE HELPERS
// ==========================================

/**
 * Add a new document to a Firestore collection
 * @param {string} collectionName 
 * @param {object} data 
 * @returns {Promise<string>} Created document ID
 */
export const addDocument = async (collectionName, data) => {
  try {
    const colRef = collection(db, collectionName);
    const docRef = await addDoc(colRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error(`Error adding document to ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Fetch all documents from a Firestore collection
 * @param {string} collectionName 
 * @returns {Promise<Array>} Array of document objects with 'id'
 */
export const getDocuments = async (collectionName) => {
  try {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
  } catch (error) {
    console.error(`Error getting documents from ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Update an existing document in Firestore
 * @param {string} collectionName 
 * @param {string} docId 
 * @param {object} data 
 */
export const updateDocument = async (collectionName, docId, data) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error(`Error updating document ${docId} in ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Delete a document from Firestore
 * @param {string} collectionName 
 * @param {string} docId 
 */
export const deleteDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting document ${docId} from ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Subscribe to real-time changes in a Firestore collection
 * @param {string} collectionName 
 * @param {function} callback Function called with updated documents array
 * @returns {function} Unsubscribe function
 */
export const subscribeToCollection = (collectionName, callback) => {
  const colRef = collection(db, collectionName);
  return onSnapshot(colRef, (snapshot) => {
    const documents = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
    }));
    callback(documents);
  }, (error) => {
    console.error(`Snapshot error in ${collectionName}:`, error);
  });
};

// ==========================================
// REALTIME DATABASE HELPERS
// ==========================================

/**
 * Write/overwrite data at a specific path in Realtime Database
 * @param {string} path 
 * @param {any} data 
 */
export const setRtdbData = async (path, data) => {
  try {
    const dbRef = ref(rtdb, path);
    await set(dbRef, data);
  } catch (error) {
    console.error(`Error setting Realtime DB data at ${path}:`, error);
    throw error;
  }
};

/**
 * Push a new item into a list path in Realtime Database
 * @param {string} path 
 * @param {any} data 
 * @returns {Promise<string>} Key of pushed item
 */
export const pushRtdbData = async (path, data) => {
  try {
    const listRef = ref(rtdb, path);
    const newRef = push(listRef);
    await set(newRef, data);
    return newRef.key;
  } catch (error) {
    console.error(`Error pushing Realtime DB data to ${path}:`, error);
    throw error;
  }
};

/**
 * Read data snapshot once from Realtime Database
 * @param {string} path 
 * @returns {Promise<any>} Data value at path
 */
export const getRtdbData = async (path) => {
  try {
    const dbRef = ref(rtdb, path);
    const snapshot = await get(dbRef);
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error(`Error reading Realtime DB data at ${path}:`, error);
    throw error;
  }
};

/**
 * Subscribe to real-time updates at a path in Realtime Database
 * @param {string} path 
 * @param {function} callback Called with updated value
 * @returns {function} Unsubscribe function
 */
export const subscribeToRtdb = (path, callback) => {
  const dbRef = ref(rtdb, path);
  return onValue(dbRef, (snapshot) => {
    callback(snapshot.exists() ? snapshot.val() : null);
  }, (error) => {
    console.error(`Realtime DB subscription error at ${path}:`, error);
  });
};
