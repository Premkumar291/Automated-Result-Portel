// SubjectPerformanceItem.jsx
// Displays performance metrics for an individual subject with a progress bar

export default function SubjectPerformanceItem({ subject, getPassPercentageColor }) {
  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:shadow-md transition-shadow duration-200">
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 text-lg">{subject.subject}</h3>
        <p className="text-sm text-gray-600">
          <span className="font-medium">{subject.passedStudents}</span>/<span>{subject.totalStudents}</span> students passed
        </p>
      </div>
      <div className="flex items-center space-x-4">
        <div className="w-32 bg-gray-200 rounded-full h-3 overflow-hidden shadow-inner">
          <div
            className={`h-3 rounded-full ${getPassPercentageColor(subject.passPercentage)}`}
            style={{ width: `${subject.passPercentage}%`, transition: 'width 1s ease-in-out' }}
          ></div>
        </div>
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold ${getPassPercentageColor(subject.passPercentage)} text-white shadow-sm`}>
          {subject.passPercentage.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}
