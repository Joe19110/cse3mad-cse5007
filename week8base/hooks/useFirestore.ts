import { useEffect, useState } from 'react';
import { FirestoreDocument, getDocuments, queryDocuments, subscribeToCollection } from '@/services/firestoreService';
import { QueryConstraint } from 'firebase/firestore';

/**
 * Hook to fetch documents from Firestore
 */
export function useFirestoreDocuments(
  collectionName: string,
  constraints?: QueryConstraint[]
) {
  const [documents, setDocuments] = useState<FirestoreDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = subscribeToCollection(
      collectionName,
      (docs) => {
        setDocuments(docs);
        setLoading(false);
      },
      (err) => {
        setError(err.message || 'Failed to fetch documents');
        setLoading(false);
      },
      constraints
    );

    return () => unsubscribe();
  }, [collectionName, constraints]);

  return { documents, loading, error };
}

/**
 * Hook to query documents from Firestore
 */
export function useFirestoreQuery(
  collectionName: string,
  field: string,
  operator: any,
  value: any
) {
  const [documents, setDocuments] = useState<FirestoreDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        setError(null);
        const docs = await queryDocuments(collectionName, field, operator, value);
        setDocuments(docs);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch documents');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [collectionName, field, operator, value]);

  return { documents, loading, error };
}
