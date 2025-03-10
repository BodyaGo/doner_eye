import numpy as np
import cv2 as cv
import Person
import time
import sqlite3
import os
from datetime import datetime

# Improved database path and connection
db_path = '/Users/mukha/Documents/МХП/AI Detect/DB/people_counter.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Enhanced database schema with more detailed temporal data
cursor.execute('''
CREATE TABLE IF NOT EXISTS counter_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    person_id INTEGER,
    direction TEXT,
    timestamp TEXT,
    date_recorded DATE,
    year INTEGER,
    month INTEGER,
    day INTEGER,
    week INTEGER,
    hour INTEGER,
    minute INTEGER,
    day_of_week INTEGER,
    is_weekend BOOLEAN,
    time_of_day TEXT
)
''')

# Create indexes for faster querying
cursor.execute('''
CREATE INDEX IF NOT EXISTS idx_date ON counter_data(date_recorded)
''')
cursor.execute('''
CREATE INDEX IF NOT EXISTS idx_direction ON counter_data(direction)
''')
cursor.execute('''
CREATE INDEX IF NOT EXISTS idx_year_month ON counter_data(year, month)
''')
cursor.execute('''
CREATE INDEX IF NOT EXISTS idx_time_of_day ON counter_data(time_of_day)
''')

conn.commit()

# Відкриття файлу журналу для запису
try:
    log = open('log.txt',"w")
except:
    print("Не вдається відкрити файл журналу")

# Лічильники для входу та виходу
cnt_up = 0
cnt_down = 0

# Джерело відео
cap = cv.VideoCapture('/Users/mukha/Documents/МХП/AI Detect/doner_eye/Test Files/1.mp4')  # Замініть на 0 для камери

# Виведення властивостей відео на консоль
for i in range(19):
    print(i, cap.get(i))

h = 480 #480
w = 640 #640
frameArea = h*w
areaTH = frameArea/250  # Поріг для визначення мінімальної площі об'єкта
print('Поріг площі', areaTH)

# Лінії для входу/виходу
line_up = int(2*(h/5))
line_down = int(3*(h/5))

up_limit = int(1*(h/5))
down_limit = int(4*(h/5))

print("Червона лінія y:", str(line_down))
print("Синя лінія y:", str(line_up))
line_down_color = (255,0,0)
line_up_color = (0,0,255)
pt1 = [0, line_down]
pt2 = [w, line_down]
pts_L1 = np.array([pt1,pt2], np.int32)
pts_L1 = pts_L1.reshape((-1,1,2))
pt3 = [0, line_up]
pt4 = [w, line_up]
pts_L2 = np.array([pt3,pt4], np.int32)
pts_L2 = pts_L2.reshape((-1,1,2))

pt5 = [0, up_limit]
pt6 = [w, up_limit]
pts_L3 = np.array([pt5,pt6], np.int32)
pts_L3 = pts_L3.reshape((-1,1,2))
pt7 = [0, down_limit]
pt8 = [w, down_limit]
pts_L4 = np.array([pt7,pt8], np.int32)
pts_L4 = pts_L4.reshape((-1,1,2))

# Створення фону для виявлення руху
fgbg = cv.createBackgroundSubtractorMOG2(detectShadows = True)

# Елементи для морфологічних фільтрів
kernelOp = np.ones((3,3),np.uint8)
kernelOp2 = np.ones((5,5),np.uint8)
kernelCl = np.ones((11,11),np.uint8)

# Змінні
font = cv.FONT_HERSHEY_SIMPLEX
persons = []
max_p_age = 5
pid = 1

# Helper function to determine time of day
def get_time_of_day(hour):
    if 5 <= hour < 12:
        return "Morning"
    elif 12 <= hour < 17:
        return "Afternoon"
    elif 17 <= hour < 21:
        return "Evening"
    else:
        return "Night"

# Enhanced function to save data to SQLite database with extended temporal information
def save_to_database(person_id, direction, timestamp_str):
    dt = datetime.strptime(timestamp_str, "%Y-%m-%d %H:%M:%S")
    
    # Extract all temporal components
    date_recorded = dt.strftime("%Y-%m-%d")
    year = dt.year
    month = dt.month
    day = dt.day
    week = dt.isocalendar()[1]  # ISO week number
    hour = dt.hour
    minute = dt.minute
    day_of_week = dt.weekday()  # Monday is 0, Sunday is 6
    is_weekend = 1 if day_of_week >= 5 else 0  # 5,6 are weekend days
    time_of_day = get_time_of_day(hour)
    
    cursor.execute('''
    INSERT INTO counter_data (
        person_id, direction, timestamp, date_recorded, 
        year, month, day, week, hour, minute, 
        day_of_week, is_weekend, time_of_day
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        person_id, direction, timestamp_str, date_recorded,
        year, month, day, week, hour, minute,
        day_of_week, is_weekend, time_of_day
    ))
    conn.commit()

while(cap.isOpened()):
    # Зчитуємо кадр з відео
    ret, frame = cap.read()
    if not ret:
        print('EOF')
        print('UP:', cnt_up)
        print('DOWN:', cnt_down)
        
        # Зберігаємо кінцеві лічильники в базі даних перед виходом
        current_time = time.strftime("%Y-%m-%d %H:%M:%S")
        save_to_database(0, "FINAL_UP_COUNT", current_time)
        save_to_database(0, "FINAL_DOWN_COUNT", current_time)
        break

    for i in persons:
        i.age_one()  # Оновлюємо вік кожної особи

    #########################
    #   ПРЕ-ПРОЦЕСИНГ      #
    #########################
    
    # Застосовуємо субстракцію фону
    fgmask = fgbg.apply(frame)
    fgmask2 = fgbg.apply(frame)

    # Бінаризація для видалення тіней (сірий колір)
    try:
        ret,imBin = cv.threshold(fgmask, 200, 255, cv.THRESH_BINARY)
        ret,imBin2 = cv.threshold(fgmask2, 200, 255, cv.THRESH_BINARY)
        # Операція відкриття (ерозія -> дилатація) для видалення шуму
        mask = cv.morphologyEx(imBin, cv.MORPH_OPEN, kernelOp)
        mask2 = cv.morphologyEx(imBin2, cv.MORPH_OPEN, kernelOp)
        # Операція закриття (дилатація -> ерозія) для з'єднання білих областей
        mask = cv.morphologyEx(mask, cv.MORPH_CLOSE, kernelCl)
        mask2 = cv.morphologyEx(mask2, cv.MORPH_CLOSE, kernelCl)
    except:
        break

    #################
    #   КОНТУРІ     #
    #################
    
    # RETR_EXTERNAL повертає тільки зовнішні контури
    contours0, hierarchy = cv.findContours(mask2, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    for cnt in contours0:
        area = cv.contourArea(cnt)
        if area > areaTH:
            #################
            #   ТРЕКІНГ    #
            #################
            
            # Логіка для відслідковування кількох осіб
            M = cv.moments(cnt)
            if M['m00'] == 0:  # Check for division by zero
                continue
                
            cx = int(M['m10']/M['m00'])
            cy = int(M['m01']/M['m00'])
            x, y, w, h = cv.boundingRect(cnt)

            new = True
            if cy in range(up_limit, down_limit):
                for i in persons:
                    if abs(x - i.getX()) <= w and abs(y - i.getY()) <= h:
                        # Якщо об'єкт знаходиться поруч з тим, що вже було виявлено
                        new = False
                        i.updateCoords(cx, cy)  # Оновлюємо координати об'єкта
                        if i.going_UP(line_down, line_up):
                            cnt_up += 1
                            timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
                            print("ID:", i.getId(), 'перейшов вгору в', timestamp)
                            log.write("ID: " + str(i.getId()) + ' перейшов вгору в ' + timestamp + '\n')
                            # Зберігаємо в базі даних
                            save_to_database(i.getId(), "in", timestamp)
                        elif i.going_DOWN(line_down, line_up):
                            cnt_down += 1
                            timestamp = time.strftime("%Y-%m-%d %H:%M:%S")
                            print("ID:", i.getId(), 'перейшов вниз в', timestamp)
                            log.write("ID: " + str(i.getId()) + ' перейшов вниз в ' + timestamp + '\n')
                            # Зберігаємо в базі даних
                            save_to_database(i.getId(), "out", timestamp)
                        break
                    if i.getState() == '1':
                        if i.getDir() == 'out' and i.getY() > down_limit:
                            i.setDone()
                        elif i.getDir() == 'in' and i.getY() < up_limit:
                            i.setDone()
                    if i.timedOut():
                        # Вилучаємо особу з списку, якщо вона вийшла з області
                        index = persons.index(i)
                        persons.pop(index)
                        del i  # Звільняємо пам'ять

                if new:
                    p = Person.MyPerson(pid, cx, cy, max_p_age)
                    persons.append(p)
                    pid += 1     

            #################
            #   ДІАГРАМИ   #
            #################
            cv.circle(frame, (cx, cy), 5, (0, 0, 255), -1)
            img = cv.rectangle(frame, (x, y), (x + w, y + h), (0, 255, 0), 2)            

    #########################
    #   ТРАЄКТОРІЇ        #
    #########################
    for i in persons:
        cv.putText(frame, str(i.getId()), (i.getX(), i.getY()), font, 0.3, i.getRGB(), 1, cv.LINE_AA)
        
    #################
    #   ЗОБРАЖЕННЯ   #
    #################
    str_up = 'IN: ' + str(cnt_up)
    str_down = 'OUT: ' + str(cnt_down)
    frame = cv.polylines(frame, [pts_L1], False, line_down_color, thickness=2)
    frame = cv.polylines(frame, [pts_L2], False, line_up_color, thickness=2)
    frame = cv.polylines(frame, [pts_L3], False, (255, 255, 255), thickness=1)
    frame = cv.polylines(frame, [pts_L4], False, (255, 255, 255), thickness=1)
    cv.putText(frame, str_up, (10, 40), font, 0.5, (255, 255, 255), 2, cv.LINE_AA)
    cv.putText(frame, str_up, (10, 40), font, 0.5, (0, 0, 255), 1, cv.LINE_AA)
    cv.putText(frame, str_down, (10, 90), font, 0.5, (255, 255, 255), 2, cv.LINE_AA)
    cv.putText(frame, str_down, (10, 90), font, 0.5, (255, 0, 0), 1, cv.LINE_AA)

    # Додаємо індикатор стану бази даних на кадр
    cv.putText(frame, "DB: " + db_path, (10, 20), font, 0.5, (50, 200, 50), 1, cv.LINE_AA)

    # Відображаємо кадр та маску
    cv.imshow('Frame', frame)
    cv.imshow('Mask', mask)    

    # Нажати ESC для виходу
    k = cv.waitKey(30) & 0xff
    if k == 27:
        # Зберігаємо підсумкові дані перед виходом
        current_time = time.strftime("%Y-%m-%d %H:%M:%S")
        save_to_database(0, "FINAL_UP_COUNT", current_time)
        save_to_database(0, "FINAL_DOWN_COUNT", current_time)
        break

# Завершення роботи програми
log.flush()
log.close()
cap.release()
cv.destroyAllWindows()

# Закриття з'єднання з базою даних
conn.close()