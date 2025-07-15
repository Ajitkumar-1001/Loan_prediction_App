import yaml 
from pathlib import Path 
import sys 
sys.path.append(str(Path(__file__).resolve().parent.parent))
import mlflow 
import mlflow.sklearn
from config.config import logger
from sklearn.pipeline import Pipeline
from sklearn.metrics import accuracy_score,f1_score
from dotenv import load_dotenv 

import os 

env_path = Path(__file__).resolve().parent / ".env"

yaml_path = Path(__file__).resolve().parent.parent / "config" / "config.yaml"

if yaml_path.exists():
    try: 
        with open(yaml_path,'r') as f: 
           Conf = yaml.safe_load(f)
    except Exception as e:
        raise ValueError(str(e))
    
experimentname = Conf.get("mlflow",{}).get("set_experiment_1")


def log_model_with_mlflow(
    name: str,
    model,
    preprocessor,
    X_train,
    X_test,
    y_train,
    y_test,
    
):
    experiment_name = experimentname
    assert name is not None 

    load_dotenv(dotenv_path=env_path) 


    username = Conf.get("dagshub",{}).get("repo_owner")
    key = os.getenv("DAGSHUB_ACCESS_KEY")
    uri = Conf.get("dagshub",{}).get("mlflow_uri")


    if not key:
        raise ValueError("DAGSHUB_ACCESS_KEY not found. Make sure it's defined in your .env file.")


    os.environ["MLFLOW_TRACKING_USERNAME"] = username
    os.environ["MLFLOW_TRACKING_PASSWORD"] = key

    mlflow.set_tracking_uri(uri)
    mlflow.set_experiment(experiment_name)

    with mlflow.start_run(run_name=name):
        pipeline = Pipeline(steps=[
            ('preprocessor', preprocessor),
            ('classifier', model)
        ])
        
        if hasattr(X_train, "toarray"):
            X_train = X_train.toarray()
            X_test = X_test.toarray()

        pipeline.fit(X_train, y_train)
        preds = pipeline.predict(X_test)

        acc = accuracy_score(y_test, preds)
        f1 = f1_score(y_test, preds, average='weighted')

        mlflow.log_param("model", name)
        mlflow.log_metric("accuracy", acc)
        mlflow.log_metric("f1_score", f1)

        # mlflow.sklearn.log_model(pipeline, artifact_path=f"{name}_pipeline")

        logger.info(f"✅ {name} → Accuracy: {acc:.4f}, F1 Score: {f1:.4f}")

        return acc,f1

if __name__ == "__main__":
    logger.info("🚀 Running the pipeline build train")
    
    logger.info("✅ logged success")