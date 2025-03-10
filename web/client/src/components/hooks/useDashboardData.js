import React, { useState, useEffect } from 'react';

const useDashboardData = () => {   
  // State variables
  const [dailyData, setDailyData] = useState([]);
  const [hourlyData, setHourlyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [timeOfDayData, setTimeOfDayData] = useState([]);
  const [weekendComparisonData, setWeekendComparisonData] = useState([]);
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [timeOfDay, setTimeOfDay] = useState('');
  const [isWeekend, setIsWeekend] = useState('');

  // Date filtering
  const getDateFilterQuery = () => {
    let query = '';
    if (startDate) query += `start_date=${startDate}`;
    if (endDate) {
      if (query) query += '&';
      query += `end_date=${endDate}`;
    }
    return query ? `?${query}` : '';
  };

  // Time of day filtering
  const getHourlyFilterQuery = () => {
    let query = getDateFilterQuery();
    if (!query && (timeOfDay || isWeekend !== '')) {
      query = '?';
    } else if (query && (timeOfDay || isWeekend !== '')) {
      query += '&';
    }
    
    if (timeOfDay) {
      query += `time_of_day=${timeOfDay}`;
      if (isWeekend !== '') query += '&';
    }
    
    if (isWeekend !== '') {
      query += `is_weekend=${isWeekend}`;
    }
    
    return query;
  };

  // Fetch all data
  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      const dateFilter = getDateFilterQuery();
      const hourlyFilter = getHourlyFilterQuery();
      
      // Fetch daily totals
      const dailyResponse = await fetch(`http://localhost:3001/api/daily-totals${dateFilter}`);
      const dailyData = await dailyResponse.json();
      
      // Fetch hourly distribution
      const hourlyResponse = await fetch(`http://localhost:3001/api/hourly-distribution${hourlyFilter}`);
      const hourlyData = await hourlyResponse.json();
      
      // Fetch weekly report
      const weeklyResponse = await fetch(`http://localhost:3001/api/weekly-report${dateFilter}`);
      const weeklyData = await weeklyResponse.json();
      
      // Fetch time of day data
      const timeOfDayResponse = await fetch(`http://localhost:3001/api/time-of-day${dateFilter}`);
      const timeOfDayData = await timeOfDayResponse.json();
      
      // Fetch weekend comparison
      const weekendResponse = await fetch(`http://localhost:3001/api/weekend-comparison${dateFilter}`);
      const weekendComparisonData = await weekendResponse.json();
      
      // Fetch stats
      const statsResponse = await fetch(`http://localhost:3001/api/stats${dateFilter}`);
      const statsData = await statsResponse.json();
      
      // Process daily data
      const processedDailyData = dailyData.map(day => ({
        date: day.date_recorded,
        entries: day.entries,
        exits: day.exits,
        net: day.entries - day.exits,
        isWeekend: day.is_weekend ? 'Weekend' : 'Weekday'
      }));
      
      // Process hourly data
      const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
      const processedHourlyData = hours.map(hour => {
        const inData = hourlyData.find(d => d.hour === parseInt(hour) && d.direction === 'in');
        const outData = hourlyData.find(d => d.hour === parseInt(hour) && d.direction === 'out');
        
        return {
          hour: `${hour}:00`,
          in: inData ? inData.count : 0,
          out: outData ? outData.count : 0
        };
      });
      
      // Process weekend comparison data
      const weekdayData = weekendComparisonData.filter(item => item.is_weekend === 0);
      const weekendData = weekendComparisonData.filter(item => item.is_weekend === 1);
      
      const processedWeekendData = hours.map(hour => {
        const weekdayHour = weekdayData.find(d => d.hour === parseInt(hour));
        const weekendHour = weekendData.find(d => d.hour === parseInt(hour));
        
        return {
          hour: `${hour}:00`,
          weekday: weekdayHour ? weekdayHour.entries : 0,
          weekend: weekendHour ? weekendHour.entries : 0
        };
      });
      
      setDailyData(processedDailyData);
      setHourlyData(processedHourlyData);
      setWeeklyData(weeklyData);
      setTimeOfDayData(timeOfDayData);
      setWeekendComparisonData(processedWeekendData);
      setStatsData(statsData);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch data. Please ensure the server is running.');
      setLoading(false);
      console.error('Error fetching data:', err);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [startDate, endDate, timeOfDay, isWeekend]);

  const handleFilterReset = () => {
    setStartDate('');
    setEndDate('');
    setTimeOfDay('');
    setIsWeekend('');
  };

  return {
    // Data
    dailyData,
    hourlyData,
    weeklyData,
    timeOfDayData,
    weekendComparisonData,
    statsData,
    
    // Status
    loading,
    error,
    
    // Filter states
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    timeOfDay,
    setTimeOfDay,
    isWeekend,
    setIsWeekend,
    
    // Actions
    handleFilterReset,
    refreshData: fetchAllData
  };
};
  
export default useDashboardData;