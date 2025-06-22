const AnalyticsCards = () => {
  const cards = [
    { label: "Total Uploads", value: 92, percent: "↑ 12%", color: "green" },
    { label: "Published", value: 76, percent: "↑ 9%", color: "blue" },
    { label: "Active Classes", value: 5, percent: "↔", color: "purple" },
    { label: "Failures", value: 13, percent: "↓ 4%", color: "red" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`bg-white shadow-md rounded-xl p-4 border-l-4 border-${card.color}-400`}
        >
          <p className="text-sm text-gray-500">{card.label}</p>
          <h2 className="text-2xl font-bold text-[#2e1065]">{card.value}</h2>
          <p className={`text-xs text-${card.color}-600 font-semibold`}>{card.percent}</p>
        </div>
      ))}
    </div>
  );
};

export default AnalyticsCards;
