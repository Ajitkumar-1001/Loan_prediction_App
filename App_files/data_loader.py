import pandas as pd 
from sklearn.model_selection import train_test_split 


def load_file(path):
    if str(path).endswith(".csv"):

        try:
            return pd.read_csv(path)
        except Exception as e:
             raise ValueError(str(e))
    else:
        raise ValueError("Unsupported file format. Only .csv is allowed.")
    

def target_feature(df):
    
    target_column = "LoanApproved"

    if target_column not in df.columns:
        print(f"The target column {target_column} is not present in the dataframe ")


    features = df.drop(columns= [target_column])
    target = df[target_column]

    return features,target


def data_split(X,y): 

    X_train,X_test,y_train,y_test = train_test_split(X,y,test_size=0.2,stratify=y, random_state=42)

    return X_train,X_test,y_train,y_test
    

__all__ = ["load_file", "target_feature", "data_split"]
