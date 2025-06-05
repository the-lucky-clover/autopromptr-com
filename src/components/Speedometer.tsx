
import { useEffect, useState } from 'react';

interface SpeedometerProps {
  value: number;
  label: string;
  color?: string;
}

const Speedometer = ({ value, label, color = "#2563eb" }: SpeedometerProps) => {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value);
    }, 500);
    return () => clearTimeout(timer);
  }, [value]);

  const normalizedValue = Math.max(0, Math.min(100, animatedValue));
  const rotation = (normalizedValue / 100) * 180 - 90;

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm border">
      <div className="relative w-32 h-16 mb-4">
        <svg className="w-full h-full" viewBox="0 0 200 100">
          <path
            d="M 20 80 A 80 80 0 0 1 180 80"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M 20 80 A 80 80 0 0 1 180 80"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(normalizedValue / 100) * 251.2} 251.2`}
            className="transition-all duration-1000 ease-out"
          />
          <line
            x1="100"
            y1="80"
            x2="100"
            y2="40"
            stroke="#374151"
            strokeWidth="3"
            strokeLinecap="round"
            transform={`rotate(${rotation} 100 80)`}
            className="transition-transform duration-1000 ease-out"
          />
          <circle cx="100" cy="80" r="6" fill="#374151" />
        </svg>
        <div className="absolute inset-0 flex items-end justify-center pb-2">
          <span className="text-lg font-bold text-gray-900">{Math.round(normalizedValue)}</span>
        </div>
      </div>
      <p className="text-sm font-medium text-gray-600 text-center">{label}</p>
    </div>
  );
};

export default Speedometer;
