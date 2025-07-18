// LoadingSpinner.jsx
// Displays a centered loading spinner with a customizable message

export default function LoadingSpinner({ message = "Loading analysis data..." }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">{message}</p>
      </div>
    </div>
  );
}
