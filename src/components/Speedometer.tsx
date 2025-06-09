
import { useEffect, useState } from 'react';

interface SpeedometerProps {
  value: number;
  label: string;
  color?: string;
  description?: string;
}

const Speedometer = ({ value, label, color = "#2563eb", description }: SpeedometerProps) => {
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(value);
    }, 500);
    return () => clearTimeout(timer);
  }, [value]);

  const normalizedValue = Math.max(0, Math.min(100, animatedValue));
  const rotation = (normalizedValue / 100) * 180 - 90;
  const circumference = Math.PI * 80; // Half circle circumference
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (normalizedValue / 100) * circumference;

  return (
    <div className="flex flex-col items-center p-6 bg-white/10 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
      <div className="relative w-40 h-20 mb-6">
        <svg className="w-full h-full" viewBox="0 0 200 100">
          {/* Background arc */}
          <path
            d="M 20 80 A 80 80 0 0 1 180 80"
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <path
            d="M 20 80 A 80 80 0 0 1 180 80"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-2000 ease-out"
            style={{ transformOrigin: '100px 80px' }}
          />
          {/* Needle */}
          <line
            x1="100"
            y1="80"
            x2="100"
            y2="35"
            stroke="#ffffff"
            strokeWidth="3"
            strokeLinecap="round"
            transform={`rotate(${rotation} 100 80)`}
            className="transition-transform duration-2000 ease-out drop-shadow-sm"
          />
          {/* Center dot */}
          <circle cx="100" cy="80" r="6" fill="#ffffff" className="drop-shadow-sm" />
          {/* Scale marks */}
          {[0, 25, 50, 75, 100].map((mark) => {
            const markRotation = (mark / 100) * 180 - 90;
            return (
              <g key={mark}>
                <line
                  x1="100"
                  y1="25"
                  x2="100"
                  y2="30"
                  stroke="rgba(255,255,255,0.6)"
                  strokeWidth="2"
                  transform={`rotate(${markRotation} 100 80)`}
                />
                <text
                  x="100"
                  y="20"
                  textAnchor="middle"
                  fill="rgba(255,255,255,0.8)"
                  fontSize="10"
                  transform={`rotate(${markRotation} 100 80) rotate(${-markRotation} 100 20)`}
                >
                  {mark}
                </text>
              </g>
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-end justify-center pb-1">
          <span className="text-2xl font-bold text-white drop-shadow-lg">
            {Math.round(normalizedValue)}%
          </span>
        </div>
      </div>
      <h3 className="text-lg font-semibold text-white text-center mb-2">{label}</h3>
      {description && (
        <p className="text-sm text-gray-300 text-center leading-relaxed">{description}</p>
      )}
    </div>
  );
};

export default Speedometer;
