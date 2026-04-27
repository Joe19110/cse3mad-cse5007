import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Query,
  QueryConstraint,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '@/config/firebaseConfig';

export interface FirestoreDocument {
  id: string;
  [key: string]: any;
}

/**
 * Add a new document to a Firestore collection
 */
export async function addDocument(collectionName: string, data: any): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: new Date(),
    });
    return docRef.id;
  } catch (error) {
    console.error(`Error adding document to ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Get all documents from a Firestore collection
 */
export async function getDocuments(
  collectionName: string,
  constraints?: QueryConstraint[]
): Promise<FirestoreDocument[]> {
  try {
    let collectionRef: Query;

    if (constraints && constraints.length > 0) {
      collectionRef = query(collection(db, collectionName), ...constraints);
    } else {
      collectionRef = collection(db, collectionName);
    }

    const querySnapshot = await getDocs(collectionRef);
    const documents: FirestoreDocument[] = [];

    querySnapshot.forEach((doc) => {
      documents.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return documents;
  } catch (error) {
    console.error(`Error fetching documents from ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Get a single document from Firestore
 */
export async function getDocument(
  collectionName: string,
  documentId: string
): Promise<FirestoreDocument | null> {
  try {
    const docRef = doc(db, collectionName, documentId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error(
      `Error fetching document from ${collectionName}/${documentId}:`,
      error
    );
    throw error;
  }
}

/**
 * Update a document in Firestore
 */
export async function updateDocument(
  collectionName: string,
  documentId: string,
  data: any
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, documentId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error(
      `Error updating document in ${collectionName}/${documentId}:`,
      error
    );
    throw error;
  }
}

/**
 * Delete a document from Firestore
 */
export async function deleteDocument(
  collectionName: string,
  documentId: string
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, documentId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(
      `Error deleting document from ${collectionName}/${documentId}:`,
      error
    );
    throw error;
  }
}

/**
 * Query documents with specific conditions
 */
export async function queryDocuments(
  collectionName: string,
  field: string,
  operator: any,
  value: any
): Promise<FirestoreDocument[]> {
  try {
    const q = query(
      collection(db, collectionName),
      where(field, operator, value)
    );
    const querySnapshot = await getDocs(q);
    const documents: FirestoreDocument[] = [];

    querySnapshot.forEach((doc) => {
      documents.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return documents;
  } catch (error) {
    console.error(`Error querying ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Subscribe to real-time updates for a Firestore collection
 */
export function subscribeToCollection(
  collectionName: string,
  onUpdate: (documents: FirestoreDocument[]) => void,
  onError: (error: Error) => void,
  constraints?: QueryConstraint[]
) {
  let collectionRef: Query;

  if (constraints && constraints.length > 0) {
    collectionRef = query(collection(db, collectionName), ...constraints);
  } else {
    collectionRef = collection(db, collectionName);
  }

  return onSnapshot(
    collectionRef,
    (snapshot) => {
      const documents: FirestoreDocument[] = [];
      snapshot.forEach((doc) => {
        documents.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      onUpdate(documents);
    },
    (error) => {
      console.error(`Error subscribing to ${collectionName}:`, error);
      onError(error);
    }
  );
}
