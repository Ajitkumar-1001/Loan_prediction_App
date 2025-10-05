# %%
import pandas as pd 
import numpy as np 
import seaborn as sns 
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error,root_mean_squared_error


import sys 
from pathlib import Path 
sys.path.append(str(Path().resolve().parent))

from App_files.dataframe_loader import df_loader
from App_files.feature_engineering import feature_engineered
from App_files.data_loader import target_risk, train_test_split
from sklearn.preprocessing import StandardScaler


# %%
from sklearn.linear_model import (
    LinearRegression, Ridge, Lasso, ElasticNet, BayesianRidge, HuberRegressor
)
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import (
    RandomForestRegressor, GradientBoostingRegressor, AdaBoostRegressor, ExtraTreesRegressor
)
from sklearn.svm import SVR
from sklearn.neighbors import KNeighborsRegressor

# Optional (only if installed)
try:
    from xgboost import XGBRegressor
except ImportError:
    XGBRegressor = None

try:
    from lightgbm import LGBMRegressor
except ImportError:
    LGBMRegressor = None

# %%
df = df_loader()

# %%
df = feature_engineered(df)

# %%
df.columns

# %%
drop_irrelevants = ["ApplicantID","ApplicationDate","HomeOwnershipStatus","Age"]
drop_leakage = ["LoanApproved","TotalDebtToIncomeRatio","CreditScore",'InterestRate', 'BaselInterestRate',]

df = df.drop(columns=drop_irrelevants, errors="ignore")


# %%
df = df.drop(columns=drop_leakage, errors="ignore")

# %%
df

# %%
X,y = target_risk(df)
print(y)

# %%
X_Train,X_Test,y_Train,y_Test = train_test_split(X,y,random_state=42,test_size=0.2)

# %%
# print(df["CreditScore"])

# %%
# print(X_Train.dtypes[X_Train.dtypes == 'object'])


# %%
# 1. Convert ApplicationDate to datetime and extract year/month
# X_Train["ApplicationDate"] = pd.to_datetime(X_Train["ApplicationDate"], errors='coerce')
# X_Train["AppYear"] = X_Train["ApplicationDate"].dt.year
# X_Train["AppMonth"] = X_Train["ApplicationDate"].dt.month
# X_Train = X_Train.drop(columns=["ApplicationDate"])

# X_Test["ApplicationDate"] = pd.to_datetime(X_Test["ApplicationDate"], errors='coerce')
# X_Test["AppYear"] = X_Test["ApplicationDate"].dt.year
# X_Test["AppMonth"] = X_Test["ApplicationDate"].dt.month
# X_Test = X_Test.drop(columns=["ApplicationDate"])

# 2. One-hot encode categorical columns
categorical_cols = [
    "MaritalStatus", "HomeOwnershipStatus", "EmploymentStatus",
    "EducationLevel", "LoanPurpose"
]

available_cats = [col for col in categorical_cols if col in X_Train.columns]

X_Train = pd.get_dummies(X_Train, columns=available_cats)
X_Test = pd.get_dummies(X_Test, columns=available_cats)



# 3. Align test columns with train (important after one-hot encoding)
X_Train, X_Test = X_Train.align(X_Test, join='left', axis=1, fill_value=0)


# %%
model = RandomForestRegressor() 
model.fit(X_Train,y_Train)

# %%
y_pred = model.predict(X_Test)

# %%
mse = mean_squared_error(y_Test, y_pred)
print(mse)

# %%
r2 = r2_score(y_Test,y_pred)
print(r2)

# %%
rmse = root_mean_squared_error(y_Test,y_pred)
print(rmse)

# %%
features = pd.Series(model.feature_importances_, index=X_Train.columns)
features.sort_values().plot(kind="barh", title="Feature Importance", figsize=(12,12))

# %%
final_features = ["MonthlyIncome","AnnualIncome","SavingsAccountBalance","NetWorth","BankruptcyHistory","PreviousLoanDefaults","TotalAssets","TotalLiabilities"]

# %%
X_Train_filtered = X_Train[final_features]
X_Test_filtered = X_Test[final_features]

# %%
model = RandomForestRegressor(random_state=42)
model.fit(X_Train_filtered,y_Train)


# %%
y_Predicted = model.predict(X_Test_filtered)

# %%
mse = mean_squared_error(y_Test,y_Predicted)
rmse = root_mean_squared_error(y_Test,y_Predicted)
R2 = r2_score(y_Test,y_Predicted)

# %%
Names = ["Root Mean Squared Error","Mean Squared Error","R2 score"]
values = [rmse,mse,R2]

Metrics=dict()
for k,v in zip(Names,values):
    Metrics[k] = [v]



# %%
print(Metrics)

# %%
regressors = {
    "LinearRegression": LinearRegression(),
    "Ridge": Ridge(alpha=1.0),
    "Lasso": Lasso(alpha=0.01),
    "ElasticNet": ElasticNet(alpha=0.01, l1_ratio=0.5),
    "BayesianRidge": BayesianRidge(),
    "HuberRegressor": HuberRegressor(),

    "DecisionTree": DecisionTreeRegressor(),
    "RandomForest": RandomForestRegressor(n_estimators=100),
    "ExtraTrees": ExtraTreesRegressor(n_estimators=100),
    "GradientBoosting": GradientBoostingRegressor(),
    "AdaBoost": AdaBoostRegressor(),

    "SVR": SVR(kernel='rbf', C=1.0, epsilon=0.2),
    "KNeighbors": KNeighborsRegressor(n_neighbors=5),
}

# Add optional ones if installed
if XGBRegressor:
    regressors["XGBoost"] = XGBRegressor()
if LGBMRegressor:
    regressors["LightGBM"] = LGBMRegressor()

# %%
final_features = [
    "MonthlyIncome", "AnnualIncome", "SavingsAccountBalance", "NetWorth",
    "BankruptcyHistory", "PreviousLoanDefaults", "TotalAssets", "TotalLiabilities"
]
target_column = "RiskScore"

df = df.dropna(subset=final_features + [target_column])


X = df[final_features]
y = df[target_column]


X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)


scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)
X_test_scaled = scaler.transform(X_test)

models = {
    "LinearRegression": LinearRegression(),
    "Ridge": Ridge(),
    "Lasso": Lasso(),
    "ElasticNet": ElasticNet(),
    "BayesianRidge": BayesianRidge(),
    "SVR": SVR(),
    "RandomForest": RandomForestRegressor(random_state=42),
    "GradientBoosting": GradientBoostingRegressor(random_state=42),
    "XGBRegressor": XGBRegressor(random_state=42, verbosity=0)
}


results = []

for name, model in models.items():
    model.fit(X_train_scaled, y_train)
    y_pred = model.predict(X_test_scaled)

    mse = mean_squared_error(y_test, y_pred)
    rmse = np.sqrt(mse)
    r2 = r2_score(y_test, y_pred)

    results.append({
        "Model": name,
        "RMSE": round(rmse, 3),
        "MSE": round(mse, 3),
        "R2 Score": round(r2, 4)
    })


results_df = pd.DataFrame(results).sort_values(by="R2 Score", ascending=False).reset_index(drop=True)
print(results_df)

# %%
final_riskscore = models["GradientBoosting"]


# %%
final_riskscore.fit(X_train_scaled,y_train)

# %%
predict = final_riskscore.predict(X_test_scaled)



# %%
rmse = root_mean_squared_error(y_test,predict)
print(round(rmse,3))

# %%
import joblib

joblib.dump(final_riskscore,"Final_riskscore_pred.pkl")


