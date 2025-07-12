import pandas as pd 

def load_file(path):
    if str(path).endswith(".csv"):

        try:
            return pd.read_csv(path)
        except Exception as e:
             raise ValueError(str(e))


    

    