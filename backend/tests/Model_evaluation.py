import pandas as pd
from prophet import Prophet
import matplotlib.pyplot as plt
from sklearn.metrics import mean_squared_error, r2_score

# Step 1: Load dataset
data = pd.read_csv("synthetic_final_poisson.csv")

# Step 2: Data Preprocessing
# Convert Timestamp column to datetime format
data['Timestamp'] = pd.to_datetime(data['Timestamp'])
# Convert Events_or_Holidays to boolean and make Day_of_Week into separate features
data['Events_or_Holidays'] = data['Events_or_Holidays'].notnull()
data = pd.get_dummies(data, columns=["Day_of_Week"])

# Step 3: Model Training
# Filter data for training (years 2018-2022)
train_data = data[(data['Timestamp'].dt.year >= 2018) & (data['Timestamp'].dt.year <= 2022)]
# Prepare data in Prophet format
prophet_train_data = pd.DataFrame()
prophet_train_data['ds'] = train_data['Timestamp']
prophet_train_data['y'] = train_data['Total_Customers']
# Add Events_or_Holidays as an additional regressor
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
#What happens if growth changes?
#Add regressors
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

# Step 4: Model Testing (Using year 2023)
prediction_date = pd.to_datetime('2023-01-01 10:00')  
end_date=pd.to_datetime('2023-12-31 21:00') 
futureb = pd.date_range(prediction_date, end_date, freq='H')
future= futureb[(futureb.hour >= 10) & (futureb.hour <= 21)]

# Make predictions
future_df = pd.DataFrame({'ds': future})

# Set the capacity for future predictions
future_df['cap'] = cap

# Include Events_or_Holidays for future predictions (apply 2023 events only)
future_df['events'] = data[data['Timestamp'].dt.year == 2023]['Events_or_Holidays'].reset_index(drop=True)
future_df['Mon'] = data[data['Timestamp'].dt.year == 2023]['Day_of_Week_Monday'].reset_index(drop=True)
future_df['Tue'] = data[data['Timestamp'].dt.year == 2023]['Day_of_Week_Tuesday'].reset_index(drop=True)
future_df['Wed'] = data[data['Timestamp'].dt.year == 2023]['Day_of_Week_Wednesday'].reset_index(drop=True)
future_df['Thu'] = data[data['Timestamp'].dt.year == 2023]['Day_of_Week_Thursday'].reset_index(drop=True)
future_df['Fri'] = data[data['Timestamp'].dt.year == 2023]['Day_of_Week_Friday'].reset_index(drop=True)
future_df['Sat'] = data[data['Timestamp'].dt.year == 2023]['Day_of_Week_Saturday'].reset_index(drop=True)
future_df['Sun'] = data[data['Timestamp'].dt.year == 2023]['Day_of_Week_Sunday'].reset_index(drop=True)

forecast = model.predict(future_df)

y_test = data[data['Timestamp'].dt.year == 2023]['Total_Customers'].reset_index(drop=True)
predictions_df = pd.DataFrame({"Actual": y_test, "Predicted": forecast["yhat"]})

r2=r2_score(y_test, forecast["yhat"])
print("R^2: {:.2f}".format(r2))
mse=mean_squared_error(y_test, forecast["yhat"])
print("MSE: {:.2f}".format(mse))
temp = predictions_df[predictions_df["Actual"] != 0] #only include rows without 0 values
absolute_percentage_errors = (temp["Actual"] - temp["Predicted"]).abs() / y_test
mape = absolute_percentage_errors.mean() * 100
print("MAPE: {:.2f}%".format(mape))

# R^2: 0.56
# MSE: 1733.82
# MAPE: 45.37%