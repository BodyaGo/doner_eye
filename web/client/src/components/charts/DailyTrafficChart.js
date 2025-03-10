import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Calendar } from 'lucide-react';

const DailyTrafficChart = ({ dailyData }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex items-center mb-4">
        <Calendar className="text-blue-500 mr-2" size={20} />
        <h2 className="text-lg font-semibold text-gray-700">Daily Traffic</h2>
      </div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dailyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="entries" stroke="#10B981" name="Entries" />
            <Line type="monotone" dataKey="exits" stroke="#EF4444" name="Exits" />
            <Line type="monotone" dataKey="net" stroke="#8B5CF6" name="Net Flow" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DailyTrafficChart;