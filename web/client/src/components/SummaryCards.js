import React from 'react';
import { Users, ArrowDownRight, ArrowUpRight, Activity } from 'lucide-react';

const SummaryCards = ({ statsData }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-lg shadow-xl">
        <div className="flex items-center mb-2">
          <Users className="text-white mr-2" size={20} />
          <h2 className="text-lg font-semibold text-white">Total Traffic</h2>
        </div>
        <p className="text-3xl font-bold text-white">{statsData ? statsData.total_records : 0}</p>
        <p className="text-sm text-white opacity-75">Over {statsData ? statsData.total_days : 0} days</p>
      </div>
      
      <div className="bg-gradient-to-r from-green-400 to-green-600 p-4 rounded-lg shadow-xl">
        <div className="flex items-center mb-2">
          <ArrowDownRight className="text-white mr-2" size={20} />
          <h2 className="text-lg font-semibold text-white">Entries</h2>
        </div>
        <p className="text-3xl font-bold text-white">{statsData ? statsData.total_entries : 0}</p>
        <p className="text-sm text-white opacity-75">{statsData ? statsData.percentage_entries : 0}% of total traffic</p>
      </div>
      
      <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 rounded-lg shadow-xl">
        <div className="flex items-center mb-2">
          <ArrowUpRight className="text-white mr-2" size={20} />
          <h2 className="text-lg font-semibold text-white">Exits</h2>
        </div>
        <p className="text-3xl font-bold text-white">{statsData ? statsData.total_exits : 0}</p>
        <p className="text-sm text-white opacity-75">{statsData ? statsData.percentage_exits : 0}% of total traffic</p>
      </div>
      
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-lg shadow-xl">
        <div className="flex items-center mb-2">
          <Activity className="text-white mr-2" size={20} />
          <h2 className="text-lg font-semibold text-white">Current Occupancy</h2>
        </div>
        <p className="text-3xl font-bold text-white">{statsData ? statsData.current_occupancy : 0}</p>
        <p className="text-sm text-white opacity-75">Difference between in and out</p>
      </div>
    </div>
  );
};

export default SummaryCards;