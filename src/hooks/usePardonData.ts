import { useState, useEffect } from 'react';
import type { PardonRecord } from '../types';

interface UsePardonDataResult {
  data: PardonRecord[];
  loading: boolean;
  error: string | null;
}

export function usePardonData(): UsePardonDataResult {
  const [data, setData] = useState<PardonRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/pardons')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<PardonRecord[]>;
      })
      .then((records) => {
        setData(records);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { data, loading, error };
}
