import React from 'react';
import { QuestionPair } from '../types';

interface QuestionSliderProps {
  question: QuestionPair;
  value: number;
  onChange: (value: number) => void;
}

export const QuestionSlider: React.FC<QuestionSliderProps> = ({ question, value, onChange }) => {
  const [trait1, trait2] = question.pair;
  const [desc1, desc2] = question.descriptions || ['', ''];

  // Logic: If value is 0 (unanswered), we visually put the slider in the middle (3.5)
  // but we hide the thumb until the user interacts.
  const visualValue = value === 0 ? 3.5 : value;
  const isUnanswered = value === 0;

  // Helper to handle direct click on numbers
  const handleNumberClick = (num: number) => {
    onChange(num);
  };

  return (
    <div className="w-full select-none">
      {/* Labels Row */}
      <div className="flex justify-between items-start text-brand-dark mb-8 tracking-wide">
        {/* Right Side (Trait 1) */}
        <div className="text-right w-1/2 pl-4 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => onChange(1)}>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-brand-accent">{trait1}</div>
          <div className="text-sm sm:text-base text-brand-muted mt-1 leading-tight">{desc1}</div>
        </div>

        {/* Left Side (Trait 2) */}
        <div className="text-left w-1/2 pr-4 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => onChange(6)}>
          <div className="text-xl sm:text-2xl md:text-3xl font-bold text-brand-accent">{trait2}</div>
          <div className="text-sm sm:text-base text-brand-muted mt-1 leading-tight">{desc2}</div>
        </div>
      </div>

      {/* Slider Container */}
      <div className="relative h-16 flex items-center justify-center">
        <style>
          {`
            /* Styling the Range Input */
            input[type=range] {
                -webkit-appearance: none; 
                width: 100%; 
                background: transparent;
                z-index: 20;
                position: relative;
            }
            input[type=range]::-webkit-slider-thumb {
                -webkit-appearance: none;
                height: 32px;
                width: 32px;
                border-radius: 50%;
                background: #607d8b;
                cursor: pointer;
                margin-top: -14px; 
                box-shadow: 0 0 10px rgba(96, 125, 139, 0.4);
                border: 3px solid white;
                transition: transform 0.1s ease;
            }
            input[type=range]::-webkit-slider-thumb:hover {
                transform: scale(1.1);
            }
            input[type=range]::-moz-range-thumb {
                height: 32px;
                width: 32px;
                border-radius: 50%;
                background: #607d8b;
                cursor: pointer;
                border: 3px solid white;
                box-shadow: 0 0 10px rgba(96, 125, 139, 0.4);
            }
            /* Hide thumb if unanswered */
            .slider-unanswered::-webkit-slider-thumb { opacity: 0; }
            .slider-unanswered::-moz-range-thumb { opacity: 0; }
          `}
        </style>

        {/* Visual Track Line */}
        <div className="absolute left-0 right-0 h-1.5 bg-brand-muted/20 rounded-full z-0 top-1/2 transform -translate-y-1/2"></div>

        {/* Visual Dots on Track */}
        <div className="absolute left-0 right-0 top-1/2 transform -translate-y-1/2 flex justify-between px-[12px] z-0 pointer-events-none">
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <div key={num} className={`w-3.5 h-3.5 rounded-full transition-colors duration-300 border border-brand-muted/30 ${value === num ? 'bg-brand-accent scale-125 shadow-[0_0_8px_rgba(96,125,139,0.5)]' : (value > 0 && Math.abs(value - num) < 1 ? 'bg-brand-accent/30' : 'bg-white')}`}></div>
          ))}
        </div>

        {/* The Actual Input */}
        <input
          type="range"
          min="1"
          max="6"
          step="1"
          value={visualValue}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${isUnanswered ? 'slider-unanswered' : ''}`}
        />

      </div>

      {/* Clickable Numbers Below */}
      <div className="flex justify-between mt-4 px-1">
        {[1, 2, 3, 4, 5, 6].map((num) => (
          <button
            key={num}
            onClick={() => handleNumberClick(num)}
            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-xl font-bold transition-all duration-200 
                    ${value === num
                ? 'bg-brand-accent text-white scale-110 shadow-lg ring-2 ring-brand-accent/30'
                : 'bg-white text-brand-muted hover:bg-brand-beige hover:text-brand-dark border border-brand-muted/20'
              }`}
          >
            {num}
          </button>
        ))}
      </div>

      <div className="text-center h-10 flex items-center justify-center mt-8">
        {!isUnanswered ? (
          <div className="animate-fade-in bg-brand-accent/5 px-6 py-2 rounded-full border border-brand-accent/20 text-brand-accent font-medium text-lg">
            {value <= 3 ? `נוטה יותר ל"${trait1}"` : `נוטה יותר ל"${trait2}"`}
          </div>
        ) : (
          <div className="text-brand-muted text-sm animate-pulse">בחר מספר או הזז את הסליידר</div>
        )}
      </div>
    </div>
  );
};