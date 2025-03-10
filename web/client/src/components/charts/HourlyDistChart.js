import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Clock } from 'lucide-react';

const HourlyDistChart = ({ hourlyData }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex items-center mb-4">
        <Clock className="text-blue-500 mr-2" size={20} />
        <h2 className="text-lg font-semibold text-gray-700">Hourly Distribution</h2>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={hourlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="hour" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="in" fill="#10B981" name="Entries" />
            <Bar dataKey="out" fill="#EF4444" name="Exits" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default HourlyDistChart;