
import React from 'react';
import { Scores } from '../types';

interface ResultsChartProps {
  scores: Scores;
}

export const ResultsChart: React.FC<ResultsChartProps> = ({ scores }) => {
  const { a, b, c, d } = scores;

  // Avoid division by zero if scores are 0
  const horizontalTotal = a + b || 1;
  const verticalTotal = c + d || 1;

  // Calculate percentages for the grid dimensions
  const aPercent = (a / horizontalTotal) * 100;
  const bPercent = 100 - aPercent;
  const cPercent = (c / verticalTotal) * 100;
  const dPercent = 100 - cPercent;

  return (
    <div className="w-full">
      <div className="relative w-full aspect-square max-w-sm mx-auto rounded-2xl overflow-hidden shadow-2xl border-4 border-white ring-1 ring-brand-muted/20">
        {/* Quadrant Areas */}
        <div className="absolute top-0 left-0 bg-indigo-500/90 transition-all duration-700 ease-out" style={{ width: `${bPercent}%`, height: `${cPercent}%` }}></div>
        <div className="absolute top-0 right-0 bg-rose-500/90 transition-all duration-700 ease-out" style={{ width: `${aPercent}%`, height: `${cPercent}%` }}></div>
        <div className="absolute bottom-0 left-0 bg-emerald-500/90 transition-all duration-700 ease-out" style={{ width: `${bPercent}%`, height: `${dPercent}%` }}></div>
        <div className="absolute bottom-0 right-0 bg-amber-400/90 transition-all duration-700 ease-out" style={{ width: `${aPercent}%`, height: `${dPercent}%` }}></div>

        {/* Axes */}
        <div className="absolute top-0 h-full w-0.5 bg-white/40 shadow-sm z-10" style={{ left: `${bPercent}%` }}></div>
        <div className="absolute left-0 w-full h-0.5 bg-white/40 shadow-sm z-10" style={{ top: `${cPercent}%` }}></div>

        {/* Labels Overlay */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-20 p-4 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="text-white text-xs sm:text-sm font-black bg-black/20 backdrop-blur-sm px-2 py-1 rounded">משימתי מרחוק</div>
            <div className="text-white text-xs sm:text-sm font-black bg-black/20 backdrop-blur-sm px-2 py-1 rounded">משימתי מקרוב</div>
          </div>
          <div className="flex justify-between items-end">
            <div className="text-white text-xs sm:text-sm font-black bg-black/20 backdrop-blur-sm px-2 py-1 rounded">חברתי מרחוק</div>
            <div className="text-white text-xs sm:text-sm font-black bg-black/20 backdrop-blur-sm px-2 py-1 rounded">חברתי מקרוב</div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center gap-6">
        <div className="w-4 h-4 rounded-full bg-rose-500 shadow-md"></div>
        <div className="w-4 h-4 rounded-full bg-indigo-500 shadow-md"></div>
        <div className="w-4 h-4 rounded-full bg-amber-400 shadow-md"></div>
        <div className="w-4 h-4 rounded-full bg-emerald-500 shadow-md"></div>
      </div>

      <p className="mt-6 text-center text-brand-muted text-sm px-4">
        השטח בכל צבע משקף את הדומיננטיות היחסית של אותו סגנון תקשורת בעולמך המקצועי.
      </p>
    </div>
  );
};