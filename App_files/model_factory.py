from sklearn.linear_model import LogisticRegression
from sklearn.linear_model import RidgeClassifier
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier

def select_model(name:str,**kwargs):

    
    name = name.lower().replace(" ","").replace("-","_")

    try : 
        if name == "logistic":
            return  LogisticRegression(max_iter = 1000, **kwargs) 
        elif name in ["ridge","ridge_"]:
            return  RidgeClassifier(**kwargs) 
        elif name in ["randomforest","random_forest"]:
            return RandomForestClassifier(random_state= 42, **kwargs) 
        elif name =="xgboost":
            return  XGBClassifier(use_label_encoder=False, eval_metric="logloss", random_state=42, **kwargs )

        else:
            raise ValueError(f"Model '{name}' is not supported.")

    except Exception as e:
        raise ValueError(f"Failed to create model '{name}': {e}")
        