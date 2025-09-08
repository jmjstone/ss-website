'use client';

import { useState } from 'react';

export default function CalorieEstimator({
  onTdeeCalculated,
}: {
  onTdeeCalculated?: (calories: number) => void;
}) {
  const [age, setAge] = useState<number | ''>('');
  const [weight, setWeight] = useState<number | ''>('');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg');
  const [height, setHeight] = useState<number | ''>('');
  const [heightUnit, setHeightUnit] = useState<'cm' | 'in'>('cm');
  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [activity, setActivity] = useState(1.2);
  const [calories, setCalories] = useState<number | null>(null);

  // Conversion helpers
  const convertWeight = (value: number, to: 'kg' | 'lbs') =>
    to === 'kg' ? +(value / 2.20462).toFixed(1) : +(value * 2.20462).toFixed(1);

  const convertHeight = (value: number, to: 'cm' | 'in') =>
    to === 'cm' ? +(value * 2.54).toFixed(1) : +(value / 2.54).toFixed(1);

  const handleWeightUnitChange = (unit: 'kg' | 'lbs') => {
    if (weight !== '') setWeight(convertWeight(weight as number, unit));
    setWeightUnit(unit);
  };

  const handleHeightUnitChange = (unit: 'cm' | 'in') => {
    if (height !== '') setHeight(convertHeight(height as number, unit));
    setHeightUnit(unit);
  };

  const calculateCalories = () => {
    if (age === '' || weight === '' || height === '') return;

    const weightKg =
      weightUnit === 'kg' ? (weight as number) : convertWeight(weight as number, 'kg');
    const heightCm =
      heightUnit === 'cm' ? (height as number) : convertHeight(height as number, 'cm');

    const bmr =
      sex === 'male'
        ? 10 * weightKg + 6.25 * heightCm - 5 * (age as number) + 5
        : 10 * weightKg + 6.25 * heightCm - 5 * (age as number) - 161;

    const tdee = Math.round(bmr * activity);
    setCalories(tdee);

    if (onTdeeCalculated) onTdeeCalculated(tdee);
  };

  return (
    <div className="space-y-6 bg-stone-900 p-6 rounded-none shadow-lg">
      {/* Age */}
      <div>
        <label className="block text-white text-sm uppercase mb-2">Age</label>
        <input
          type="number"
          value={age}
          onChange={(e) => setAge(Number(e.target.value))}
          placeholder="Enter age"
          className="w-full p-3 rounded-none bg-stone-700 text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#7fa9e4]"
          required
        />
      </div>

      {/* Sex */}
      <div>
        <label className="block text-white text-sm uppercase mb-2">Sex</label>
        <div className="flex gap-2">
          {['male', 'female'].map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setSex(option as 'male' | 'female')}
              className={`flex-1 px-4 py-3 uppercase text-white font-semibold rounded-none transition-colors duration-300 
                ${
                  sex === option
                    ? 'bg-slate-600'
                    : 'bg-stone-700 hover:cursor-pointer hover:bg-white hover:text-black'
                }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Weight */}
      <div>
        <label className="block text-white text-sm uppercase mb-2">Weight</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(Number(e.target.value))}
            placeholder="Enter weight"
            className="flex-1 p-3 rounded-none bg-stone-700 text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#7fa9e4]"
            required
          />
          <div className="flex gap-2">
            {['kg', 'lbs'].map((unit) => (
              <button
                key={unit}
                type="button"
                onClick={() => handleWeightUnitChange(unit as 'kg' | 'lbs')}
                className={`px-4 py-3 uppercase text-white font-semibold rounded-none transition-colors duration-300 
                  ${
                    weightUnit === unit
                      ? 'bg-slate-600'
                      : 'bg-stone-700 hover:cursor-pointer hover:bg-white hover:text-black'
                  }`}
              >
                {unit}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Height */}
      <div>
        <label className="block text-white text-sm uppercase mb-2">Height</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={height}
            onChange={(e) => setHeight(Number(e.target.value))}
            placeholder="Enter height"
            className="flex-1 p-3 rounded-none bg-stone-700 text-white placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-[#7fa9e4]"
            required
          />
          <div className="flex gap-2">
            {['cm', 'in'].map((unit) => (
              <button
                key={unit}
                type="button"
                onClick={() => handleHeightUnitChange(unit as 'cm' | 'in')}
                className={`px-4 py-3 uppercase text-white font-semibold rounded-none transition-colors duration-300 
                  ${
                    heightUnit === unit
                      ? 'bg-slate-600'
                      : 'bg-stone-700 hover:cursor-pointer hover:bg-white hover:text-black'
                  }`}
              >
                {unit}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Activity */}
      <div>
        <label className="block text-white text-sm uppercase mb-2">Activity Level</label>
        <select
          value={activity}
          onChange={(e) => setActivity(Number(e.target.value))}
          className="w-full p-3 rounded-none hover:cursor-pointer bg-stone-700 text-white focus:outline-none focus:ring-2 focus:ring-[#7fa9e4]"
        >
          <option value={1.2}>Sedentary (little/no exercise)</option>
          <option value={1.375}>Lightly active (light exercise 1-3 days/wk)</option>
          <option value={1.55}>Moderately active (3-5 days/wk)</option>
          <option value={1.725}>Very active (6-7 days/wk)</option>
          <option value={1.9}>Extra active (hard training/physical job)</option>
        </select>
      </div>

      {/* Submit */}
      <button
        type="button"
        onClick={calculateCalories}
        className="bg-slate-600 roboto-condensed-logo hover:cursor-pointer uppercase text-lg hover:bg-white hover:text-black text-white font-semibold px-6 py-3 rounded-none transition-colors duration-300 w-full"
      >
        Calculate TDEE
      </button>

      {calories !== null && (
        <div className="mt-6 bg-stone-800 p-6 rounded-none shadow-lg text-white text-lg">
          Estimated Daily Calorie Needs: <span className="font-bold">{calories}</span> kcal
        </div>
      )}
    </div>
  );
}
