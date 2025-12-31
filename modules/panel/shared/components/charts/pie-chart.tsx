import { getColorFromName } from "@/shared/lib";

interface PieChartProps {
  data: { name: string; percentage: number; count: number }[];
}

export function PieChart({ data }: PieChartProps) {
  if (data.length === 0) return null;

  const size = 120;
  const center = size / 2;
  const radius = size / 2 - 8;

  let currentAngle = -90;

  const slices = data.map((item) => {
    const sliceAngle = (item.percentage / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle = endAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);

    const largeArc = sliceAngle > 180 ? 1 : 0;

    const pathData = [
      `M ${center} ${center}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
      "Z",
    ].join(" ");

    return {
      ...item,
      pathData,
      color: getColorFromName(item.name),
    };
  });

  return (
    <div className="flex gap-4 items-center">
      <svg width={size} height={size} className="flex-shrink-0">
        {slices.map((slice, index) => (
          <path
            key={index}
            d={slice.pathData}
            fill={slice.color}
            stroke="white"
            strokeWidth="2"
          />
        ))}
      </svg>
      <div className="flex-1 space-y-2">
        {data.map((item, index) => {
          const color = getColorFromName(item.name);
          return (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 truncate">
                  {item.name}
                </p>
              </div>
              <span className="text-xs font-semibold text-gray-700 flex-shrink-0">
                {item.percentage.toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
