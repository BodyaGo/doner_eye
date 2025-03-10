const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;

// Enhanced middleware
app.use(cors());
app.use(express.json());
app.use(compression()); // Compress responses
app.use(helmet()); // Security middleware
app.use(morgan('dev')); // Logging middleware

// Rate limiting to prevent abuse
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later'
});
app.use('/api/', apiLimiter);

// Serve static files from React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}

// Database connection
const db = new sqlite3.Database('/Users/mukha/Documents/МХП/AI Detect/DB/people_counter.db', sqlite3.OPEN_READONLY, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
  } else {
    console.log('Connected to the people_counter database');
  }
});

// Advanced caching mechanism with cache invalidation
const cache = {
  data: {},
  timestamp: {},
  ttl: 10 * 1000 // 10 sec
};

function getCachedData(key, callback) {
  const now = Date.now();
  if (cache.data[key] && now - cache.timestamp[key] < cache.ttl) {
    return callback(null, cache.data[key]);
  }
  return false;
}

function setCachedData(key, data) {
  cache.data[key] = data;
  cache.timestamp[key] = Date.now();
}

function clearCache() {
  cache.data = {};
  cache.timestamp = {};
}

// Middleware to parse date range from query parameters
function parseDateRange(req, res, next) {
  const { start_date, end_date } = req.query;
  
  req.dateFilter = {
    hasRange: !!(start_date || end_date),
    startDate: start_date || '1970-01-01',
    endDate: end_date || '2099-12-31'
  };
  
  next();
}

// Enhanced API Routes

// Basic data endpoint with filtering capabilities
app.get('/api/data', parseDateRange, (req, res) => {
  const { startDate, endDate, hasRange } = req.dateFilter;
  const cacheKey = `all-data-${startDate}-${endDate}`;
  
  const cached = getCachedData(cacheKey, (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json(data);
  });

  if (cached) return;

  let query = `
    SELECT 
      date_recorded, 
      year,
      month,
      day,
      hour,
      day_of_week,
      is_weekend,
      time_of_day,
      direction, 
      COUNT(*) as count
    FROM counter_data 
  `;
  
  const params = [];
  
  if (hasRange) {
    query += ` WHERE date_recorded BETWEEN ? AND ?`;
    params.push(startDate, endDate);
  }
  
  query += `
    GROUP BY date_recorded, direction, hour
    ORDER BY date_recorded, hour
  `;
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    setCachedData(cacheKey, rows);
    res.json(rows);
  });
});

// Daily totals with detailed filtering
app.get('/api/daily-totals', parseDateRange, (req, res) => {
  const { startDate, endDate, hasRange } = req.dateFilter;
  const cacheKey = `daily-totals-${startDate}-${endDate}`;
  
  const cached = getCachedData(cacheKey, (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json(data);
  });

  if (cached) return;

  let query = `
    SELECT 
      date_recorded,
      year,
      month,
      day,
      day_of_week,
      is_weekend,
      COUNT(CASE WHEN direction = 'in' THEN 1 END) as entries,
      COUNT(CASE WHEN direction = 'out' THEN 1 END) as exits,
      COUNT(*) as total
    FROM counter_data 
  `;
  
  const params = [];
  
  if (hasRange) {
    query += ` WHERE date_recorded BETWEEN ? AND ?`;
    params.push(startDate, endDate);
  }
  
  query += `
    GROUP BY date_recorded
    ORDER BY date_recorded
  `;
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    setCachedData(cacheKey, rows);
    res.json(rows);
  });
});

// Hourly distribution with filtering
app.get('/api/hourly-distribution', parseDateRange, (req, res) => {
  const { startDate, endDate, hasRange } = req.dateFilter;
  const time_of_day = req.query.time_of_day || null;
  const is_weekend = req.query.is_weekend !== undefined ? parseInt(req.query.is_weekend) : null;
  
  const cacheKey = `hourly-distribution-${startDate}-${endDate}-${time_of_day}-${is_weekend}`;
  
  const cached = getCachedData(cacheKey, (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json(data);
  });

  if (cached) return;

  let query = `
    SELECT 
      hour,
      time_of_day,
      direction,
      COUNT(*) as count
    FROM counter_data 
    WHERE 1=1
  `;
  
  const params = [];
  
  if (hasRange) {
    query += ` AND date_recorded BETWEEN ? AND ?`;
    params.push(startDate, endDate);
  }
  
  if (time_of_day) {
    query += ` AND time_of_day = ?`;
    params.push(time_of_day);
  }
  
  if (is_weekend !== null) {
    query += ` AND is_weekend = ?`;
    params.push(is_weekend);
  }
  
  query += `
    GROUP BY hour, direction
    ORDER BY hour
  `;
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    setCachedData(cacheKey, rows);
    res.json(rows);
  });
});

// Weekly reports with enhanced filtering
app.get('/api/weekly-report', parseDateRange, (req, res) => {
  const { startDate, endDate, hasRange } = req.dateFilter;
  const cacheKey = `weekly-report-${startDate}-${endDate}`;
  
  const cached = getCachedData(cacheKey, (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json(data);
  });

  if (cached) return;

  let query = `
    SELECT 
      day_of_week,
      COUNT(CASE WHEN direction = 'in' THEN 1 END) as entries,
      COUNT(CASE WHEN direction = 'out' THEN 1 END) as exits,
      AVG(CASE WHEN direction = 'in' THEN 1 ELSE 0 END) as avg_entries_per_day,
      AVG(CASE WHEN direction = 'out' THEN 1 ELSE 0 END) as avg_exits_per_day
    FROM counter_data 
  `;
  
  const params = [];
  
  if (hasRange) {
    query += ` WHERE date_recorded BETWEEN ? AND ?`;
    params.push(startDate, endDate);
  }
  
  query += `
    GROUP BY day_of_week
    ORDER BY day_of_week
  `;
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Map day numbers to names
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const formattedRows = rows.map(row => ({
      ...row,
      day_name: dayNames[parseInt(row.day_of_week)]
    }));
    
    setCachedData(cacheKey, formattedRows);
    res.json(formattedRows);
  });
});

// Monthly aggregation
app.get('/api/monthly-report', parseDateRange, (req, res) => {
  const { startDate, endDate, hasRange } = req.dateFilter;
  const cacheKey = `monthly-report-${startDate}-${endDate}`;
  
  const cached = getCachedData(cacheKey, (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json(data);
  });

  if (cached) return;

  let query = `
    SELECT 
      year,
      month,
      COUNT(CASE WHEN direction = 'in' THEN 1 END) as entries,
      COUNT(CASE WHEN direction = 'out' THEN 1 END) as exits,
      COUNT(DISTINCT date_recorded) as days_with_activity
    FROM counter_data 
  `;
  
  const params = [];
  
  if (hasRange) {
    query += ` WHERE date_recorded BETWEEN ? AND ?`;
    params.push(startDate, endDate);
  }
  
  query += `
    GROUP BY year, month
    ORDER BY year, month
  `;
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Add month names
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const formattedRows = rows.map(row => ({
      ...row,
      month_name: monthNames[row.month - 1]
    }));
    
    setCachedData(cacheKey, formattedRows);
    res.json(formattedRows);
  });
});

// Time of day analysis
app.get('/api/time-of-day', parseDateRange, (req, res) => {
  const { startDate, endDate, hasRange } = req.dateFilter;
  const cacheKey = `time-of-day-${startDate}-${endDate}`;
  
  const cached = getCachedData(cacheKey, (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json(data);
  });

  if (cached) return;

  let query = `
    SELECT 
      time_of_day,
      COUNT(CASE WHEN direction = 'in' THEN 1 END) as entries,
      COUNT(CASE WHEN direction = 'out' THEN 1 END) as exits,
      COUNT(*) as total
    FROM counter_data 
  `;
  
  const params = [];
  
  if (hasRange) {
    query += ` WHERE date_recorded BETWEEN ? AND ?`;
    params.push(startDate, endDate);
  }
  
  query += `
    GROUP BY time_of_day
    ORDER BY 
      CASE 
        WHEN time_of_day = 'Morning' THEN 1
        WHEN time_of_day = 'Afternoon' THEN 2
        WHEN time_of_day = 'Evening' THEN 3
        WHEN time_of_day = 'Night' THEN 4
      END
  `;
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    setCachedData(cacheKey, rows);
    res.json(rows);
  });
});

// Weekend vs Weekday comparison
app.get('/api/weekend-comparison', parseDateRange, (req, res) => {
  const { startDate, endDate, hasRange } = req.dateFilter;
  const cacheKey = `weekend-comparison-${startDate}-${endDate}`;
  
  const cached = getCachedData(cacheKey, (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json(data);
  });

  if (cached) return;

  let query = `
    SELECT 
      is_weekend,
      hour,
      time_of_day,
      COUNT(CASE WHEN direction = 'in' THEN 1 END) as entries,
      COUNT(CASE WHEN direction = 'out' THEN 1 END) as exits,
      COUNT(*) as total
    FROM counter_data 
  `;
  
  const params = [];
  
  if (hasRange) {
    query += ` WHERE date_recorded BETWEEN ? AND ?`;
    params.push(startDate, endDate);
  }
  
  query += `
    GROUP BY is_weekend, hour
    ORDER BY is_weekend, hour
  `;
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Format the results
    const formattedRows = rows.map(row => ({
      ...row,
      day_type: row.is_weekend ? 'Weekend' : 'Weekday'
    }));
    
    setCachedData(cacheKey, formattedRows);
    res.json(formattedRows);
  });
});

// Comprehensive stats with filtering
app.get('/api/stats', parseDateRange, (req, res) => {
  const { startDate, endDate, hasRange } = req.dateFilter;
  const cacheKey = `stats-${startDate}-${endDate}`;
  
  const cached = getCachedData(cacheKey, (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json(data);
  });

  if (cached) return;

  let query = `
    SELECT 
      COUNT(*) as total_records,
      COUNT(DISTINCT date_recorded) as total_days,
      COUNT(DISTINCT person_id) as unique_people,
      MIN(date_recorded) as first_date,
      MAX(date_recorded) as last_date,
      COUNT(CASE WHEN direction = 'in' THEN 1 END) as total_entries,
      COUNT(CASE WHEN direction = 'out' THEN 1 END) as total_exits,
      ROUND(AVG(CASE WHEN direction = 'in' THEN 1 ELSE 0 END) * 100, 2) as percentage_entries,
      ROUND(AVG(CASE WHEN direction = 'out' THEN 1 ELSE 0 END) * 100, 2) as percentage_exits,
      (
        SELECT COUNT(*) FROM counter_data 
        WHERE direction = 'in' ${hasRange ? 'AND date_recorded BETWEEN ? AND ?' : ''}
      ) - 
      (
        SELECT COUNT(*) FROM counter_data 
        WHERE direction = 'out' ${hasRange ? 'AND date_recorded BETWEEN ? AND ?' : ''}
      ) as current_occupancy
    FROM counter_data
  `;
  
  const params = [];
  
  if (hasRange) {
    query += ` WHERE date_recorded BETWEEN ? AND ?`;
    params.push(startDate, endDate);
    // Add parameters for the subqueries
    params.push(startDate, endDate);
    params.push(startDate, endDate);
  }
  
  db.get(query, params, (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    // Additional peak hour query
    const peakHourQuery = `
      SELECT 
        hour,
        time_of_day,
        COUNT(*) as count
      FROM counter_data
      ${hasRange ? 'WHERE date_recorded BETWEEN ? AND ?' : ''}
      GROUP BY hour
      ORDER BY count DESC
      LIMIT 1
    `;
    
    const peakHourParams = hasRange ? [startDate, endDate] : [];
    
    db.get(peakHourQuery, peakHourParams, (peakErr, peakRow) => {
      if (peakErr) {
        setCachedData(cacheKey, row);
        return res.json(row);
      }
      
      // Combine results
      const combinedResult = {
        ...row,
        peak_hour: peakRow ? peakRow.hour : null,
        peak_time_of_day: peakRow ? peakRow.time_of_day : null
      };
      
      setCachedData(cacheKey, combinedResult);
      res.json(combinedResult);
    });
  });
});

// Advanced analytics - hourly trends
app.get('/api/hourly-trends', parseDateRange, (req, res) => {
  const { startDate, endDate, hasRange } = req.dateFilter;
  const cacheKey = `hourly-trends-${startDate}-${endDate}`;
  
  const cached = getCachedData(cacheKey, (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    return res.json(data);
  });

  if (cached) return;

  let query = `
    SELECT 
      hour,
      AVG(CASE WHEN day_of_week = 0 THEN 
        CASE WHEN direction = 'in' THEN 1 ELSE 0 END
      END) as monday_entries,
      AVG(CASE WHEN day_of_week = 1 THEN 
        CASE WHEN direction = 'in' THEN 1 ELSE 0 END
      END) as tuesday_entries,
      AVG(CASE WHEN day_of_week = 2 THEN 
        CASE WHEN direction = 'in' THEN 1 ELSE 0 END
      END) as wednesday_entries,
      AVG(CASE WHEN day_of_week = 3 THEN 
        CASE WHEN direction = 'in' THEN 1 ELSE 0 END
      END) as thursday_entries,
      AVG(CASE WHEN day_of_week = 4 THEN 
        CASE WHEN direction = 'in' THEN 1 ELSE 0 END
      END) as friday_entries,
      AVG(CASE WHEN day_of_week = 5 THEN 
        CASE WHEN direction = 'in' THEN 1 ELSE 0 END
      END) as saturday_entries,
      AVG(CASE WHEN day_of_week = 6 THEN 
        CASE WHEN direction = 'in' THEN 1 ELSE 0 END
      END) as sunday_entries
    FROM counter_data
  `;
  
  const params = [];
  
  if (hasRange) {
    query += ` WHERE date_recorded BETWEEN ? AND ?`;
    params.push(startDate, endDate);
  }
  
  query += `
    GROUP BY hour
    ORDER BY hour
  `;
  
  db.all(query, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    setCachedData(cacheKey, rows);
    res.json(rows);
  });
});

// API to manually clear cache (admin only)
app.post('/api/admin/clear-cache', (req, res) => {
  // In a real app, add authentication here
  clearCache();
  res.json({ success: true, message: 'Cache cleared successfully' });
});

// Catch-all for React routes in production
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Close database connection when app is terminated
process.on('SIGINT', () => {
  db.close(() => {
    console.log('Database connection closed');
    process.exit(0);
  });
});