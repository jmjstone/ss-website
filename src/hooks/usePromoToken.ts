import { useEffect, useState } from 'react';

const LOCAL_STORAGE_KEY = 'promoToken';

export function usePromoToken(initialToken?: string) {
  const [promoToken, setPromoTokenState] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (stored) setPromoTokenState(stored);
    else if (initialToken) {
      localStorage.setItem(LOCAL_STORAGE_KEY, initialToken);
      setPromoTokenState(initialToken);
    }
  }, [initialToken]);

  const setPromoToken = (token: string) => {
    localStorage.setItem(LOCAL_STORAGE_KEY, token);
    setPromoTokenState(token);
  };

  const clearPromoToken = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    setPromoTokenState(null);
  };

  return { promoToken, setPromoToken, clearPromoToken };
}
