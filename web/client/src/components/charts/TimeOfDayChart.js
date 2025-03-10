import React from 'react';
import { PieChart, Pie, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Clock } from 'lucide-react';

const TimeOfDayChart = ({ timeOfDayData }) => {
  // Colors for time of day pie chart - pleasant color palette
  const timeOfDayColors = {
    'Morning': '#FCD34D',    // Warm yellow
    'Afternoon': '#60A5FA',  // Sky blue
    'Evening': '#A78BFA',    // Soft purple
    'Night': '#1E3A8A'       // Dark blue
  };
  
  // Backup pleasant color palette if there are additional categories
  const fallbackColors = [
    '#34D399', // Emerald green
    '#F87171', // Coral red
    '#FB923C', // Orange
    '#38BDF8', // Light blue
    '#A3E635'  // Lime
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex items-center mb-4">
        <Clock className="text-blue-500 mr-2" size={20} />
        <h2 className="text-lg font-semibold text-gray-700">Time of Day</h2>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={timeOfDayData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="entries"
              nameKey="time_of_day"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {timeOfDayData.map((entry, index) => {
                // Use predefined color if available, otherwise use fallback color palette
                const colorKey = entry.time_of_day;
                const color = timeOfDayColors[colorKey] || fallbackColors[index % fallbackColors.length];
                
                return <Cell key={`cell-${index}`} fill={color} />;
              })}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TimeOfDayChart;