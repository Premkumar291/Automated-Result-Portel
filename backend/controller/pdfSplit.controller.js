// Define valid confidence levels for PDF splitting
export const validConfidenceLevels = {
  'high': ['high'],
  'medium': ['high', 'medium'],
  'low': ['high', 'medium', 'low', 'fallback']
};

// Map numeric confidence threshold to string levels
export const mapConfidenceThreshold = (threshold) => {
  // Convert string to number if needed
  const numThreshold = typeof threshold === 'string' ? parseFloat(threshold) : threshold;
  
  if (numThreshold >= 0.8) return 'high';
  if (numThreshold >= 0.5) return 'medium';
  return 'low';
};