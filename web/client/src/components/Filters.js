import React from 'react';
import { Filter, RefreshCw } from 'lucide-react';

const Filters = ({ 
  startDate, 
  setStartDate, 
  endDate, 
  setEndDate, 
  timeOfDay, 
  setTimeOfDay, 
  isWeekend, 
  setIsWeekend, 
  handleFilterReset 
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md mb-8">
      <div className="flex items-center mb-4">
        <Filter className="text-blue-500 mr-2" size={20} />
        <h2 className="text-lg font-semibold text-gray-700">Data Filters</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
          <input 
            type="date" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
          <input 
            type="date" 
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Time of Day</label>
          <select 
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={timeOfDay}
            onChange={(e) => setTimeOfDay(e.target.value)}
          >
            <option value="">All</option>
            <option value="Morning">Morning</option>
            <option value="Afternoon">Afternoon</option>
            <option value="Evening">Evening</option>
            <option value="Night">Night</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Day Type</label>
          <select 
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            value={isWeekend}
            onChange={(e) => setIsWeekend(e.target.value)}
          >
            <option value="">All</option>
            <option value="0">Weekday</option>
            <option value="1">Weekend</option>
          </select>
        </div>
        
        <div className="flex items-end">
          <button 
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center justify-center"
            onClick={handleFilterReset}
          >
            <RefreshCw size={16} className="mr-1" />
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default Filters;