import numpy as np 
import pandas as pd 
import yaml 
from pathlib import Path 
from sklearn.feature_selection import VarianceThreshold
from sklearn.ensemble import RandomForestClassifier

yaml_path = Path(__file__).resolve().parent.parent / "config.yaml"

if yaml_path.exists():
    try: 
        with open(yaml_path,'r') as f:
            CONF = yaml.safe_load(f)
    except Exception as e: 
        raise ImportError(str(e))
    

threshold = CONF.get("feature_selection",{}).get("threshold")
variance_threshold = CONF.get("feature_selection",{}).get("variance_threshold")
top_k = CONF.get("feature_selection",{}).get("top_k")

if None in [threshold, variance_threshold, top_k]:
    raise ValueError("Missing one or more feature selection parameters in the config file.")


def correlation_Feature_selection(df,threshold):
    numeric_features = df.select_dtypes(include=["int64","float64"]).columns.to_list()
    if "LoanApproved" in numeric_features:
        numeric_features.remove("LoanApproved")



    correlation = df[numeric_features].corr().abs()
    Upper_Triangle = correlation.where(np.triu(np.ones(correlation.shape),k=1).astype(bool))

    drop_Columns = [c for c in Upper_Triangle.columns if any(Upper_Triangle[c] > threshold)]

    return [features for features in numeric_features if features not in drop_Columns], drop_Columns


def variance_Feature_selection(df,variance_threshold):
    numeric_features = df.select_dtypes(include=["int64","float64"]).columns.to_list()
    if "LoanApproved" in numeric_features:
        numeric_features.remove("LoanApproved")

    vr = VarianceThreshold(variance_threshold)
    vr.fit(df[numeric_features])

    selected = [f for f,k in zip(numeric_features,vr.get_support()) if k ]

    removed  = list(set(numeric_features) - set(selected))

    return vr, removed


def importance_feature_selection(X,y,top_k):    
    rf = RandomForestClassifier(random_state = 42)
    rf.fit(X,y)

    important_features = pd.Series(rf.feature_importances_ , index=X.columns)
    top_features = important_features.sort_values(ascending=False).head(top_k).index.to_list()

    return important_features, top_features



                                 


    


