# import yaml 
# from pathlib import Path 
# import sys 
# sys.path.append(str(Path(__file__).resolve().parent.parent))
# import mlflow 
# import mlflow.sklearn
# from config.config import logger
# from sklearn.pipeline import Pipeline
# from sklearn.metrics import accuracy_score,f1_score
# from imblearn.pipeline import Pipeline
# from imblearn.over_sampling import SMOTE
# from dotenv import load_dotenv 

# import os 

# env_path = Path(__file__).resolve().parent / ".env"

# yaml_path = Path(__file__).resolve().parent.parent / "config" / "config.yaml"

# if yaml_path.exists():
#     try: 
#         with open(yaml_path,'r') as f: 
#            Conf = yaml.safe_load(f)
#     except Exception as e:
#         raise ValueError(str(e))
    
# experimentname = Conf.get("mlflow",{}).get("set_experiment_1")


# def log_model_with_mlflow(
#     name: str,
#     model,
#     preprocessor,
#     X_train,
#     X_test,
#     y_train,
#     y_test,
    
# ):
#     experiment_name = experimentname
#     assert name is not None 

#     load_dotenv(dotenv_path=env_path) 


#     username = Conf.get("dagshub",{}).get("repo_owner")
#     key = os.getenv("DAGSHUB_ACCESS_KEY")
#     uri = Conf.get("dagshub",{}).get("mlflow_uri")


#     if not key:
#         raise ValueError("DAGSHUB_ACCESS_KEY not found. Make sure it's defined in your .env file.")


#     os.environ["MLFLOW_TRACKING_USERNAME"] = username
#     os.environ["MLFLOW_TRACKING_PASSWORD"] = key

#     mlflow.set_tracking_uri(uri)
#     mlflow.set_experiment(experiment_name)

#     with mlflow.start_run(run_name=name):
#         pipeline = Pipeline(steps=[
#             ('preprocessor', preprocessor),
#             ("smote", SMOTE(sampling_strategy=1.0, random_state=42, k_neighbors=5),
#             ('classifier', model)
#         ])
        
#         if hasattr(X_train, "toarray"):
#             X_train = X_train.toarray()
#             X_test = X_test.toarray()

#         pipeline.fit(X_train, y_train)
#         preds = pipeline.predict(X_test)

#         acc = accuracy_score(y_test, preds)
#         f1 = f1_score(y_test, preds, average='weighted')

#         mlflow.log_param("model", name)
#         mlflow.log_metric("accuracy", acc)
#         mlflow.log_metric("f1_score", f1)

#         # mlflow.sklearn.log_model(pipeline, artifact_path=f"{name}_pipeline")

#         logger.info(f"✅ {name} → Accuracy: {acc:.4f}, F1 Score: {f1:.4f}")

#         return acc,f1

# if __name__ == "__main__":
#     logger.info("🚀 Running the pipeline build train")
    
#     logger.info("✅ logged success")



import os
import yaml
from pathlib import Path
import sys
from collections import Counter

sys.path.append(str(Path(__file__).resolve().parent.parent))

import mlflow
import mlflow.sklearn

from dotenv import load_dotenv
from config.config import logger

import numpy as np
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    precision_score,
    recall_score,
    roc_auc_score,
    average_precision_score,
)
from sklearn.preprocessing import FunctionTransformer
from imblearn.pipeline import Pipeline as ImbPipeline
from imblearn.over_sampling import SMOTE


# ---- config load ----
env_path = Path(__file__).resolve().parent / ".env"
yaml_path = Path(__file__).resolve().parent.parent / "config" / "config.yaml"

with open(yaml_path, "r") as f:
    Conf = yaml.safe_load(f)

EXPERIMENT_NAME = Conf.get("mlflow", {}).get("set_experiment_1")


def _densify(x):
    return x.toarray() if hasattr(x, "toarray") else x


def _resolve_smote_strategy(
    y_train,
    sampling_strategy: float | dict | str,
    rejected_label=0,
):
    """
    Default behavior balances the rejected class ("No"/0) to the majority class size.
    Falls back to standard SMOTE strategy when rejected label is not available.
    """
    if sampling_strategy != "rejected_to_majority":
        return sampling_strategy

    y_values = np.asarray(y_train).ravel().tolist()
    counts = Counter(y_values)
    if not counts:
        raise ValueError("Cannot apply SMOTE: training labels are empty.")

    if rejected_label not in counts:
        for candidate in ("No", "no", False):
            if candidate in counts:
                rejected_label = candidate
                break

    if rejected_label not in counts:
        # fallback to minority class if explicit rejected label is absent
        rejected_label = min(counts, key=counts.get)

    majority_count = max(counts.values())
    rejected_count = counts[rejected_label]
    if rejected_count >= majority_count:
        return None

    return {rejected_label: majority_count}


def log_model_with_mlflow(
    name: str,
    model,
    preprocessor,               # e.g., ColumnTransformer/Pipeline
    X_train,
    X_test,
    y_train,
    y_test,
    *,
    use_smote: bool = True,
    sampling_strategy: float | dict | str = "rejected_to_majority",
    smote_k: int = 5,
    threshold: float | None = None,  # decision cutoff; None => model default
    rejected_label=0,
):
    """
    Train and log a model with optional SMOTE. SMOTE & densify are applied ONLY on training inside the pipeline.
    """

    assert name, "Run name is required"

    load_dotenv(dotenv_path=env_path)

    username = Conf.get("dagshub", {}).get("repo_owner")
    key = os.getenv("DAGSHUB_ACCESS_KEY")
    uri = Conf.get("dagshub", {}).get("mlflow_uri")

    if not key:
        raise ValueError("DAGSHUB_ACCESS_KEY not found in .env")

    os.environ["MLFLOW_TRACKING_USERNAME"] = username
    os.environ["MLFLOW_TRACKING_PASSWORD"] = key

    mlflow.set_tracking_uri(uri)
    mlflow.set_experiment(EXPERIMENT_NAME)

    with mlflow.start_run(run_name=name):
        steps = [
            ("preprocessor", preprocessor),
            # ensure dense for SMOTE (remove if your OHE uses sparse_output=False)
            ("to_dense", FunctionTransformer(_densify, accept_sparse=True)),
        ]

        smote_strategy_to_use = _resolve_smote_strategy(
            y_train=y_train,
            sampling_strategy=sampling_strategy,
            rejected_label=rejected_label,
        )

        if use_smote:
            if smote_strategy_to_use is None:
                logger.info("SMOTE skipped: rejected class is already not a minority class.")
            else:
                steps.append(
                    (
                        "smote",
                        SMOTE(
                            sampling_strategy=smote_strategy_to_use,
                            random_state=42,
                            k_neighbors=smote_k,
                        ),
                    )
                )
        steps.append(("classifier", model))

        pipeline = ImbPipeline(steps=steps)

        # ---- fit & predict ----
        pipeline.fit(X_train, y_train)

        # choose prediction method (optional threshold)
        if threshold is not None and hasattr(pipeline, "predict_proba"):
            proba = pipeline.predict_proba(X_test)[:, 1]
            y_pred = (proba >= float(threshold)).astype(int)
        else:
            y_pred = pipeline.predict(X_test)

        # ---- metrics ----
        acc = accuracy_score(y_test, y_pred)
        f1w = f1_score(y_test, y_pred, average="weighted")
        prec = precision_score(y_test, y_pred, zero_division=0)
        rec = recall_score(y_test, y_pred, zero_division=0)

        # optional prob-based metrics
        roc = None
        ap = None
        if hasattr(pipeline, "predict_proba"):
            proba = pipeline.predict_proba(X_test)[:, 1]
            try:
                roc = roc_auc_score(y_test, proba)
                ap = average_precision_score(y_test, proba)  # PR AUC
            except Exception:
                pass

        # ---- log params & metrics ----
        mlflow.log_param("model_name", name)
        mlflow.log_param("use_smote", use_smote)
        if use_smote:
            mlflow.log_param("sampling_strategy", str(smote_strategy_to_use))
            mlflow.log_param("smote_k_neighbors", smote_k)
            mlflow.log_param("rejected_label", rejected_label)
        if threshold is not None:
            mlflow.log_param("decision_threshold", threshold)

        mlflow.log_metric("accuracy", acc)
        mlflow.log_metric("f1_weighted", f1w)
        mlflow.log_metric("precision", prec)
        mlflow.log_metric("recall", rec)
        if roc is not None:
            mlflow.log_metric("roc_auc", roc)
        if ap is not None:
            mlflow.log_metric("pr_auc", ap)

        # save the full pipeline
        mlflow.sklearn.log_model(pipeline, artifact_path=f"{name}_pipeline")

        logger.info(
            f"✅ {name} → acc={acc:.4f} f1_w={f1w:.4f} prec={prec:.4f} rec={rec:.4f}"
            + (f" roc_auc={roc:.4f}" if roc is not None else "")
            + (f" pr_auc={ap:.4f}" if ap is not None else "")
        )

        return {
            "accuracy": acc,
            "f1_weighted": f1w,
            "precision": prec,
            "recall": rec,
            "roc_auc": roc,
            "pr_auc": ap,
        }


if __name__ == "__main__":
    logger.info("🚀 Running the pipeline build train")
    logger.info("✅ logged success")
