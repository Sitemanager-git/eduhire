import React from 'react';

const TailwindTest = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          Tailwind CSS Test
        </h1>
        <p className="text-gray-600 mb-4">
          If you can see colors and styling, Tailwind is working!
        </p>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition">
          Test Button
        </button>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="bg-red-500 h-12 rounded"></div>
          <div className="bg-green-500 h-12 rounded"></div>
          <div className="bg-blue-500 h-12 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default TailwindTest;