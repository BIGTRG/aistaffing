// @ts-nocheck
import { useState, useEffect, useCallback } from "react";

export function useApiQuery<T>(fetcher: (() => Promise<T>) | null, deps: any[] = []): T | undefined {
  const [data, setData] = useState<T | undefined>(undefined);
  
  useEffect(() => {
    if (!fetcher) return;
    let cancelled = false;
    fetcher().then(result => {
      if (!cancelled) setData(result);
    }).catch(() => {
      if (!cancelled) setData(undefined);
    });
    return () => { cancelled = true; };
  }, deps);

  return data;
}

export function useApiMutation<T>(mutator: (...args: any[]) => Promise<T>) {
  const [isLoading, setIsLoading] = useState(false);
  
  const mutate = useCallback(async (...args: any[]) => {
    setIsLoading(true);
    try {
      const result = await mutator(...args);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [mutator]);

  return { mutate, isLoading };
}
