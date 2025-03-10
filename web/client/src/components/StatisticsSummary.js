import React from 'react';

const StatisticsSummary = ({ statsData }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-8">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Statistics Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="border rounded-lg p-3">
          <p className="text-sm text-gray-500">Date Range</p>
          <p className="text-lg font-medium">{statsData ? `${statsData.first_date} to ${statsData.last_date}` : 'N/A'}</p>
        </div>
        
        <div className="border rounded-lg p-3">
          <p className="text-sm text-gray-500">Unique People</p>
          <p className="text-lg font-medium">{statsData ? statsData.unique_people : 'N/A'}</p>
        </div>
        
        <div className="border rounded-lg p-3">
          <p className="text-sm text-gray-500">Peak Hour</p>
          <p className="text-lg font-medium">{statsData && statsData.peak_hour !== null ? `${statsData.peak_hour}:00 (${statsData.peak_time_of_day})` : 'N/A'}</p>
        </div>
        
        <div className="border rounded-lg p-3">
          <p className="text-sm text-gray-500">Days With Activity</p>
          <p className="text-lg font-medium">{statsData ? statsData.total_days : 'N/A'}</p>
        </div>
      </div>
    </div>
  );
};

export default StatisticsSummary;