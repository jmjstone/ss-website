'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

type CalculatorContextType = {
  tdeeCalories: number | null;
  setTdeeCalories: (value: number) => void;
  weight: number | null;
  setWeight: (value: number) => void;
  weightUnit: 'kg' | 'lbs';
  setWeightUnit: (unit: 'kg' | 'lbs') => void;
};

const CalculatorContext = createContext<CalculatorContextType | undefined>(undefined);

export function CalculatorProvider({ children }: { children: ReactNode }) {
  const [tdeeCalories, setTdeeCalories] = useState<number | null>(null);
  const [weight, setWeight] = useState<number | null>(null);
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');

  return (
    <CalculatorContext.Provider
      value={{ tdeeCalories, setTdeeCalories, weight, setWeight, weightUnit, setWeightUnit }}
    >
      {children}
    </CalculatorContext.Provider>
  );
}

export function useCalculator() {
  const context = useContext(CalculatorContext);
  if (!context) throw new Error('useCalculator must be used within CalculatorProvider');
  return context;
}
