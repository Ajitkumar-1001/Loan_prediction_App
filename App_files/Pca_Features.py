import os 
import pandas as pd 
import numpy as np 
from sklearn.decomposition import PCA 
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
    
n_components = Conf.get("Pca_feature_parameters",{}).get("n_components")



def Pca_Extracted_features(X,n_components):

    assert n_components is not None & n_components < 1

    if hasattr(X,"toarray"):
        X = X.toarray()
    
    scaler = StandardScaler()
    scaled_X  = scaler.fit_transform(X)

    pca = PCA(n_components= n_components)
    X_pca = pca.fit_transform(scaled_X)

    pca_features = [f"PCA_{i+1}" for i in range(X.shape[1])]
    pca_df = pd.DataFrame(X_pca, columns=pca_features)

    return pca_df 



