import React from 'react';

const StatisticsSummary = ({ dailyData }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md overflow-x-auto">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Daily Records</h2>
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entries</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Exits</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {dailyData.map((day, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{day.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{day.isWeekend}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">{day.entries}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500 font-medium">{day.exits}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" 
                    style={{ color: day.net > 0 ? '#10B981' : day.net < 0 ? '#EF4444' : '#6B7280' }}>
                  {day.net}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
  );
};

export default StatisticsSummary;