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



yaml_path = Path(__file__).resolve().parent.parent / "config" / "config.yaml"


if not yaml_path.exists():
    raise FileNotFoundError(f"Config file not found at: {yaml_path}")

try:
    with open(yaml_path, 'r') as f:
        Conf = yaml.safe_load(f)
except Exception as e: 
    raise ValueError(f"Failed to load config.yaml: {e}")

dagshub_user = Conf.get("dagshub", {}).get("repo_owner")
dagshub_repo = Conf.get("dagshub", {}).get("repo_name")

dagshub_cfg = Conf.get("dagshub", {})
mlflow_cfg = Conf.get("mlflow", {})

use_dagshub = dagshub_cfg.get("use_mlflow", False)
mlflow_uri = dagshub_cfg.get("mlflow_uri")

if use_dagshub and mlflow_uri:
    mlflow.set_tracking_uri(mlflow_uri)
else:
    mlflow.set_tracking_uri("mlruns")

mlflow_experiment_name = Conf.get("mlflow", {}).get("set_experiment_2")

if mlflow_experiment_name is None:
    raise ValueError("Missing 'set_experiment_2' under 'mlflow' in config.yaml")



def Apply_pca(X, n_components=None):
    assert n_components is not None and n_components > 1, "n_components must be > 1"
    
    scaler = StandardScaler() 
    scaled_input = scaler.fit_transform(X)

    pca_model = PCA(n_components=n_components)
    X_pca = pca_model.fit_transform(scaled_input)

    return pca_model, X_pca


def PCA_pipeline(X, experiment_name, n_components=None):
    mlflow.set_experiment(experiment_name)

    with mlflow.start_run(run_name="PCA dim run"):
        pca_model, X_pca = Apply_pca(X, n_components=n_components)

        # Log explained variance
        explained_variance = pca_model.explained_variance_ratio_
        for i, var in enumerate(explained_variance):
            mlflow.log_metric(f"Explained_variance_PCA_{i+1}", var)

        mlflow.log_param("Number of Components", pca_model.n_components_)

        # Generate and log scree plot
        scree_plot_path = pca_scree_plot(pca_model)

        if scree_plot_path and os.path.exists(scree_plot_path):
            mlflow.log_artifact(scree_plot_path)

        return X_pca, pca_model
        

