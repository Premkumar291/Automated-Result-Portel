// App.jsx
import React from 'react';
import AdminPanel from './components/AdminPanel';
import './App.css'; // Assuming you have a CSS file for global styles
import './index.css'; // Importing Tailwind CSS styles

function App() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <AdminPanel />
    </div>
  );
}

export default App;