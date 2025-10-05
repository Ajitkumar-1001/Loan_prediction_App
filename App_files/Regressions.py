import sys 
from pathlib import Path 
import os 
from dotenv import load_dotenv 
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.ensemble import GradientBoostingRegressor
sys.path.append(str(Path(__file__).resolve().parent))

from config.config import logger 

from App_files.dataframe_loader import df_loader
from App_files.feature_engineering import feature_engineered 

from App_files.data_loader import target_risk, train_test_split
from sklearn.preprocessing import StandardScaler





def riskscore_features(df):
    logger.info(f"Successfully retained the dataframe!, performing feature selection .....")
    features =  ["MonthlyIncome","AnnualIncome","SavingsAccountBalance","NetWorth","BankruptcyHistory","PreviousLoanDefaults","TotalAssets","TotalLiabilities"]
   
    missing_Features = [ col for col in features if col not in df.columns]
    if missing_Features: 
        logger.warning(f"The dataframe has missing features : {missing_Features}")
        return df 
    

    
    logger.info(f"Successfully done the feature selection ! and returned the dataframe!")

    return df[features] 



def riskscore_pipeline():

    df = df_loader() 

    df = feature_engineered(df)

    # target_column   = "RiskScore"
    X = riskscore_features(df)
    y = target_risk(df)

    X_train,X_test,y_train,y_test = train_test_split(X,y,test_size=0.2,random_state= 42)

    scaler = StandardScaler() 

    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)


    model = GradientBoostingRegressor(random_state=42)

    model.fit(X_train_scaled
              ,y_train)

    y_pred = model.predict(X_test_scaled)


    return y_pred ,y_test ,model



def riskscore_metrics(): 

    y_pred, y_test,_ = riskscore_pipeline() 

    r2_Score = r2_score(y_pred,y_test)
    mse = mean_squared_error(y_pred,y_test)

    logger.info(f"The metrics for the regression model for the Riskscore are , R2 : {r2_Score}, MSE : {mse}")
    
    return r2_Score,mse 





    


