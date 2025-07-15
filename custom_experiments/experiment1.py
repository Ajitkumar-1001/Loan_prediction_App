import sys  
from pathlib import Path 
sys.path.append(str(Path(__file__).resolve().parent.parent)) 
import mlflow
import os 
import pandas as pd 
import yaml 
from dotenv import load_dotenv 
from sklearn.metrics import accuracy_score, f1_score
from App_files.dim_red import Apply_pca,PCA_pipeline
from config.config import logger 
from App_files.model_factory import select_model

yaml_path = Path(__file__).resolve().parent.parent / "config" / 'config.yaml'
env_path  = Path(__file__).resolve().parent / ".env"

if yaml_path.exists():
    try:
        with open(yaml_path,'r') as f:
            Conf = yaml.safe_load(f) 
    
    except Exception as e: 
        raise ValueError(str(e))

load_dotenv(dotenv_path=env_path)

username = Conf.get("dagshub",{}).get("repo_owner")
uri = Conf.get("dasghub",{}).get("mlflow_uri")
key = os.getenv("DAGSHUB_ACCESS_KEY")
n_comp = Conf.get("Pca_feature_parameters",{}).get("n_components")
experiment_name = Conf.get("mlflow", {}).get("set_experiment_3")



def pca_experiment_1(X_train,X_test,y_train,y_test):

    logger.info("Training process Initiated for the custom experiment")

    mlflow.set_tracking_uri(uri=uri)
    mlflow.set_experiment(experiment_name=experiment_name)

    with mlflow.start_run(run_name="PCA with Logisitic Regression"):

        logger.info("MLflow setup initiated")

        _,X_train_pca = Apply_pca(X=X_train,n_components=n_comp)
        _,X_test_pca = Apply_pca(X=X_test,n_components=n_comp)

        model = select_model("logistic")
        model.fit(X_train_pca,y_train)

        preds = model.predict(X_test_pca)

        acc = accuracy_score(y_test, preds)
        f1 = f1_score(y_test, preds, average='weighted')

        mlflow.log_param("model", "LogisticRegression")
        mlflow.log_param("PCA_components", n_comp)
        mlflow.log_metric("accuracy", acc)
        mlflow.log_metric("f1_score", f1)

        logger.info(f"✅ Logged PCA experiment with accuracy={acc:.4f} and f1={f1:.4f}")

        return acc,f1
    

if __name__ == "__main__":
    logger.info("Experiment started for the custom experiment 1")
    logger.info("Done with the experiment for Logistic Regression with PCA")

