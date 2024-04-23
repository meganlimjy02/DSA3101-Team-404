import pandas as pd
import numpy as np
import os as os
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score, mean_squared_error

# Read the CSV file into a DataFrame
new_directory = 'C:/Users/Yi Ling/Desktop/NUS/DSA3101/Project Data'
os.chdir(new_directory)
df = pd.read_csv('synthetic_d4_normal.csv')

# Convert 'Timestamp' column to datetime
df['Timestamp'] = pd.to_datetime(df['Timestamp'])

# Extract relevant features from 'Timestamp' column (example)
df['Hour'] = df['Timestamp'].dt.hour
df['Day'] = df['Timestamp'].dt.day
df['Month'] = df['Timestamp'].dt.month
df['Year'] = df['Timestamp'].dt.year

df['Holiday'] = (~df['Events_or_Holidays'].isnull()).astype(int)

# holidays = df['Events_or_Holidays'].dropna().unique()

# # Create binary indicators for each holiday
# for holiday in holidays:
#     df[holiday] = (df['Events_or_Holidays'] == holiday).astype(int)


# Drop unnecessary columns
df.drop(columns=['Timestamp','Events_or_Holidays','Day_of_Week'], inplace=True)

# Split the DataFrame into features (X) and target variable (y)
X = df.drop(columns=['Total_Customers','Reservation_Number','Walkin_Number','Revenue'])
y = df['Total_Customers']

# Split the data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.33333, shuffle=False)


print(y_train)

# Train the multiple linear regression model
model = LinearRegression()
model.fit(X_train, y_train)

# Calculate R^2 score on the testing dataset
predictions = model.predict(X_test)
r2 = r2_score(y_test, predictions)
print("\nR^2 score:", r2)

# Additional metrics
mse = mean_squared_error(y_test, predictions)
print("Mean Squared Error (MSE):", mse)

def mean_absolute_percentage_error(y_true, y_pred): 
    y_true, y_pred = np.array(y_true), np.array(y_pred)
    return np.mean(np.abs((y_true - y_pred) / y_true)) * 100

non_zero_indices = y_test != 0
y_true_filtered = y_test[non_zero_indices]
predictions_filtered = predictions[non_zero_indices]

# Calculate MAPE for filtered values
mape = mean_absolute_percentage_error(y_true_filtered, predictions_filtered)
print("Mean Absolute Percentage Error (MAPE) for non-zero values:", mape)


# Predict total customers for a certain day (example)
# Make sure to provide the correct values for the features
new_data = {
    'Hour': 15,
    'Day': 4,
    'Month': 2,
    'Year': 2023,
    'Holiday': 0
}
new_X = pd.DataFrame([new_data])
predicted_customers = model.predict(new_X)
print("Predicted total customers:", predicted_customers)

predictions_df = pd.DataFrame({"Actual": y_test, "Predicted": predictions})
predictions_df.describe()

# R^2 score: 0.11483808006830276
# Mean Squared Error (MSE): 3605.0994516316146
# Mean Absolute Percentage Error (MAPE) for non-zero values: 87.1170193738341
