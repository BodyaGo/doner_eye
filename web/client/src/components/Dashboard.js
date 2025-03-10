import React from 'react';
import useDashboardData from './hooks/useDashboardData';
import Filters from './Filters';
import SummaryCards from './SummaryCards';
import DailyTrafficChart from './charts/DailyTrafficChart';
import HourlyDistChart from './charts/HourlyDistChart';
import WeeklyDistChart from './charts/WeeklyDistChart';
import TimeOfDayChart from './charts/TimeOfDayChart';
import WeekendCompChart from './charts/WeekendCompChart';
import StatisticsSummary from './StatisticsSummary';
import DailyRecordsTable from './DailyRecordsTable';

const Dashboard = () => {
  const {
    dailyData,
    hourlyData,
    weeklyData,
    timeOfDayData,
    weekendComparisonData,
    statsData,
    loading,
    error,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    timeOfDay,
    setTimeOfDay,
    isWeekend,
    setIsWeekend,
    handleFilterReset
  } = useDashboardData();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl font-semibold text-gray-700">Loading data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500 text-xl font-semibold p-6 bg-red-50 rounded-lg border border-red-200">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Advanced People Counter Dashboard</h1>
        <p className="text-gray-600">Comprehensive visualization of entrance and exit data</p>
      </header>
      
      <Filters 
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        timeOfDay={timeOfDay}
        setTimeOfDay={setTimeOfDay}
        isWeekend={isWeekend}
        setIsWeekend={setIsWeekend}
        handleFilterReset={handleFilterReset}
      />
      
      <SummaryCards statsData={statsData} />
      
      {/* Charts - Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <DailyTrafficChart dailyData={dailyData} />
        <HourlyDistChart hourlyData={hourlyData} />
      </div>
      
      {/* Charts - Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <WeeklyDistChart weeklyData={weeklyData} />
        <TimeOfDayChart timeOfDayData={timeOfDayData} />
        <WeekendCompChart weekendComparisonData={weekendComparisonData} />
      </div>
      
      <StatisticsSummary statsData={statsData} />
      <DailyRecordsTable dailyData={dailyData} />
    </div>
  );
};

export default Dashboard;