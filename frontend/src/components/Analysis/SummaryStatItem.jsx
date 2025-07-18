// SummaryStatItem.jsx
// Displays a single statistic in a styled card format

export default function SummaryStatItem({ count, label, bgColor, textColor, labelColor }) {
  return (
    <div className={`text-center p-5 ${bgColor} rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200`}>
      <div className={`text-3xl font-bold ${textColor} mb-2`}>
        {count}
      </div>
      <p className={`text-sm font-medium ${labelColor}`}>{label}</p>
    </div>
  );
}
