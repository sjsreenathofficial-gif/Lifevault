'use client';
import { useState, useEffect, useCallback } from 'react';
import { getUserDocuments } from '../firebase/firestore';

export const useDocuments = (userId, familyMemberId = null) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDocuments = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const docs = await getUserDocuments(userId, familyMemberId);
      setDocuments(docs);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [userId, familyMemberId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const stats = {
    total: documents.length,
    byCategory: documents.reduce((acc, doc) => {
      acc[doc.category] = (acc[doc.category] || 0) + 1;
      return acc;
    }, {}),
    totalSize: documents.reduce((acc, doc) => acc + (doc.fileSize || 0), 0),
    recentUploads: [...documents]
      .sort((a, b) => {
        const aDate = a.createdAt?.toDate?.() || new Date(a.createdAt || 0);
        const bDate = b.createdAt?.toDate?.() || new Date(b.createdAt || 0);
        return bDate - aDate;
      })
      .slice(0, 5),
  };

  return { documents, loading, error, refetch: fetchDocuments, stats };
};
