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


app = Flask(__name__)
from flask_cors import CORS
CORS(app)

# MongoDB Configuration
app.config["MONGO_URI"] = "mongodb://localhost:27017/mydatabase"
mongo = PyMongo(app)


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
    future= futureb[(futureb.hour >= 10) & (futureb.hour <= 21)]
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
    'manager': 75
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
        
    return dashboard, str(model.ObjVal)
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