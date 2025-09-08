'use client';
import React, { useState, useEffect } from 'react';
import { useCalculator } from '@/context/CalculatorContext';
import CalorieEstimator from '@/components/CalorieEstimator';
import BackButton from '@/components/BackButton';

export default function MacroCalculator() {
  const {
    tdeeCalories,
    weight: contextWeight,
    weightUnit: contextWeightUnit,
    setTdeeCalories,
  } = useCalculator();
  const [mode, setMode] = useState<'tdee' | 'weight'>('tdee');

  const [weight, setWeight] = useState<number | ''>(contextWeight ?? '');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>(contextWeightUnit ?? 'kg');
  const [goal, setGoal] = useState<'maintain' | 'cut' | 'bulk'>('maintain');
  const [calories, setCalories] = useState<number | null>(null);
  const [macros, setMacros] = useState<{ protein: number; fat: number; carbs: number } | null>(
    null,
  );
  const [showEstimator, setShowEstimator] = useState(false);

  // Keep local weight in sync if context changes
  useEffect(() => {
    if (contextWeight) setWeight(contextWeight);
    if (contextWeightUnit) setWeightUnit(contextWeightUnit);
  }, [contextWeight, contextWeightUnit]);

  const convertToKg = (value: number, unit: 'kg' | 'lbs') => {
    return unit === 'kg' ? value : value * 0.453592;
  };

  const calculateFromWeight = () => {
    // Check if weight is a valid number before proceeding
    if (weight === '' || weight <= 0) return;

    const kg = convertToKg(weight, weightUnit);
    if (!kg) return;

    let calorieTarget = kg * 33; // rough estimate ~33 kcal/kg maintenance
    if (goal === 'cut') calorieTarget *= 0.8;
    if (goal === 'bulk') calorieTarget *= 1.15;

    setCalories(Math.round(calorieTarget));
    calculateMacros(calorieTarget, kg);
  };

  const calculateFromTDEE = () => {
    if (!tdeeCalories) return;
    setCalories(Math.round(tdeeCalories));

    // Use context weight if available
    const kg = convertToKg(contextWeight ?? 70, contextWeightUnit ?? 'kg');
    calculateMacros(tdeeCalories, kg);
  };

  const calculateMacros = (calorieTarget: number, kg: number) => {
    const protein = Math.round(kg * 2); // ~2g protein per kg
    const fat = Math.round((calorieTarget * 0.25) / 9); // ~25% calories from fat
    const carbs = Math.round((calorieTarget - (protein * 4 + fat * 9)) / 4);

    setMacros({ protein, fat, carbs });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'weight') {
      calculateFromWeight();
    } else {
      calculateFromTDEE();
    }
  };

  return (
    <div className="bg-white">
      <div className="p-6 min-h-screen max-w-4xl mx-auto roboto-condensed-thin">
        <BackButton className="text-black" label="Calculators" backUrl="/calculators" />
        <h1 className="text-3xl font-bold uppercase mb-8 text-black roboto-condensed-logo">
          Macronutrient Calculator
        </h1>

        {/* Mode Selector */}
        <div className="flex gap-2 mb-6">
          <button
            type="button"
            onClick={() => setMode('tdee')}
            className={`flex-1 px-4 py-3 uppercase text-black font-semibold transition-colors duration-300 ${
              mode === 'tdee'
                ? 'bg-slate-600 text-white'
                : 'bg-stone-200 hover:cursor-pointer text-black hover:bg-stone-200 hover:text-black'
            }`}
          >
            Use Calorie Estimate
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('weight');
              setShowEstimator(false);
            }}
            className={`flex-1 px-4 py-3 uppercase text-black font-semibold transition-colors duration-300 ${
              mode === 'weight'
                ? 'bg-slate-600 text-white'
                : 'bg-stone-200 hover:cursor-pointer text-black hover:bg-stone-200 hover:text-black'
            }`}
          >
            Use Weight & Goal
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-stone-200 p-6 shadow-lg">
          {mode === 'weight' && (
            <>
              {/* Weight */}
              <div>
                <label className="block text-black text-sm uppercase mb-2">Weight</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={weight}
                    onChange={(e) => setWeight(Number(e.target.value))}
                    placeholder="Enter weight"
                    className="flex-1 p-3 bg-stone-100 text-black placeholder-stone-700 focus:outline-none focus:ring-2 focus:ring-[#7fa9e4]"
                    required
                  />
                  <div className="flex gap-2">
                    {['kg', 'lbs'].map((unit) => (
                      <button
                        key={unit}
                        type="button"
                        onClick={() => {
                          if (weight !== '' && unit !== weightUnit) {
                            // Convert weight to new unit
                            const convertedWeight =
                              unit === 'kg'
                                ? Number((Number(weight) * 0.453592).toFixed(2))
                                : Number((Number(weight) / 0.453592).toFixed(2));
                            setWeight(convertedWeight);
                          }
                          setWeightUnit(unit as 'kg' | 'lbs');
                        }}
                        className={`px-4 py-3 uppercase text-black font-semibold transition-colors duration-300 ${
                          weightUnit === unit
                            ? 'bg-slate-600 text-white'
                            : 'bg-stone-100 hover:cursor-pointer hover:bg-white hover:text-black'
                        }`}
                      >
                        {unit}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Goal */}
              <div>
                <label className="block text-black text-sm uppercase mb-2">Goal</label>
                <div className="flex gap-2">
                  {['maintain', 'cut', 'bulk'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGoal(g as 'maintain' | 'cut' | 'bulk')}
                      className={`flex-1 px-4 py-3 uppercase text-black font-semibold transition-colors duration-300 ${
                        goal === g
                          ? 'bg-slate-600 text-white'
                          : 'bg-stone-100 hover:cursor-pointer hover:bg-white hover:text-black'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {mode === 'tdee' && !tdeeCalories && (
            <p className="text-stone-700 text-sm">
              No TDEE value provided. Please calculate calories first or switch to weight mode.
              &nbsp;
              <button
                type="button"
                onClick={() => setShowEstimator(!showEstimator)}
                className="underline hover:text-black hover:cursor-pointer"
              >
                Calculate TDEE
              </button>
            </p>
          )}

          {/* TDEE reminder text with Recalculate toggle */}
          {mode === 'tdee' && tdeeCalories && (
            <p className="text-stone-700 mb-4">
              Press calculate below to generate your macros based on your calculated TDEE of{' '}
              <span className="font-bold">{tdeeCalories}</span> kcal.{' '}
              <button
                type="button"
                onClick={() => setShowEstimator(!showEstimator)}
                className="underline hover:text-black hover:cursor-pointer"
              >
                Recalculate TDEE
              </button>
            </p>
          )}

          {/* Inline CalorieEstimator */}
          {showEstimator && <CalorieEstimator onTdeeCalculated={(tdee) => setTdeeCalories(tdee)} />}

          {/* Submit button */}
          <button
            type="submit"
            className="bg-slate-600 hover:cursor-pointer roboto-condensed-logo uppercase text-lg hover:bg-white hover:text-black text-white font-semibold px-6 py-3 transition-colors duration-300 w-full"
            disabled={mode === 'tdee' && !tdeeCalories}
          >
            Calculate Macros
          </button>
        </form>

        {macros && calories !== null && (
          <div className="mt-6 bg-slate-600 p-6 shadow-lg text-white text-lg space-y-2">
            <p>
              Daily Calories: <span className="font-bold">{calories}</span> kcal
            </p>
            <p>
              Protein: <span className="font-bold">{macros.protein}</span> g
            </p>
            <p>
              Fat: <span className="font-bold">{macros.fat}</span> g
            </p>
            <p>
              Carbs: <span className="font-bold">{macros.carbs}</span> g
            </p>
          </div>
        )}

        <p className="mt-4 text-sm text-stone-500 leading-relaxed">
          This calculator provides estimated macronutrient needs based on body weight or calorie
          targets. Protein values follow the recommendations from the{' '}
          <strong>International Society of Sports Nutrition</strong> for athletes (1.6–2.2
          g/kg/day). For more details, see the ISSN Position Stand: &nbsp;
          <a
            href="https://pubmed.ncbi.nlm.nih.gov/28698222/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-white"
          >
            PMID: 28698222
          </a>
          .
        </p>
      </div>
    </div>
  );
}
