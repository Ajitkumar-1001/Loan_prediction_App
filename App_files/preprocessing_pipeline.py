from sklearn.preprocessing import OneHotEncoder
from sklearn.preprocessing import FunctionTransformer
from sklearn.preprocessing import MinMaxScaler 
from sklearn.preprocessing import StandardScaler 
from sklearn.preprocessing import FunctionTransformer

from sklearn.pipeline import Pipeline 
from sklearn.compose import ColumnTransformer 
import numpy as np 
import pandas as pd 

def preprocessing_pipeline(df):

    log_transformer = FunctionTransformer(np.log1p , validate=True) 

    numerical_Features = df.select_dtypes(include=["int64","float64"]).colummns.to_list() 
    if "LoanApproved" in numerical_Features:
        numerical_Features.remove("LoanApproved")

    categorical_Features = df.select_dtypes(include = ["object","category"]).columns.to_list() 
    if "LoanApproved" in categorical_Features:
        categorical_Features.remove("LoanApproved")

    
    Numeric_Pipeline = Pipeline(steps=[("log",log_transformer),("scale",StandardScaler())])
    Categorical_Pipeline = Pipeline(steps=[("encoder",OneHotEncoder(handle_unknown="ignore"))])

    preprocessor = ColumnTransformer(transformers = [("num",Numeric_Pipeline,numerical_Features),("cat",Categorical_Pipeline,categorical_Features)])


    return preprocessor,numerical_Features,categorical_Features

