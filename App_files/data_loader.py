import pandas as pd 

def load_file(path):
    if str(path).endswith(".csv"):

        try:
            return pd.read_csv(path)
        except Exception as e:
             raise ValueError(str(e))

def target_feature(df, target_column):
    target_column = "LoanApproved"

    if target_column not in df.columns:
        print(f"The target column {target_column} is not present in the dataframe ")
        

    features = df.drop(columns= [target_column])
    target = df[target_column]

    return features,target


    

    