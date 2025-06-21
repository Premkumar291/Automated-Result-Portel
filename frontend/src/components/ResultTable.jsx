const ResultTable = () => {
  const data = [
    { name: "CSE - II Year", subject: "Maths", date: "2025-06-01", status: "Published" },
    { name: "ECE - I Year", subject: "Physics", date: "2025-06-03", status: "Draft" },
  ];

  return (
    <div className="mt-8 bg-white rounded-xl shadow-md p-4">
      <h3 className="text-lg font-semibold text-[#2e1065] mb-4">Latest Uploaded Results</h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-gray-600">
            <th className="py-2">Class</th>
            <th>Subject</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="border-t">
              <td className="py-2">{row.name}</td>
              <td>{row.subject}</td>
              <td>{row.date}</td>
              <td>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    row.status === "Published"
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {row.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultTable;
