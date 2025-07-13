import os 
import pandas as pd 
import numpy as np 
from sklearn.decomposition import TruncatedSVD
from sklearn.preprocessing import StandardScaler 
import yaml 
from dotenv import load_dotenv 
from pathlib import Path 

yaml_path = Path(__file__).resolve().parent.parent / "config" / "config.yaml"

if yaml_path.exists(): 
    try:
        with open(yaml_path,'r') as f: 
            Conf = yaml.safe_load(f)
    except Exception as e:
        raise ValueError(str(e))
    
n_Components = Conf.get("Pca_feature_parameters",{}).get("n_components")



def Pca_Extracted_features(X):

    n_components = n_Components

    assert n_components is not None and (isinstance(n_components, float) or isinstance(n_components, int))


    if hasattr(X,"toarray"):
        X = X.toarray()
    
    scaler = StandardScaler()
    scaled_X  = scaler.fit_transform(X)

    svd = TruncatedSVD(n_components=n_components)
    X_svd = svd.fit_transform(scaled_X)

    Svd_features = [f"PCA_{i+1}" for i in range(X_svd.shape[1])]
    Final_df = pd.DataFrame(X_svd, columns=Svd_features)

    return Final_df,Svd_features,svd



