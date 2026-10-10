import React from 'react';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  fillColor?: string;
  isPositive?: boolean;
  strokeWidth?: number;
  className?: string;
}

export const Sparkline: React.FC<SparklineProps> = ({
  data,
  width = 64,
  height = 20,
  color,
  fillColor,
  isPositive,
  strokeWidth = 2,
  className = '',
}) => {
  if (!data || data.length < 2) {
    return <div className={`w-[${width}px] h-[${height}px]`} />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 2;
  const usableHeight = height - padding * 2;
  const usableWidth = width - padding * 2;

  const points = data.map((val, idx) => {
    const x = padding + (idx / (data.length - 1)) * usableWidth;
    const y = height - padding - ((val - min) / range) * usableHeight;
    return { x, y };
  });

  const strokeColor =
    color ||
    (isPositive !== undefined
      ? isPositive
        ? '#2D6A4F'
        : '#E76F51'
      : data[data.length - 1] >= data[0]
      ? '#2D6A4F'
      : '#E76F51');

  // Build SVG path
  const pathD = points.reduce((acc, pt, idx) => {
    if (idx === 0) return `M ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
    return `${acc} L ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
  }, '');

  // Fill path closing at bottom
  const fillD = `${pathD} L ${points[points.length - 1].x.toFixed(1)} ${height} L ${points[0].x.toFixed(1)} ${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={`overflow-visible ${className}`}
    >
      <defs>
        <linearGradient id={`sparkline-grad-${strokeColor.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.25" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path
        d={fillD}
        fill={`url(#sparkline-grad-${strokeColor.replace('#', '')})`}
      />
      <path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End point dot */}
      <circle
        cx={points[points.length - 1].x}
        cy={points[points.length - 1].y}
        r={2.5}
        fill={strokeColor}
      />
    </svg>
  );
};
