#Model: Importing Packages
import pandas as pd
import numpy as np
from prophet import Prophet
import matplotlib.pyplot as plt
from pyworkforce.scheduling import MinAbsDifference
from gurobipy import *
import requests
from bs4 import BeautifulSoup
#API: Importing Packages
from flask import Flask, jsonify, request, abort
from flask_pymongo import PyMongo
import threading
import time


#Model: Helper, web scrapping to get the public holidays of that year
def scrape_public_holidays(url, year):
    response = requests.get(url)
    
    if response.status_code == 200:
        soup = BeautifulSoup(response.content, "html.parser")
        tab_id = f"Year-{year}"
        tab_content = soup.find("div", id=tab_id)
        if tab_content:
            holidays = []
            table = tab_content.find("table", class_="table--holiday")
            if table:
                rows = table.find_all("tr")
                for row in rows[1:]:  # Skip the header row
                    columns = row.find_all("td")
                    holiday_date = columns[0].get_text(strip=True)
                    holiday_name = columns[3].get_text(strip=True)
                    holidays.append({"Date": holiday_date, "Name": holiday_name})
            return holidays

def get_public_holidays(year):
    url = "https://www.mom.gov.sg/employment-practices/public-holidays"
    return scrape_public_holidays(url, year)

#Model: Customer Occupancy Forecast
#Trains data and generates 1 week forecast based on start date
#Returns a 2 column df, ds and yhat (Timestamp and Number of Customers)
#Takes in a the date/ string of a Monday, in YYYY-MM-DD HH:00 format
def generate_forecast(start_date):
    # Step 1: Load your dataset
    data = pd.read_csv("synthetic_final_poisson.csv")

    # Step 2: Data Preprocessing
    # Convert Timestamp column to datetime format
    data['Timestamp'] = pd.to_datetime(data['Timestamp'])
    # Convert Events_or_Holidays to boolean and add Day_of_Week columns
    data['Events_or_Holidays'] = data['Events_or_Holidays'].notnull()
    data = pd.get_dummies(data, columns=["Day_of_Week"])
    train_data=data

    # Step 3: Model Training
    # Prepare data in Prophet format
    prophet_train_data = pd.DataFrame()
    prophet_train_data['ds'] = train_data['Timestamp']
    prophet_train_data['y'] = train_data['Total_Customers']
    # Add events and day as additional regressors
    prophet_train_data['events'] = train_data['Events_or_Holidays']
    prophet_train_data['Mon'] = train_data['Day_of_Week_Monday']
    prophet_train_data['Tue'] = train_data['Day_of_Week_Tuesday']
    prophet_train_data['Wed'] = train_data['Day_of_Week_Wednesday']
    prophet_train_data['Thu'] = train_data['Day_of_Week_Thursday']
    prophet_train_data['Fri'] = train_data['Day_of_Week_Friday']
    prophet_train_data['Sat'] = train_data['Day_of_Week_Saturday']
    prophet_train_data['Sun'] = train_data['Day_of_Week_Sunday']
    # Initialize and fit Prophet model
    model = Prophet(growth='logistic')  # Set growth to logistic to enforce non-negative forecasts
    # Add the regressor for events
    model.add_regressor('events') 
    model.add_regressor('Mon')
    model.add_regressor('Tue')
    model.add_regressor('Wed')
    model.add_regressor('Thu')
    model.add_regressor('Fri')
    model.add_regressor('Sat')
    model.add_regressor('Sun')
    # Set the capacity ('cap') below 250
    cap = 250
    prophet_train_data['cap'] = cap
    # Fit the model
    model.fit(prophet_train_data)

    # Step 4: Future Prediction
    prediction_date=pd.to_datetime(start_date) 
    #future = pd.date_range(prediction_date + pd.Timedelta(hours=11), prediction_date + pd.Timedelta(hours=22), freq='H')
    futureb = pd.date_range(prediction_date, prediction_date + pd.Timedelta(days=6, hours=22), freq='H')
    future= futureb[(futureb.hour >= 11) & (futureb.hour <= 22)]
    # Make predictions
    future_df = pd.DataFrame({'ds': future})
    # Set the capacity for future predictions
    future_df['cap'] = cap
    # Include Events_or_Holidays for future predictions (apply 2023 events only)

    #web scraping
    #get the year 
    year = prediction_date.year
    holidays = get_public_holidays(year)
    all_dates = [holiday['Date'] for holiday in holidays]
    new_dates = []
    #there are cases where the dates retrieved are abit messy and this cleans up the dates. 
    for date in all_dates:
        parts = date.split()
        if len(parts) > 3:  # Check if there are more than 3 parts in the date
            month = parts[1]  # Extract the month
            year = parts[-1]
            days = [part for part in parts[0:-1] if part.isdigit()]  # Extract the days
            for day in days:
                if len(day)>2:
                    day = day[-2:]
                    new_date = day + ' ' + month + ' ' + str(year)
                    new_dates.append(new_date)
                else:
                    new_date = day + ' ' + month + ' ' + str(year)
                    new_dates.append(new_date)
        else:
            new_dates.append(date)

    future_df['date'] = future_df['ds'].dt.date
    future_df['date'] = pd.to_datetime(future_df['date']) 
    #the public holiday dates is in a different format and i'm changing it to dataframe
    dates_list = [pd.to_datetime(date) for date in new_dates]
    data = pd.DataFrame(dates_list)
    data[0] = data[0].astype(str)
    data.rename(columns={0: 'date_1'}, inplace=True)
    data['date_1'] = pd.to_datetime(data['date_1'])

    future_df = pd.merge(future_df, data, left_on='date', right_on='date_1', how='left')
    #get the events column
    future_df['events'] = ~future_df['date_1'].isnull()
    future_df.drop(['date_1'], axis=1, inplace=True)
    #get the Mon, Tue, etc columns
    future_df['day_of_week'] = pd.to_datetime(future_df['date']).dt.day_name()
    future_df = pd.get_dummies(future_df, columns=["day_of_week"])
    column_mapping = {
        'day_of_week_Monday': 'Mon',
        'day_of_week_Tuesday': 'Tue',
        'day_of_week_Wednesday': 'Wed',
        'day_of_week_Thursday': 'Thu',
        'day_of_week_Friday': 'Fri',
        'day_of_week_Saturday': 'Sat',
        'day_of_week_Sunday': 'Sun'
    }
    # Rename the columns
    future_df.rename(columns=column_mapping, inplace=True)
    forecast = model.predict(future_df)
    output=forecast[["ds", "yhat"]]
    output.loc[:, 'yhat'] = output['yhat'].astype(int)

    return output

#RETURNS 1 OUTPUT
# >>> output 
#                     ds   yhat
# 0  2023-01-01 11:00:00  216.0
# 1  2023-01-01 12:00:00  209.0
# 2  2023-01-01 13:00:00  238.0
# 3  2023-01-01 14:00:00  200.0
# 4  2023-01-01 15:00:00  147.0
# ..                 ...    ...
# 79 2023-01-07 18:00:00  223.0
# 80 2023-01-07 19:00:00  214.0
# 81 2023-01-07 20:00:00  208.0
# 82 2023-01-07 21:00:00  220.0
# 83 2023-01-07 22:00:00  132.0

#Model: Helper, get staff availability from db
def get_staff_availability():
    availabilities = mongo.db.availability.find()
    staff_availability = {availability['_id']: availability['availability'] for availability in availabilities}
    return staff_availability

#Model: Helper, get users/ staff from db
def get_usernames():
    # This query fetches only the 'username' field for all documents in the 'users' collection.
    user_documents = mongo.db.users.find({}, {'_id': 1})
    # Extract the 'username' from each document and create a list of usernames
    usernames = [user['_id'] for user in user_documents]
    return usernames

salary_mapping = {
    'full': 60,
    'part': 75,
    'manager': 60
}

#Model: Helper, get salaries based on roles from db
def calculate_salaries():
    users = mongo.db.users.find({}, {'role': 1, '_id': 0})  # Fetch only the 'role' field
    roles = [user['role'] for user in users]
    salaries = [salary_mapping[role] for role in roles]
    return salaries

#Model: Helper, find managers
def find_managers():
    # Query the database for users with the role of "manager"
    managers = mongo.db.users.find({"role": "manager"}, {"_id": 1})
    # Extract usernames from the query results
    manager_usernames = [manager['_id'] for manager in managers]
    return manager_usernames

#Model: Timetable Allocation
#Determines number of staff required for each shift and generates a 1 week schedule 
    #based on number of customers predicted in the week
#Returns a timetable that allocates specific staff to shifts, a dictionary depicting each staff and their shifts,
    #and the manpower cost for the week

#Takes in a date/ string, in YYYY-MM-DD HH:00 format 
def generate_timetable(start_date):
    forecast_data = generate_forecast(start_date)

    # Extract yhat column and adjust required_resources
    num_days = forecast_data['ds'].dt.date.nunique()
    num_periods = 11  

    required_resources = []
    for day in range(num_days):
        day_data = forecast_data[forecast_data['ds'].dt.date == forecast_data['ds'].dt.date.unique()[day]]
        day_values = day_data['yhat'].values.tolist()
        required_resources.append([int(np.ceil(x / 25)) for x in day_values]) #we assumed that every 25 customers requires 1 server

    shifts_coverage = {"Shift_1": [1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0],
                       "Shift_2": [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1]}


    # Define a function to solve the optimization problem
    def solve_with_retries():
        best_solution = None
        best_sum = float('inf')  # Initialize with positive infinity
        for _ in range(10):  # Try 10 times
            scheduler = MinAbsDifference(num_days=num_days,  # S
                                        periods=num_periods,  # P
                                        shifts_coverage=shifts_coverage,
                                        required_resources=required_resources,
                                        max_period_concurrency=12,  # gamma, max resources allowed in a period
                                        max_shift_concurrency=12)   # beta, max resources allowed in a shift
            solution = scheduler.solve()
            # Extract shift requirements from the solution
            shift_requirements = [shift['resources'] for shift in solution['resources_shifts']]
            # Calculate the sum of shift requirements
            current_sum = sum(shift_requirements)
            # Check if the current solution has the smallest sum so far
            if current_sum < best_sum:
                best_sum = current_sum
                best_solution = solution
        if best_solution is None:
            raise RuntimeError("Unable to find a valid solution after multiple retries")
        return best_solution

    solution = solve_with_retries()

    #################################################################################################################

    ## Create a list of workers and shifts
    # Each day is split into 2 shifts
    # F01 is full timer 1, P01 is part timer 1, and so on
    shiftList = ['Monday1','Monday2','Tuesday1','Tuesday2','Wednesday1','Wednesday2'
                ,'Thursday1','Thursday2','Friday1','Friday2','Saturday1','Saturday2','Sunday1','Sunday2']
    workerList = get_usernames()

    ## Define shift requirements based on solutionn above
    shiftReq = [shift['resources'] for shift in solution['resources_shifts']]
    shiftRequirements  = { s : shiftReq[i] for i,s in enumerate(shiftList) }

    ## Clarify worker availability
    # Assume everyone is NOT available first
    availability = pd.DataFrame(np.zeros((len(workerList), len(shiftList))), index=workerList, columns=shiftList)
    # Fill in who is busy
    for i in get_staff_availability(): #i is the key which is _id
        for j in get_staff_availability()[i]: #reiterate through the value of each _id, which is an array, to get all the availabilities of each staff
            availability.at[i,j] = 1
    # Create dictionary of final worker availability
    avail = {(w,s) : availability.loc[w,s] for w in workerList for s in shiftList}

    ## Specify who is a manager and who isn't
    mgmtList = find_managers()
    nonmgmtList = [x for x in workerList if x not in mgmtList]

    ## Define total shift cost per worker  

    # Cost of a regular shift
    regCost = calculate_salaries()
    # Cost of overtime shift
    OTCost = [1.5*x for x in regCost]
    # Create dictionaries with costs
    regularCost  = { w : regCost[i] for i,w in enumerate(workerList) }
    overtimeCost  = { w : OTCost[i] for i,w in enumerate(workerList) }

    ## Input assumptions
    # Range of shifts that every workers is required to stay between
    minShifts = 7
    maxShifts = 14
    # Number of shifts to trigger overtime
    OTTrigger = 10

    model = Model("Workers Scheduling")
    model.setParam('OutputFlag', 0)  # Suppress Gurobi output
    # ub ensures that workers are only staffed when they are available
    x = model.addVars(workerList, shiftList, ub=avail, vtype=GRB.BINARY, name='x')

    regHours = model.addVars(workerList, name='regHrs')
    overtimeHours = model.addVars(workerList, name='overtimeHrs')
    overtimeTrigger = model.addVars(workerList, name = "OT_Trigger", vtype = GRB.BINARY)

    # Ensure proper number of workers are scheduled

    shiftReq = model.addConstrs((
        (x.sum('*',s) == shiftRequirements[s] for s in shiftList)
    ), name='shiftRequirement')

    # Differentiate between regular time and overtime

    ## Decompose total shifts for each worker into regular shifts and OT shifts
    regOT1 = model.addConstrs((regHours[w] + overtimeHours[w] == x.sum(w,'*') for w in workerList))
    # Ensure that regular shifts are accounted for first for each nurse before counting OT shifts
    regOT2 = model.addConstrs((regHours[w] <= OTTrigger for w in workerList))
    ## Only allow the OT trigger to come on when regular shift count is greater than regular shift limit
    regOT3 = model.addConstrs((regHours[w] / OTTrigger >= overtimeTrigger[w] for w in workerList))


    ## Ensure each worker stays within min and max shift bounds

    minShiftsConstr = model.addConstrs(((
        x.sum(w,'*') >= minShifts for w in workerList)
    ), name='minShifts')

    maxShiftsConstr = model.addConstrs(((
        x.sum(w,'*') <= maxShifts for w in workerList)
    ), name='maxShifts')

    # Ensure every shift has at least one manager

    for s in shiftList:
        model.addConstr((quicksum(x.sum(m,s) for m in mgmtList) >= 1), name='mgmtStaffing'+str(s))

    #Minimize total cost, accounting for pay difference between regular time and overtime

    model.ModelSense = GRB.MINIMIZE

    Cost = 0
    Cost += (quicksum(regularCost[w]*regHours[w] + overtimeCost[w]*overtimeHours[w] for w in workerList))

    model.setObjective(Cost)

    model.optimize()

    sol = pd.DataFrame(data={'Solution':model.X}, index=model.VarName)
    sol = sol.iloc[0:len(x)]

    dashboard = pd.DataFrame(index = workerList, columns = shiftList)
    for w in workerList:
        for s in shiftList:
            dashboard.at[w,s] = sol.loc['x['+w+','+s+']',][0]

    shiftAssignments = {}
    for s in shiftList:
        shiftAssignments.update({s: list(dashboard[dashboard[s] == 1].loc[:,].index)})
        
    # return dashboard, str(model.ObjVal)
    global is_generating_data, timetable, total_cost
    is_generating_data = False
    timetable = dashboard.to_dict(orient='index')
    total_cost = str(model.ObjVal)


# @@@@@@@@@@@@@@@    TEMPORARY    @@@@@@@@@@@@@@@@@@
def placeholder_generate(start_date):
    time.sleep(15)
    global is_generating_data, timetable, total_cost
    is_generating_data = False
    timetable = {
        'P01': {'Monday1': -0.0, 'Monday2': 1.0, 'Tuesday1': 1.0, 'Tuesday2': 1.0, 'Wednesday1': -0.0, 'Wednesday2': 1.0, 'Thursday1': 1.0, 'Thursday2': 1.0, 'Friday1': 1.0, 'Friday2': -0.0, 'Saturday1': 1.0, 'Saturday2': -0.0, 'Sunday1': 1.0, 'Sunday2': 1.0}, 
        'P02': {'Monday1': 1.0, 'Monday2': 1.0, 'Tuesday1': 0.0, 'Tuesday2': 1.0, 'Wednesday1': 1.0, 'Wednesday2': 1.0, 'Thursday1': 0.0, 'Thursday2': 1.0, 'Friday1': 1.0, 'Friday2': 1.0, 'Saturday1': -0.0, 'Saturday2': 1.0, 'Sunday1': 1.0, 'Sunday2': -0.0}, 
        'P03': {'Monday1': 1.0, 'Monday2': 1.0, 'Tuesday1': 1.0, 'Tuesday2': -0.0, 'Wednesday1': 0.0, 'Wednesday2': 1.0, 'Thursday1': 1.0, 'Thursday2': 1.0, 'Friday1': 1.0, 'Friday2': 1.0, 'Saturday1': -0.0, 'Saturday2': 1.0, 'Sunday1': -0.0, 'Sunday2': 1.0}, 
        'P04': {'Monday1': 1.0, 'Monday2': 1.0, 'Tuesday1': 1.0, 'Tuesday2': 1.0, 'Wednesday1': 1.0, 'Wednesday2': -0.0, 'Thursday1': 1.0, 'Thursday2': -0.0, 'Friday1': 1.0, 'Friday2': -0.0, 'Saturday1': 0.0, 'Saturday2': 1.0, 'Sunday1': 1.0, 'Sunday2': 1.0}, 
        'P05': {'Monday1': 1.0, 'Monday2': 1.0, 'Tuesday1': 0.0, 'Tuesday2': 1.0, 'Wednesday1': -0.0, 'Wednesday2': -0.0, 'Thursday1': 1.0, 'Thursday2': 1.0, 'Friday1': 1.0, 'Friday2': 1.0, 'Saturday1': 1.0, 'Saturday2': 0.0, 'Sunday1': 1.0, 'Sunday2': 1.0}, 
        'P06': {'Monday1': 1.0, 'Monday2': 1.0, 'Tuesday1': -0.0, 'Tuesday2': 1.0, 'Wednesday1': 1.0, 'Wednesday2': 1.0, 'Thursday1': -0.0, 'Thursday2': 1.0, 'Friday1': 1.0, 'Friday2': 1.0, 'Saturday1': 1.0, 'Saturday2': 1.0, 'Sunday1': -0.0, 'Sunday2': -0.0}, 
        'P07': {'Monday1': 1.0, 'Monday2': 1.0, 'Tuesday1': 0.0, 'Tuesday2': 1.0, 'Wednesday1': 1.0, 'Wednesday2': -0.0, 'Thursday1': 1.0, 'Thursday2': -0.0, 'Friday1': -0.0, 'Friday2': 1.0, 'Saturday1': 1.0, 'Saturday2': 1.0, 'Sunday1': 1.0, 'Sunday2': 1.0}, 
        'F01': {'Monday1': -0.0, 'Monday2': -0.0, 'Tuesday1': 1.0, 'Tuesday2': -0.0, 'Wednesday1': 1.0, 'Wednesday2': 1.0, 'Thursday1': 0.0, 'Thursday2': 1.0, 'Friday1': -0.0, 'Friday2': -0.0, 'Saturday1': 1.0, 'Saturday2': 1.0, 'Sunday1': 1.0, 'Sunday2': 1.0}, 
        'F02': {'Monday1': 1.0, 'Monday2': 1.0, 'Tuesday1': -0.0, 'Tuesday2': -0.0, 'Wednesday1': 1.0, 'Wednesday2': -0.0, 'Thursday1': 1.0, 'Thursday2': -0.0, 'Friday1': -0.0, 'Friday2': 1.0, 'Saturday1': 1.0, 'Saturday2': -0.0, 'Sunday1': 1.0, 'Sunday2': -0.0}, 
        'F03': {'Monday1': 0.0, 'Monday2': -0.0, 'Tuesday1': 1.0, 'Tuesday2': 0.0, 'Wednesday1': -0.0, 'Wednesday2': 1.0, 'Thursday1': -0.0, 'Thursday2': -0.0, 'Friday1': 1.0, 'Friday2': 1.0, 'Saturday1': 1.0, 'Saturday2': 1.0, 'Sunday1': -0.0, 'Sunday2': 1.0}, 
        'F04': {'Monday1': -0.0, 'Monday2': 1.0, 'Tuesday1': 1.0, 'Tuesday2': 1.0, 'Wednesday1': 1.0, 'Wednesday2': 1.0, 'Thursday1': -0.0, 'Thursday2': 1.0, 'Friday1': -0.0, 'Friday2': 1.0, 'Saturday1': -0.0, 'Saturday2': -0.0, 'Sunday1': 1.0, 'Sunday2': 1.0}, 
        'F05': {'Monday1': 1.0, 'Monday2': 1.0, 'Tuesday1': 1.0, 'Tuesday2': 1.0, 'Wednesday1': -0.0, 'Wednesday2': 1.0, 'Thursday1': 1.0, 'Thursday2': -0.0, 'Friday1': -0.0, 'Friday2': -0.0, 'Saturday1': -0.0, 'Saturday2': 1.0, 'Sunday1': -0.0, 'Sunday2': 1.0}
    }
    total_cost = 7125


#dashboard, shiftAssignments, str(model.ObjVal)          

#RETURNS 2 OUTPUTS (TIMETABLE AND COST) FOR EXAMPLE:
# >>> dashboard
#      Monday1 Monday2 Tuesday1 Tuesday2 Wednesday1 Wednesday2 Thursday1 Thursday2 Friday1 Friday2 Saturday1 Saturday2 Sunday1 Sunday2
# EE01    -0.0     1.0      1.0      1.0       -0.0        1.0       1.0       1.0     1.0    -0.0       1.0      -0.0     1.0     1.0
# EE02     1.0     1.0      0.0      1.0        1.0        1.0       0.0       1.0     1.0     1.0      -0.0       1.0     1.0    -0.0
# EE03     1.0     1.0      1.0     -0.0        0.0        1.0       1.0       1.0     1.0     1.0      -0.0       1.0    -0.0     1.0
# EE04     1.0     1.0      1.0      1.0        1.0       -0.0       1.0      -0.0     1.0    -0.0       0.0       1.0     1.0     1.0
# EE05     1.0     1.0      0.0      1.0       -0.0       -0.0       1.0       1.0     1.0     1.0       1.0       0.0     1.0     1.0
# EE06     1.0     1.0     -0.0      1.0        1.0        1.0      -0.0       1.0     1.0     1.0       1.0       1.0    -0.0    -0.0
# EE07     1.0     1.0      0.0      1.0        1.0       -0.0       1.0      -0.0    -0.0     1.0       1.0       1.0     1.0     1.0
# EE08    -0.0    -0.0      1.0     -0.0        1.0        1.0       0.0       1.0    -0.0    -0.0       1.0       1.0     1.0     1.0
# EE09     1.0     1.0     -0.0     -0.0        1.0       -0.0       1.0      -0.0    -0.0     1.0       1.0      -0.0     1.0    -0.0
# EE10     0.0    -0.0      1.0      0.0       -0.0        1.0      -0.0      -0.0     1.0     1.0       1.0       1.0    -0.0     1.0
# EE11    -0.0     1.0      1.0      1.0        1.0        1.0      -0.0       1.0    -0.0     1.0      -0.0      -0.0     1.0     1.0
# EE12     1.0     1.0      1.0      1.0       -0.0        1.0       1.0      -0.0    -0.0    -0.0      -0.0       1.0    -0.0     1.0

# >>> str(model.ObjVal) 
# '7125.0'

app = Flask(__name__)
from flask_cors import CORS
CORS(app)

# MongoDB Configuration
app.config["MONGO_URI"] = "mongodb://localhost:27017/mydatabase"
mongo = PyMongo(app)

# Variables for async operations
is_generating_data = False
lock = threading.Lock()

# Stored data
timetable = {}
total_cost = 0

# Initialize MongoDB users collection
# mongo.db.users.insert_many([
#     {'_id': 'F01', 'password': 'adminpass', 'role': 'manager'},
#     {'_id': 'F02', 'password': 'adminpass', 'role': 'manager'},
#     {'_id': 'F03', 'password': 'adminpass', 'role': 'manager'},
#     {'_id': 'F04', 'password': 'adminpass', 'role': 'full'},
#     {'_id': 'F05', 'password': 'adminpass', 'role': 'full'},
#     {'_id': 'F06', 'password': 'adminpass', 'role': 'full'},
#     {'_id': 'F07', 'password': 'adminpass', 'role': 'full'},
#     {'_id': 'P01', 'password': 'adminpass', 'role': 'part'},
#     {'_id': 'P02', 'password': 'adminpass', 'role': 'part'},
#     {'_id': 'P03', 'password': 'adminpass', 'role': 'part'},
#     {'_id': 'P04', 'password': 'adminpass', 'role': 'part'},
#     {'_id': 'P05', 'password': 'adminpass', 'role': 'part'}
# ])

# Initialize MongoDB users collection
# mongo.db.availability.insert_many([
#     {'_id': 'F01', 'availability': ["Monday1", "Monday2", "Tuesday1", "Tuesday2", "Wednesday1", "Wednesday2", "Thursday1", "Thursday2", "Friday1", "Friday2", "Saturday1", "Saturday2", "Sunday1", "Sunday2"]}, 
#     {'_id': 'F02', 'availability': ["Monday1", "Monday2", "Tuesday1", "Tuesday2", "Wednesday1", "Wednesday2", "Thursday1", "Thursday2", "Friday1", "Friday2", "Saturday1", "Saturday2", "Sunday1", "Sunday2"]},
#     {'_id': 'F03', 'availability': ["Monday1", "Monday2", "Tuesday1", "Tuesday2", "Wednesday1", "Wednesday2", "Thursday1", "Thursday2", "Friday1", "Friday2", "Saturday1", "Saturday2", "Sunday1", "Sunday2"]},
#     {'_id': 'F04', 'availability': ["Monday1", "Monday2", "Tuesday1", "Tuesday2", "Wednesday1", "Wednesday2", "Thursday1", "Thursday2", "Friday1", "Friday2", "Saturday1", "Saturday2", "Sunday1", "Sunday2"]},
#     {'_id': 'F05', 'availability': ["Monday1", "Monday2", "Tuesday1", "Tuesday2", "Wednesday1", "Wednesday2", "Thursday1", "Thursday2", "Friday1", "Friday2", "Saturday1", "Saturday2", "Sunday1", "Sunday2"]},
#     {'_id': 'F06', 'availability': ["Monday1", "Monday2", "Tuesday1", "Tuesday2", "Wednesday1", "Wednesday2", "Thursday1", "Thursday2", "Friday1", "Friday2", "Saturday1", "Saturday2", "Sunday1", "Sunday2"]},
#     {'_id': 'F07', 'availability': ["Monday1", "Monday2", "Tuesday1", "Tuesday2", "Wednesday1", "Wednesday2", "Thursday1", "Thursday2", "Friday1", "Friday2", "Saturday1", "Saturday2", "Sunday1", "Sunday2"]},
#     {'_id': 'P01', 'availability': ["Monday1", "Monday2", "Tuesday1", "Tuesday2", "Wednesday1", "Wednesday2", "Thursday1", "Thursday2", "Friday1", "Friday2", "Saturday1", "Saturday2", "Sunday1", "Sunday2"]},
#     {'_id': 'P02', 'availability': ["Monday1", "Monday2", "Tuesday1", "Tuesday2", "Wednesday1", "Wednesday2", "Thursday1", "Thursday2", "Friday1", "Friday2", "Saturday1", "Saturday2", "Sunday1", "Sunday2"]},
#     {'_id': 'P03', 'availability': ["Monday1", "Monday2", "Tuesday1", "Tuesday2", "Wednesday1", "Wednesday2", "Thursday1", "Thursday2", "Friday1", "Friday2", "Saturday1", "Saturday2", "Sunday1", "Sunday2"]},
#     {'_id': 'P04', 'availability': ["Monday1", "Monday2", "Tuesday1", "Tuesday2", "Wednesday1", "Wednesday2", "Thursday1", "Thursday2", "Friday1", "Friday2", "Saturday1", "Saturday2", "Sunday1", "Sunday2"]},
#     {'_id': 'P05', 'availability': ["Monday1", "Monday2", "Tuesday1", "Tuesday2", "Wednesday1", "Wednesday2", "Thursday1", "Thursday2", "Friday1", "Friday2", "Saturday1", "Saturday2", "Sunday1", "Sunday2"]}  
# ])


#API: Login
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    user = mongo.db.users.find_one({"_id": username, "password": password})
    if not user:
        return jsonify({'message': 'Invalid credentials'}), 401
    return jsonify({'message': 'Login successful', 'role': user['role']})

#API: Staff Management
@app.route('/staff', methods=['POST'])
def add_staff():
    if request.headers.get('Role') != 'manager':
        abort(403)
    data = request.get_json()
    mongo.db.users.update_one({"_id": data['_id']}, {"$set": data}, upsert=True)
    return jsonify({'message': 'Staff added'})

@app.route('/staff/<staff_id>', methods=['DELETE'])
def remove_staff(staff_id):
    if request.headers.get('Role') != 'manager':
        abort(403)
    result = mongo.db.users.delete_one({"_id": staff_id})
    mongo.db.availability.delete_one({"_id": staff_id})
    if result.deleted_count:
        return jsonify({'message': 'Staff removed'})
    else:
        return jsonify({'message': 'Staff not found'}), 404

@app.route('/userlist', methods=['GET'])
def get_user_list():
    return jsonify(list(mongo.db.users.find()))

#API: Staff Availibility
@app.route('/availability', methods=['GET', 'PUT'])
def manage_availability():
    if request.method == 'GET':
        availability = list(mongo.db.availability.find())
        return jsonify(availability)
    elif request.method == 'PUT':
        data = request.get_json()
        result = mongo.db.availability.update_one({"_id": data['_id']}, {"$set": {"availability": data['availability']}}, upsert=True)
        return jsonify({'message': 'Availability updated'})
    
@app.route('/availability/<staff_id>', methods=['GET'])
def get_user_availability(staff_id):
    return jsonify(mongo.db.availability.find_one({"_id": staff_id}))

#API: Customer Occupancy Forecast
@app.route('/forecast', methods=['POST'])
def forecast():
    data = request.get_json()
    start_date = data['start_date']
    forecast_data = generate_forecast(start_date)
    return jsonify(forecast_data.to_dict(orient='records'))

# #API: Timetable Allocation
# @app.route('/timetable', methods=['POST'])
# def timetable():
#     data = request.get_json()
#     start_date = data['start_date']
#     dashboard, total_cost = generate_timetable(start_date)
#     return jsonify({
#         'timetable': dashboard.to_dict(orient='index'),
#         'total_cost': total_cost
#     })

#API: Timetable Allocation
@app.route('/timetable', methods=['GET', 'POST'])
def manage_timetable():
    global is_generating_data, threading, lock, timetable, total_cost
    if request.method == 'GET':
        return jsonify({
            'timetable': timetable,
            'total_cost': total_cost,
            'is_generating': is_generating_data
        })
    elif request.method == 'POST':
        data = request.get_json()
        start_date = data['start_date']
        with lock:
            if is_generating_data:
                return jsonify({'message': 'Still generating timetable'})
            else:
                is_generating_data = True
                # generation_thread = threading.Thread(target=placeholder_generate, args=[start_date])
                generation_thread = threading.Thread(target=generate_timetable, args=[start_date])
                generation_thread.start()
                return jsonify({'message': 'Started timetable generation'})

# 'timetable' becomes a dictionary of dictionaries. Every key is a person, and the value is another dict, with keys as each shift and value of 1 or 0. 
# {'EE01': {'Monday1': -0.0, 'Monday2': 1.0, 'Tuesday1': 1.0, 'Tuesday2': 1.0, 'Wednesday1': -0.0, 'Wednesday2': 1.0, 'Thursday1': 1.0, 'Thursday2': 1.0, 'Friday1': 1.0, 'Friday2': -0.0, 'Saturday1': 1.0, 'Saturday2': -0.0, 'Sunday1': 1.0, 'Sunday2': 1.0}, 
#  'EE02': {'Monday1': 1.0, 'Monday2': 1.0, 'Tuesday1': 0.0, 'Tuesday2': 1.0, 'Wednesday1': 1.0, 'Wednesday2': 1.0, 'Thursday1': 0.0, 'Thursday2': 1.0, 'Friday1': 1.0, 'Friday2': 1.0, 'Saturday1': -0.0, 'Saturday2': 1.0, 'Sunday1': 1.0, 'Sunday2': -0.0}, 
#  'EE03': {'Monday1': 1.0, 'Monday2': 1.0, 'Tuesday1': 1.0, 'Tuesday2': -0.0, 'Wednesday1': 0.0, 'Wednesday2': 1.0, 'Thursday1': 1.0, 'Thursday2': 1.0, 'Friday1': 1.0, 'Friday2': 1.0, 'Saturday1': -0.0, 'Saturday2': 1.0, 'Sunday1': -0.0, 'Sunday2': 1.0}, 
#  'EE04': {'Monday1': 1.0, 'Monday2': 1.0, 'Tuesday1': 1.0, 'Tuesday2': 1.0, 'Wednesday1': 1.0, 'Wednesday2': -0.0, 'Thursday1': 1.0, 'Thursday2': -0.0, 'Friday1': 1.0, 'Friday2': -0.0, 'Saturday1': 0.0, 'Saturday2': 1.0, 'Sunday1': 1.0, 'Sunday2': 1.0}, 
#  'EE05': {'Monday1': 1.0, 'Monday2': 1.0, 'Tuesday1': 0.0, 'Tuesday2': 1.0, 'Wednesday1': -0.0, 'Wednesday2': -0.0, 'Thursday1': 1.0, 'Thursday2': 1.0, 'Friday1': 1.0, 'Friday2': 1.0, 'Saturday1': 1.0, 'Saturday2': 0.0, 'Sunday1': 1.0, 'Sunday2': 1.0}, 
#  'EE06': {'Monday1': 1.0, 'Monday2': 1.0, 'Tuesday1': -0.0, 'Tuesday2': 1.0, 'Wednesday1': 1.0, 'Wednesday2': 1.0, 'Thursday1': -0.0, 'Thursday2': 1.0, 'Friday1': 1.0, 'Friday2': 1.0, 'Saturday1': 1.0, 'Saturday2': 1.0, 'Sunday1': -0.0, 'Sunday2': -0.0}, 
#  'EE07': {'Monday1': 1.0, 'Monday2': 1.0, 'Tuesday1': 0.0, 'Tuesday2': 1.0, 'Wednesday1': 1.0, 'Wednesday2': -0.0, 'Thursday1': 1.0, 'Thursday2': -0.0, 'Friday1': -0.0, 'Friday2': 1.0, 'Saturday1': 1.0, 'Saturday2': 1.0, 'Sunday1': 1.0, 'Sunday2': 1.0}, 
#  'EE08': {'Monday1': -0.0, 'Monday2': -0.0, 'Tuesday1': 1.0, 'Tuesday2': -0.0, 'Wednesday1': 1.0, 'Wednesday2': 1.0, 'Thursday1': 0.0, 'Thursday2': 1.0, 'Friday1': -0.0, 'Friday2': -0.0, 'Saturday1': 1.0, 'Saturday2': 1.0, 'Sunday1': 1.0, 'Sunday2': 1.0}, 
#  'EE09': {'Monday1': 1.0, 'Monday2': 1.0, 'Tuesday1': -0.0, 'Tuesday2': -0.0, 'Wednesday1': 1.0, 'Wednesday2': -0.0, 'Thursday1': 1.0, 'Thursday2': -0.0, 'Friday1': -0.0, 'Friday2': 1.0, 'Saturday1': 1.0, 'Saturday2': -0.0, 'Sunday1': 1.0, 'Sunday2': -0.0}, 
#  'EE10': {'Monday1': 0.0, 'Monday2': -0.0, 'Tuesday1': 1.0, 'Tuesday2': 0.0, 'Wednesday1': -0.0, 'Wednesday2': 1.0, 'Thursday1': -0.0, 'Thursday2': -0.0, 'Friday1': 1.0, 'Friday2': 1.0, 'Saturday1': 1.0, 'Saturday2': 1.0, 'Sunday1': -0.0, 'Sunday2': 1.0}, 
#  'EE11': {'Monday1': -0.0, 'Monday2': 1.0, 'Tuesday1': 1.0, 'Tuesday2': 1.0, 'Wednesday1': 1.0, 'Wednesday2': 1.0, 'Thursday1': -0.0, 'Thursday2': 1.0, 'Friday1': -0.0, 'Friday2': 1.0, 'Saturday1': -0.0, 'Saturday2': -0.0, 'Sunday1': 1.0, 'Sunday2': 1.0}, 
#  'EE12': {'Monday1': 1.0, 'Monday2': 1.0, 'Tuesday1': 1.0, 'Tuesday2': 1.0, 'Wednesday1': -0.0, 'Wednesday2': 1.0, 'Thursday1': 1.0, 'Thursday2': -0.0, 'Friday1': -0.0, 'Friday2': -0.0, 'Saturday1': -0.0, 'Saturday2': 1.0, 'Sunday1': -0.0, 'Sunday2': 1.0}}

# 'total_cost'
# '7125.0'

if __name__ == '__main__':
    app.run(port=5000)