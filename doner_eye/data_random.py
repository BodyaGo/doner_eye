import sqlite3
import random
from datetime import datetime, timedelta
import time

# Connect to the database
db_path = '/Users/mukha/Documents/МХП/AI Detect/DB/people_counter.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Define possible values for directions
directions = ['in', 'out']

# Define possible times of day
times_of_day = ['morning', 'afternoon', 'evening', 'night']

# Generate random timestamps within the last 30 days
end_date = datetime.now()
start_date = end_date - timedelta(days=30)
start_timestamp = time.mktime(start_date.timetuple())
end_timestamp = time.mktime(end_date.timetuple())

# Generate 100 random records
for _ in range(100):
    # Generate random person_id (assuming IDs between 1 and 20)
    person_id = random.randint(1, 20)
    
    # Generate random direction
    direction = random.choice(directions)
    
    # Generate random timestamp
    random_timestamp = start_timestamp + random.random() * (end_timestamp - start_timestamp)
    dt = datetime.fromtimestamp(random_timestamp)
    
    # Format timestamp
    timestamp = dt.strftime('%Y-%m-%d %H:%M:%S')
    date_recorded = dt.strftime('%Y-%m-%d')
    
    # Extract time components
    year = dt.year
    month = dt.month
    day = dt.day
    week = dt.isocalendar()[1]  # ISO week number
    hour = dt.hour
    minute = dt.minute
    day_of_week = dt.weekday()  # 0-6 where 0 is Monday
    is_weekend = 1 if day_of_week >= 5 else 0  # Weekend is Saturday (5) and Sunday (6)
    
    # Determine time of day
    if 5 <= hour < 12:
        time_of_day = 'morning'
    elif 12 <= hour < 17:
        time_of_day = 'afternoon'
    elif 17 <= hour < 21:
        time_of_day = 'evening'
    else:
        time_of_day = 'night'
    
    # Insert record into database
    cursor.execute('''
    INSERT INTO counter_data 
    (person_id, direction, timestamp, date_recorded, year, month, day, week, hour, minute, day_of_week, is_weekend, time_of_day)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (person_id, direction, timestamp, date_recorded, year, month, day, week, hour, minute, day_of_week, is_weekend, time_of_day))

# Commit changes and close connection
conn.commit()
print(f"Successfully inserted 100 random records into the counter_data table.")
conn.close()