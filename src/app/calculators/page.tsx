'use client';

import Link from 'next/link';

export default function CalculatorsPage() {
  const calculators = [
    {
      title: 'Calorie Expenditure',
      description:
        'Estimate daily calories burned based on weight, height, age, sex, and activity.',
      link: '/calculators/calorie-expenditure',
    },
    {
      title: 'Protein & Macronutrient Intake',
      description: 'Find your recommended protein, carbs, and fat intake based on your goals.',
      link: '/calculators/macro-intake',
    },
  ];

  return (
    <main className="min-h-screen max-w-full bg-white text-black roboto-condensed-thin">
      <div className="max-w-7xl p-6 mx-auto">
        <h1 className="text-3xl font-bold uppercase roboto-condensed-logo mb-2">Calculators</h1>
        <p className="text-stone-600 uppercase mb-10 roboto-condensed-thin">
          Nutrition, lifting, and health focused fitness calculators
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {calculators.map((calc) => (
            <Link
              key={calc.title}
              href={calc.link}
              className="block bg-stone-200 hover:bg-stone-100  border-stone-300 p-6 rounded-none transition"
            >
              <h2 className="text-2xl font-bold uppercase roboto-condensed-logo mb-2">
                {calc.title}
              </h2>
              <p className="text-md text-stone-600">{calc.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
