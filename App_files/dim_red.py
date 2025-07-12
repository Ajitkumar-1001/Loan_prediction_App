import os 
import pandas as pd 
import numpy as np 
from sklearn.decomposition import PCA 
from sklearn.preprocessing import StandardScaler 
from pathlib import Path
from config import config 
import yaml 
import mlflow 
from visualizations.pca_plots import pca_scree_plot



yaml_path = Path(__file__).resolve().parent.parent / "config.yaml"

if yaml_path.exists(): 
    try:
        with open(yaml_path,'r') as f:
            Conf = yaml.safe_load(f)
    
    except Exception as e: 
        raise ValueError(str(e))
    
set_experiment = Conf.get("mlflow",{}).get("set_experiment_2")


def Apply_pca(X,n_components = None):
    assert n_components is not None 
    assert n_components > 1 

    scaler = StandardScaler() 
    scaled_input = scaler.fit_transform(X)

    Pca_model  = PCA(n_components=n_components)
    X_Pca = Pca_model.fit_transform(scaled_input)

    return Pca_model, X_Pca

def PCA_pipeline(X, set_experiment, n_components=None):

    mlflow.set_experiment(set_experiment)

    with mlflow.start_run(run_name = "PCA dim run"):
        Pca_model,X_Pca = Apply_pca(X=X,n_components = n_components)

        explained_Variance = Pca_model.explained_variance_ratio_
        for i, var in enumerate(explained_Variance):
            mlflow.log_metric(f"Explained_variance_PCA_{i+1}",var)

        mlflow.log_param("Number of Components",Pca_model.n_components_)

        scree_plot = pca_scree_plot(Pca_model)
        
        if os.path.exists(scree_plot):
            mlflow.log_artifact(scree_plot)

        return X_Pca,Pca_model

        

